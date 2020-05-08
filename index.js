const express = require("express");
const io = require("socket.io")();
const PORT = process.env.PORT || 8080;

const app = express();

app.get("/", (req, res) => res.send("App is running"));
const server = app.listen(PORT, () => console.log("server is running", PORT));

io.listen(server, { path: "/webrtc" });

const peer = io.of("/webrtcPeer");

const connectedPeers = new Map();
peer.on("connection", (socket) => {
  console.log("user connected", socket.id);
  socket.emit("connection-success", { success: socket.id });
  connectedPeers.set(socket.id, socket);

  socket.on("disconnect", () => {
    console.log("user disconnected");
    connectedPeers.delete(socket.id);
  });

  socket.on("offerOrAnswer", (data) => {
    for (const [socketID, socket] of connectedPeers.entries()) {
      if (socketID !== data.socketID) {
        console.log(socket.id, data.payload.type);
        socket.emit("offerOrAnswer", data.payload);
      }
    }
  });

  socket.on("candidate", (data) => {
    console.log("candidate", data);
    for (const [socketID, socket] of connectedPeers.entries()) {
      if (socketID !== data.socketID) {
        console.log(socket.id, data.payload.type);
        socket.emit("candidate", data.payload);
      }
    }
  });
});
