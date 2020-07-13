const { Router } = require('express');
const JWT = require('jsonwebtoken');
const { v4 } = require('uuid');
const crypto = require('crypto');
const { User } = require('../db');

const CONF = require('../config');
const { asyncHandler, needAuth } = require('../middlewares');

const redis = require('../redis');

const router = Router();

const cookieOptions = {
  httpOnly: true,
  secure: false,
};

function generateAccessToken(payload) {
  return JWT.sign(payload, CONF.jwt.key, CONF.jwt.options);
}

async function generateRefreshToken(userId, jti) {
  // 일단 refreshToken 만들고
  const t = v4().split('-');
  const refreshToken = t[2] + t[1] + t[0] + t[3] + t[4];

  // redis에 추가하고
  if (!(await redis.set(`${jti}/${userId}`, refreshToken))) {
    return null;
  }

  // 반환
  return refreshToken;
}

async function checkAlreadyExists(key, val) {
  const where = {};
  where[key] = val;
  const number = await User.count({ where });
  if (number > 0) return false;
  return true;
}

function encryptPassword(password) {
  const { salt, iterations, keylen, digest } = CONF.passwordEncrypt;
  return crypto
    .pbkdf2Sync(password, salt, iterations, keylen, digest)
    .toString('hex');
}

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { username, password, nickname } = req.body;
    if (!username || !password || !nickname) {
      res.json({
        success: false,
        code: 400,
        msg: 'all arguments required.',
      });
      return;
    }
    if (username.length < 3 || username.length > 15) {
      res.json({
        success: false,
        code: 400,
        msg: 'invalid username length.',
      });
      return;
    }
    if (password.length < 8 || password.length > 30) {
      res.json({
        success: false,
        code: 400,
        msg: 'invalid password length.',
      });
      return;
    }
    if (nickname.length < 2 || nickname.length > 15) {
      res.status(400).json({
        success: false,
        code: 400,
        msg: 'invalid nickname length',
      });
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      res.json({
        success: false,
        code: 400,
        msg: 'invalid username.',
      });
      return;
    }
    if (!/^[a-zA-Z0-9~!@#$%<>^&*()\-=+_’.]+$/.test(password)) {
      res.json({
        success: false,
        code: 400,
        msg: 'invalid password.',
      });
      return;
    }
    if (!/^[a-zA-Z0-9가-힣]+$/.test(nickname)) {
      res.status(400).send({
        success: false,
        code: 400,
        msg: 'invalid nickname',
      });
      return;
    }
    const ukeys = ['username', 'nickname'];
    for (const i in ukeys) {
      // eslint-disable-next-line no-await-in-loop
      if (!(await checkAlreadyExists(ukeys[i], req.body[ukeys[i]]))) {
        res.json({
          success: false,
          code: 400,
          msg: `already exist ${ukeys[i]}.`,
        });
        return;
      }
    }
    await User.create({
      username,
      password: encryptPassword(password),
      nickname,
    });
    res.json({ success: true });
  }),
);

router.post(
  '/authorize',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username) {
      res.json({ success: false, code: 400, msg: 'Missing username' });
      return;
    }
    if (!password) {
      res.json({ success: false, code: 400, msg: 'Missing password' });
      return;
    }

    const user = await User.findOne({
      where: { username, password: encryptPassword(password) },
    });

    if (!user) {
      res.json({ success: false, code: 404 });
      return;
    }

    const jti = new Date().getTime();

    const accessToken = generateAccessToken({
      username: user.username,
      id: user.id,
      jti,
    });
    const refreshToken = await generateRefreshToken(user.id, jti);
    if (!refreshToken) {
      res.json({
        success: false,
        code: 500,
        msg: 'Failed to generate refreshToken',
      });
      return;
    }

    res.cookie('auth', accessToken, cookieOptions);
    res.json({ success: true, refreshToken });
  }),
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const accessToken = req.cookies.auth;
    const { refreshToken } = req.body;

    if (!accessToken) {
      res.json({ success: false, code: 400, msg: 'Missing accessToken' });
      return;
    }
    console.log(1);
    if (!refreshToken) {
      res.json({ success: false, code: 400, msg: 'Missing refreshToken' });
      return;
    }
    console.log(12);

    // 일단 토큰이 유효한지 확인하고
    let decoded;
    try {
      decoded = JWT.verify(accessToken, CONF.jwt.key, {
        ignoreExpiration: true,
      });
    } catch (err) {
      res.json({ success: false, code: 401, msg: 'Token has problem' });
      return;
    }
    console.log(123);

    // jti/userId가 redis에 있는지 확인하고
    const redisRefreshToken = await redis.get(`${decoded.jti}/${decoded.id}`);
    if (!redisRefreshToken) {
      res.json({ success: false, code: 401, msg: 'Token has problem' });
      return;
    }
    console.log(1234);

    // 토큰이 서로 일치하는지 확인
    if (refreshToken !== redisRefreshToken) {
      res.json({ success: false, code: 401, msg: 'Token has problem' });
      return;
    }
    console.log(12345);

    // 기존에 있던 refreshToken삭제
    redis.deleteKey(`${decoded.jti}/${decoded.id}`);

    // 새로운 accessToken, refreshToken 발급

    delete decoded.iat;
    delete decoded.exp;

    const newJti = new Date().getTime();
    decoded.jti = newJti;

    const newAccessToken = generateAccessToken(decoded);
    const newRefreshToken = await generateRefreshToken(decoded.id, newJti);
    if (!newRefreshToken) {
      res.json({
        success: false,
        code: 500,
        msg: 'Failed to generate refreshToken',
      });
      return;
    }

    // 끝
    res.cookie('auth', newAccessToken, cookieOptions);
    res.json({ success: true, refreshToken: newRefreshToken });
  }),
);

router.post(
  '/revoke',
  asyncHandler(async (req, res) => {
    const accessToken = req.cookies.auth;

    // 일단 만료 시키고
    res.cookie('auth', '', { expires: new Date() });
    res.json({ success: true });

    // accessToken까서 refreshToken 삭제
    let decoded;
    try {
      decoded = JWT.verify(accessToken, CONF.jwt.key, {
        ignoreExpiration: true,
      });
    } catch (err) {
      return;
    }
    redis.deleteKey(`${decoded.jti}/${decoded.id}`);
  }),
);

// router.post(
//   '/destroy',
//   needAuth,
//   chkRole('*'),
//   asyncHandler(async (req, res) => {
//     const { userId } = req.body;
//     if (!userId) {
//       res.json({ success: false, code: 400, msg: 'Missing userId' });
//       return;
//     }

//     const keys = await redis.scanAll(`*/${userId}`);
//     keys.map(key => redis.deleteKey(key));

//     res.json({ success: true });
//   }),
// );

// router.post(
//   '/flush',
//   needAuth,
//   chkRole('*'),
//   asyncHandler(async (req, res) => {
//     await redis.flushall();

//     res.json({ success: true });
//   }),
// );

module.exports = router;
