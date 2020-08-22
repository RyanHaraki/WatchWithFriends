const express = require("express");
const ejs = require("ejs");
const http = require("http");
const socket = require("socket.io");
const formatMessage = require(__dirname + "/public/messages.js");
const { userJoin, getCurrentUser, userLeft, getRoomUsers } = require(__dirname +
  "/public/users.js");

//sets up http, express, socket.io & bodyParser
const app = express();
const server = http.createServer(app);
const io = socket(server);
const botName = "FriendlyBot";

//Handles the rooms and socket connections.
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, roomid }) => {
    const user = userJoin(socket.id, username, roomid);

    socket.join(user.room);
    //Welcome current users
    socket.emit(
      "message",
      formatMessage(
        botName,
        `Welcome to ${roomid}! Send a message so everyone knows you're here.`
      )
    );

    //broadcast when user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    //Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //Listen for chat message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeft(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      //Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

//sets up port & support for static files

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/join", (req, res) => {
  res.render("join");
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.get("/room", (req, res) => {
  res.render("room");
});

server.listen(PORT, () => console.log(`Server hosted on port ${PORT}`));