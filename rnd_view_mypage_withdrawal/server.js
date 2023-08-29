const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const PORT = process.env.PORT || 8081; // 포트 번호를 지정합니다. 기본값은 8081입니다.

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // 클라이언트 도메인을 추가하거나, 모든 도메인에 대한 접근을 허용하려면 '*'로 설정합니다.
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  // 서버에서 클라이언트로 메시지 전송
  socket.emit("serverMessage", { text: "Hello from server" });

  // 클라이언트에서 전송된 메시지 처리
  socket.on("clientMessage", (data) => {
    console.log(`Received message from client: ${data.text}`);
  });

  // 연결이 끊어졌을 때
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
