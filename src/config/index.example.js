module.exports = {
  jwt: {
    key: '',
    options: {
      expiresIn: '1h',
      algorithm: 'HS512',
    },
  },
  db: {
    database: 'community',
    username: '',
    password: '',
    host: 'localhost',
    dialect: 'mysql',
    logging: true,
  },
  redis: {
    host: 'localhost',
    port: 6379,
    db: 0,
  },
  refreshTokenExpire: 60 * 60 * 24 * 7, // 7일
  web: {
    port: 3000,
  },
  socket: {
    port: 3001,
  },
  passwordEncrypt: {
    salt: '',
    iterations: -1,
    keylen: -1,
    digest: 'sha512',
  },
  allowOrigins: ['http://127.0.0.1:8080'],
};
