import sio from 'socket.io';
import adapter from 'socket.io-redis';
import { createClient as redisClient } from 'redis';
import { parse as cookieParse } from 'cookie';
import config from '.';


export default server => {
  const io = sio(server, {
    transports: ['websocket'] });

  const redisAdapter = adapter({
    pubClient: redisClient(config.redis.port, config.redis.host),
    subClient: redisClient(config.redis.port, config.redis.host, { return_buffers: true }),
  });
  redisAdapter.pubClient.on('error', err => {
    console.error('pubClient', err);
  });
  redisAdapter.subClient.on('error', err => {
    console.error('subClient', err);
  });

  // Redis Store
  io.adapter(redisAdapter);

  io.use((socket, next) => {
    const data = socket.request;

    if (data.headers.cookie) {
      data.cookie = cookieParse(data.headers.cookie);

      if (!data.cookie['connect.sid']) {
        next(new Error('NoSessionTransmitted'));
      }
    } else {
      next(new Error('NoCookieTransmitted'));
    }

    next();
  });

  io.on('connection', socket => {
    // socket.id
    // socket.request.connection.remoteAddress
    // socket.request.headers['user-agent']
    // io.sockets.connected[client].disconnect();
    io.emit('user:count', io.eio.clientsCount);

    socket.on('disconnect', () => {
      socket.broadcast.emit('user:count', io.eio.clientsCount);
    });
  });

  return io;
};
