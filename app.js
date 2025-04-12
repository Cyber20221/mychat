import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYtS1CxqZYJoOOTLElZhc3MQAgCMTbZzw",
  authDomain: "chatbot-70d4d.firebaseapp.com",
  databaseURL: "https://chatbot-70d4d-default-rtdb.firebaseio.com",
  projectId: "chatbot-70d4d",
  storageBucket: "chatbot-70d4d.appspot.com",
  messagingSenderId: "935113084879",
  appId: "1:935113084879:web:ca705a2aad45cd9056ccba",
  measurementId: "G-K9VTF16WXY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

const chatBox = document.getElementById("chat");
const msgInput = document.getElementById("message");
const fileInput = document.getElementById("fileInput");

function formatTime(ts) {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function listenForMessages() {
  const messagesRef = ref(db, "messages");
  onChildAdded(messagesRef, (data) => {
    const msgData = data.val();
    const msgDiv = document.createElement("div");
    const isYou = msgData.user === (window.getUsername && window.getUsername());
    msgDiv.className = "msg " + (isYou ? "you" : "other");

    if (msgData.fileUrl) {
      msgDiv.innerHTML = `<strong>${msgData.user}</strong><br/><a href="${msgData.fileUrl}" target="_blank">📎 Attachment</a><span class="timestamp">${formatTime(msgData.timestamp)}</span>`;
    } else {
      msgDiv.innerHTML = `<strong>${msgData.user}</strong><br/>${msgData.message}<span class="timestamp">${formatTime(msgData.timestamp)}</span>`;
    }

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

window.sendMessage = function () {
  const msg = msgInput.value.trim();
  if (msg !== "") {
    push(ref(db, "messages"), {
      user: window.getUsername ? window.getUsername() : "Anonymous",
      message: msg,
      timestamp: Date.now()
    });
    msgInput.value = "";
  }
};

window.sendFile = function () {
  const file = fileInput.files[0];
  if (file) {
    const storageReference = storageRef(storage, `chat-attachments/${Date.now()}-${file.name}`);
    uploadBytes(storageReference, file).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((fileUrl) => {
        push(ref(db, "messages"), {
          user: window.getUsername ? window.getUsername() : "Anonymous",
          fileUrl: fileUrl,
          timestamp: Date.now()
        });
      });
    });
  }
};

listenForMessages();
