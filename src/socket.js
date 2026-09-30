import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true, // cookies (JWT) bhejne ke liye — auth mein kaam aayega
  autoConnect: false, // hum khud control karenge kab connect ho
});

export default socket;
