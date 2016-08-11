import redis from 'redis';
import Promise from 'bluebird';
import config from '.';

Promise.promisifyAll(redis);

const redisClient = redis.createClient(config.redis.port, config.redis.host, config.redis.options);

redisClient.on('connect', () => {
  console.log(`Running Redis ${redisClient.address}`);
}).on('ready', () => {
  console.log(`Running Redis Version ${redisClient.server_info.redis_version}`);
}).on('error', err => {
  console.error(err);
});

export default redisClient;
