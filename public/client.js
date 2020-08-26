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
let PAUSE_EVT_STACK = 0;

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

//Clear input and play new video when watch button is clicked

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
  document.getElementById('button-addon2').innerText = "Copied!"
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
    videoId: "r_nK51C9Mlw",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();

  var lastTime = -1;
  var interval = 1000;

  //Time tracking starts here

  var checkPlayerTime = function () {
    if (lastTime != -1) {
      if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        var t = player.getCurrentTime();

        //console.log(Math.abs(t - lastTime -1));

        ///expecting 1 second interval , with 500 ms margin
        if (Math.abs(t - lastTime - 1) > 0.5) {
          // there was a seek occuring
          console.log("seek"); /// fire your event here !
          let seekTime = player.getCurrentTime();
          socket.emit("seek", seekTime);
        }
      }
    }
    lastTime = player.getCurrentTime();
    setTimeout(checkPlayerTime, interval); /// repeat function call in 1 second
  };
  setTimeout(checkPlayerTime, interval); /// initial call delayed
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  //Detect a played video on client side
  if (event.data == YT.PlayerState.PLAYING) {
    let playState = event.data;
    socket.emit("play", playState);
  }
  //Detect a paused video on client side
  setTimeout(function () {
    if (event.target.getPlayerState() == 2) {
      // execute your code here for paused state
      let playState = event.data;
      socket.emit("pause", playState);
    }
  }, 500);

  //Detect a buffering video on client side

  // if (event.data == YT.PlayerState.BUFFERING && player.getCurrentTime() >= 5) {
  //   let playState = event.data;
  //   socket.emit("buffering", playState);
  // }
}
function stopVideo() {
  player.stopVideo();
}

//Change video being played to video in URL
function watchClick() {
  newUrl = urlPaste.value;
  urlPaste.value = "";
  currentId = player.videoId;

  //Emit new video URL to server
  socket.emit("newVideo", newUrl);
}

//Catch a seek on the server side

socket.on("seek", (seekTime) => {
  player.seekTo(seekTime);
});

//Catch a paused video on server side

socket.on("pause", (state) => {
  player.pauseVideo();
});

//Catch a played video on server side
socket.on("play", (state) => {
  player.playVideo();
});

// // Catch a buffering video on server side
// socket.on("buffering", (state) => {
//   player.pauseVideo();
// });

//Catch new video and play it for all users

socket.on("newVideo", (newUrl) => {
  let newId = newUrl.split("=");
  player.loadVideoById(newId[1], 0, "large");
  player.videoId = newId[1];
  console.log(player.videoId)
});

