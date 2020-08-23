const socket = io();

const chatForm = document.getElementById("chat-form");
const output = document.getElementById("output");
const roomInfo = document.getElementById("name");
const userInfo = document.getElementById("users");
const url = window.location.href;
const urlInfo = document.getElementById("urlInfo");
const watchButton = document.getElementById("watch");
const urlPaste = document.getElementById("paste");
let newUrl = "";
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

watchButton.addEventListener("click", () => {
  watchClick();
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

//Keep messages scrolled to bottom whenever message is received

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

//Youtube player
// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    videoId: "Rb0UmrCXxVA",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  //Catch a played video 1
  if (event.data == YT.PlayerState.PLAYING) {
    let playState = event.data;
    socket.emit("play", playState);
  }

  //Catch a paused video 2
  if (event.data == YT.PlayerState.PAUSED) {
    let playState = event.data;
    socket.emit("pause", playState);
  }

  //Catch a paused video

  socket.on("pause", (state) => {
    player.pauseVideo();
  });

  //Catch a played video
  socket.on("play", (state) => {
    player.playVideo();
  });
}
function stopVideo() {
  player.stopVideo();
}

//Change video being played to video in URL
function watchClick() {
  newUrl = urlPaste.value;
  urlPaste.value = "";
  //Emit new video URL to server
  socket.emit("newVideo", newUrl);
}

//Catch new video and play it for all users

socket.on("newVideo", (newUrl) => {
  let newId = newUrl.split("=");
  player.loadVideoById(newId[1], 0, "large");
});
