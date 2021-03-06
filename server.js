const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
var http = require("http").createServer(app);
app.use(express.static(path.join(__dirname, "build")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// app.listen(process.env.PORT || 8080);

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    allowedHeaders: ["Access-Control-Allow-Origin"],
  },
});

io.on("connection", (socket) => {
  // ...
  console.log("new connection");

  socket.on("joinRoom", ({ roomId, playerId }) => {
    console.log("roomId", roomId, playerId);
    socket.join(roomId);
    io.to(roomId).emit("roomJoined", { playerId });
  });

  socket.on("setGameMatrix", ({ roomId, gameMatrix }) => {
    console.log("setGameMatrix", gameMatrix);
    io.to(roomId).emit("gameMatrix", { gameMatrix });
  });

  socket.on("move", ({ pid, roomId, move }) => {
    console.log("move", move, pid);
    io.to(roomId).emit("move", { pid, move });
  });

  socket.on("setWinningResult", ({ roomId, result }) => {
    console.log("result", result);
    io.to(roomId).emit("winningResult", result);
  });

  socket.on("handleReset", ({ roomId }) => {
    console.log("handleReset");
    io.to(roomId).emit("reset");
  });
});

http.listen(process.env.PORT || 8080);
