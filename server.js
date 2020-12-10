// CHOCOLATE CHIP COOKIES SERVER

const express = require("express");
const app = express();
const server = app.listen(process.env.PORT || 3000);
const io = require("socket.io")(server);

// Server keeps track of where everything is (players, enemies,
// boosts, decoys). Make a game state object.

// When client moves, it sends a message to the server, and
// the server updates the new client position.

// When the client sets a decoy, it informs the server, and
// the server updates the state.

// At random intervals, the server creates a boost.

// 24 times per second, the server sends the whole game state
// to all the clients, and the clients JUST DRAW.

// The clients just draws what is in the game state.

// Make sure our scripts and styles can be seen.
app.use(express.static("public"));

// The "webapp" portion just delivers the main page.
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// The real work is done with the web sockets. When a
// client connects, we set things up to respond to its
// "mouse" events by broadcasting its position to every
// other client.
const clientSockets = [];

io.on("connection", socket => {
  // if (clientSockets.length === 2) {
  //   socket.emit("error", {"message": "NO MORE ROOM ON THIS SERVER"})
  //   return;
  // }

  clientSockets.push(socket);
  // Tell each client whether they are #1 or #2
  //socket.broadcast.emit("number", {"number": clientSockets.length})

  //   socket.on("getNumber", numberData => {
  //     socket.broadcast.emit("getNumber", {"number": clientSockets.length});
  //   });

  // If a player moves, the server will tell the other player where they moved
  socket.on("player", playerData => {
    socket.broadcast.emit("player", playerData);
  });

  socket.on("decoy", decoyData => {
    socket.broadcast.emit("decoy", decoyData);
  });

  // socket.on("enemies", EnemiesData => {
  //   socket.broadcast.emit("enemies", EnemiesData);
  // });
});

// https://lmula.zoom.us/j/84068352825?pwd=aXE5eklETmpPWmxMNDJvWk9vbitKdz09
