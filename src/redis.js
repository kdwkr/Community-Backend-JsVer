/* eslint-disable prefer-destructuring */
/* eslint-disable no-cond-assign */
/* eslint-disable no-await-in-loop */
const redis = require('redis');

const CONF = require('./config');

const redisClient = redis.createClient(CONF.redis);
module.exports.redisClient = redisClient;

module.exports.set = function set(key, value) {
  return new Promise((resolve, reject) => {
    redisClient.set(key, value, (err, reply) => {
      if (err) {
        resolve(false);
      } else {
        redisClient.expire(key, CONF.refreshTokenExpire);
        resolve(true);
      }
    });
  });
};

module.exports.get = function get(key) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, reply) => {
      if (err) {
        resolve(null);
      } else {
        resolve(reply);
      }
    });
  });
};

module.exports.scan = function scan(cursor, pattern, count = '1000') {
  return new Promise((resolve, reject) => {
    redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', count, (err, reply) => {
      resolve(reply);
    });
  });
};

module.exports.scanOne = async function scanOne(pattern) {
  let cursor = '0';
  for (let i = 0; i < 1000; i++) {
    const t = await module.exports.scan(cursor, pattern, '100');
    if (t[1][0]) return t[1][0];
    if ((cursor = t[0]) === '0') break;
  }
  return null;
};

module.exports.scanAll = async function scanAll(pattern) {
  let cursor = '0';
  let result = [];
  for (let i = 0; i < 1000; i++) {
    // 혹시 모를 무한 루프 방지하기 위해 제한
    const t = await module.exports.scan(cursor, pattern);
    result = [...result, ...t[1]];
    if ((cursor = t[0]) === '0') break;
  }
  return result;
};

module.exports.deleteKey = function deleteKey(key) {
  return new Promise((resolve, reject) => {
    redisClient.del(key, (err, reply) => {
      if (err || !reply) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

module.exports.flushall = function flushall() {
  return new Promise((resolve, reject) => {
    redisClient.flushall((err, reply) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
