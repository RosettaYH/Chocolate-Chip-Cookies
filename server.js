// CHOCOLATE CHIP COOKIES SERVER
const express = require("express");
const app = express();
const server = app.listen(process.env.PORT || 3000);
const io = require("socket.io")(server);

app.use(express.static("public"));

// The "webapp" portion just delivers the main page.
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/index.html");
});

// The real work is done with the web sockets. When a
// client connects, we set things up to respond to its
// "mouse" events by broadcasting its position to every
// other client.

io.on("connection", socket => {
  socket.on("player", playerData => {
    socket.broadcast.emit("player", playerData);
  });
  socket.on("decoy", decoyData => {
    socket.broadcast.emit("decoy", decoyData);
  });
});
