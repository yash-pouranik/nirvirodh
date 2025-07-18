

const socket = io();
const teamId = document.getElementById("teamId").value;
socket.emit("joinRoom", teamId); // 🔁 Join the correct room
console.log(socket);

socket.on("fileUpdated", (file) => {
  console.log("File updated in real-time:", file);
  location.reload(); // simple solution
  console.log(socket);
});
