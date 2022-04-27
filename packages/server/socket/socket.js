import socketio from 'socket.io';
import logger from './../logger/logger.js';

export const socketInit = (server) => {
  const io = socketio.listen(server);

  io.on('connection', (socket) => {
    socket.on('joinRoom', (data) => {
      socket.join(data.roomId);
      socket.room = data.roomId;

      console.log(data.roomId);
      const sockets = io.of('/').in().adapter.rooms[data.roomId];
      console.log(sockets);

      if (sockets.length === 1) {
        logger.debug('1명의 유저가 입장하였습니다.');
      } else if (sockets.length === 2) {
        logger.debug('2명의 유저가 입장하였습니다.');
        io.sockets.in(socket.id).emit('userConnection', sockets.length);
      } else {
        logger.debug('해당 Room은 만석입니다.');
        io.sockets.in(socket.id).emit('fullRoom', data.roomId);
      }
    });

    socket.on('createOffer', ({ sdp, roomId }) => {
      logger.debug(`createOffer => ${roomId}`);
      socket.in(roomId).emit('getOffer', sdp);
    });

    socket.on('createAnswer', ({ sdp, roomId }) => {
      logger.debug(`createAnswer => ${roomId}`);
      socket.in(roomId).emit('getAnswer', sdp);
    });

    socket.on('createCandidate', ({ candidate, roomId }) => {
      logger.debug(`createCandidate => ${roomId}`);
      socket.in(roomId).emit('getCandidate', candidate);
    });

    socket.on('sendMessage', ({ message }) => {
      // socket.in(roomId).emit('getMessages', results);
    });

    socket.on('screenSharing', ({ isSharedByRemote, isVideoShare, roomId }) => {
      logger.debug(`screenSharing => ${roomId}`);
      socket.in(roomId).emit('screenShare', { SharedByRemoteStatus: isSharedByRemote, shareVideoStatus: isVideoShare });
    });

    socket.on('disconnect', () => {
      const roomId = Object.keys(socket.adapter.rooms)[1];
      socket.in(roomId).emit('userDisconnect');
      logger.debug(`disconnect => ${roomId}`);
    });
  });
};
