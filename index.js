const express = require("express");
const ejs = require("ejs");
const socket = require("socket.io");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get('/join', (req, res) => {
    res.render('join')
})

app.listen(3000, () => console.log("Server hosted on port 3000"));
