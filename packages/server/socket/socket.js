import socketio from "socket.io";
import logger from "./../logger/logger.js";
import { createRoom, messageSave } from "../service/socketService.js";

/**
 *  1. 링크를 통하여 접근을 하게 될텐데 인증처리 후 접근가능하도록
 *  2. 접근이 가능하다면 Reservation Table에서 SerialNumbe로 roomID 대체
 *  3. 해당 roomID를 사용하여 화상회의 및 채팅 room 생성
 */

// Reservation Table에 있는 SerialNumbe
const SerialNumbe = Math.random().toString(36).slice(2);

export const socketInit = (server) => {
  const io = socketio.listen(server);

  io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => {
      socket.join(SerialNumbe);
      socket.room = SerialNumbe;
      const sockets = io.of("/").in().adapter.rooms[SerialNumbe];
      console.log(sockets);

      if (sockets.length === 1) {
        createRoom(SerialNumbe);
        logger.debug("1명의 유저가 입장하였습니다.");
      } else if (sockets.length === 2) {
        logger.debug("2명의 유저가 입장하였습니다.");
        io.sockets.in(socket.id).emit("userConnection", sockets.length);
      } else {
        logger.debug("해당 Room은 만석입니다.");
        io.sockets.in(socket.id).emit("fullRoom", SerialNumbe);
      }
    });

    socket.on("createOffer", ({ sdp, roomId }) => {
      logger.debug(`createOffer => ${roomId}`);
      socket.in(SerialNumbe).emit("getOffer", sdp);
    });

    socket.on("createAnswer", ({ sdp, roomId }) => {
      logger.debug(`createAnswer => ${roomId}`);
      socket.in(SerialNumbe).emit("getAnswer", sdp);
    });

    socket.on("createCandidate", ({ candidate, roomId }) => {
      logger.debug(`createCandidate => ${roomId}`);
      socket.in(SerialNumbe).emit("getCandidate", candidate);
    });

    socket.on("sendMessage", ({ message }) => {
      messageSave(message).then((results) => {
        socket.in(SerialNumbe).emit("getMessages", results);
      });
    });

    socket.on("screenSharing", ({ isSharedByRemote, isVideoShare, roomId }) => {
      logger.debug(`screenSharing => ${roomId}`);
      socket
        .in(SerialNumbe)
        .emit("screenShare", { SharedByRemoteStatus: isSharedByRemote, shareVideoStatus: isVideoShare });
    });

    socket.on("disconnect", () => {
      const roomId = Object.keys(socket.adapter.rooms)[1];
      socket.in(SerialNumbe).emit("userDisconnect");
      logger.debug(`disconnect => ${roomId}`);
    });
  });
};
