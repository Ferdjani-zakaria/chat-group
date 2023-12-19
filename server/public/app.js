// const socket = io("ws://localhost:3500");
const socket = io("https://group-chat-socket-io.onrender.com");

const msgInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoom = document.querySelector("#room");
const activity = document.querySelector(".activity");
const usersList = document.querySelector(".user-list");
const roomList = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");

function sendMessage(e) {
    e.preventDefault();
    if (nameInput.value && nameInput.value !== "Admin" && msgInput.value) {
        socket.emit("message", {
            name: nameInput.value,
            text: msgInput.value,
        });
        msgInput.value = "";
    }
    msgInput.focus();
}

function createRoom(e) {
    e.preventDefault();
    if (nameInput.value && chatRoom.value) {
        socket.emit("enterRoom", {
            name: nameInput.value,
            room: chatRoom.value,
        });
    }
}

function enterRoom(roomClicked) {
    if (nameInput.value) {
        socket.emit("enterRoom", {
            name: nameInput.value,
            room: roomClicked,
        });
    }
}

function changeName() {
    socket.emit("changeName", {});
}

nameInput.addEventListener("blur", changeName);

document.querySelector(".form-msg").addEventListener("submit", sendMessage);

document.querySelector(".form-create").addEventListener("submit", createRoom);

msgInput.addEventListener("keypress", () => {
    socket.emit("activity", nameInput.value);
});

socket.on("enterRoom", (data) => {
    nameInput.value = data;
});

socket.on("changeTitle", (data) => {
    changeTitle(data);
});

function changeTitle(newRoom) {
    document.title = `${newRoom} ● Chat Room`;
}

// Listen for messages
socket.on("message", (data) => {
    activity.textContent = "";
    const { name, text, time } = data;
    const li = document.createElement("li");
    li.className = "post";
    if (name === nameInput.value) li.className = "post post--right";
    if (name !== nameInput.value && name !== "Admin")
        li.className = "post post--left";
    if (name !== "Admin") {
        li.innerHTML = `<div class="post__header ${
            name === nameInput.value
                ? "post__header--user"
                : "post__header--reply"
        }">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`;
    } else {
        li.innerHTML = `<div class="post__text">${text}</div>`;
    }
    document.querySelector(".chat-display").appendChild(li);

    chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

let activityTimer;
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`;

    // Clear after 3 seconds
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        activity.textContent = "";
    }, 3000);
});

socket.on("userList", ({ users }) => {
    showUsers(users);
});

socket.on("roomList", ({ rooms }) => {
    showRooms(rooms);
});

function showUsers(users) {
    usersList.textContent = "";
    if (users) {
        usersList.innerHTML = `<p>Users in ${chatRoom.value}:</p>`;
        users.forEach((user) => {
            // Create a new div for each user
            let userDiv = document.createElement("div");
            userDiv.textContent = user.name;
            userDiv.className = "user"; // Add a class to style the room

            // Append the roomDiv to the roomList
            usersList.appendChild(userDiv);
        });
    }
}

function showRooms(rooms) {
    roomList.innerHTML = ""; // Clear the roomList
    if (rooms) {
        rooms.forEach((room) => {
            // Create a new div for each room
            let roomDiv = document.createElement("div");
            roomDiv.textContent = room;
            roomDiv.className = "room"; // Add a class to style the room

            // Add an event listener to the room
            roomDiv.addEventListener("click", function () {
                // Code to move to this room
                enterRoom(room);
            });

            // Append the roomDiv to the roomList
            roomList.appendChild(roomDiv);
        });
    }
}
