const socket = io();

const chatForm = document.getElementById("chat-form");
const output = document.getElementById("output");
const roomInfo = document.getElementById("name");
const userInfo = document.getElementById("users");
const url = window.location.href;
const urlInfo = document.getElementById("urlInfo");

//get username and room from URL
const { username, roomid } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//Join chatroom
socket.emit("joinRoom", { username, roomid });

//Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
  setRoomLink();
});

// Message from server
socket.on("message", (message) => {
  outPutMessage(message);
});

//message submit

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const messageInput = event.target.elements.message;
  //get sent message
  const msg = messageInput.value;

  //emit message to server
  socket.emit("chatMessage", msg);

  //clear input

  messageInput.value = "";
  messageInput.focus;
});

//Output message to the DOM

function outPutMessage(message) {
  output.innerHTML += `<div id='sentText'><strong>${message.username}</strong><p>${message.text}</p><small>${message.time}</small></div>`;
  //scroll down
  output.scrollIntoView(false);
}

function reload() {
  window.scrollTo(0, 0);
}

//Add room name to DOm

function outputRoomName(room) {
  roomInfo.innerText = room;
}

function outputUsers(users) {
  if (users.length !== 1) {
    userInfo.innerText = `, ${users.length} users`;
  } else {
    userInfo.innerText = `, ${users.length} user`;
  }
}

// Set the input to the room link

function setRoomLink() {
  urlInfo.value = url;
}

// Give user ability to copy url to clipboard

function copyUrl() {
  /* Select the text field */
  urlInfo.select();
  urlInfo.setSelectionRange(0, 99999); /*For mobile devices*/

  /* Copy the text inside the text field */
  document.execCommand("copy");
}
