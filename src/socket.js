import { io } from "socket.io-client";
import { SOCKET_URL } from "./config.js";

const socket = io(SOCKET_URL, {
  withCredentials: true, // sends the JWT cookies
  autoConnect: false, // AuthContext decides when to connect
});

socket.isReady = false;
socket.on("connect", () => {
  socket.isReady = false;
});
socket.on("socket:ready", () => {
  socket.isReady = true;
});
socket.on("disconnect", () => {
  socket.isReady = false;
});

export default socket;
