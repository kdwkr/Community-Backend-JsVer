const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const CONF = require('./config');
const { User } = require('./db');

const AuthRouter = require('./router/auth');
const BoardRouter = require('./router/board');
const ArticleRouter = require('./router/article');
const CommentRouter = require('./router/comment');
const StaticsRouter = require('./router/statics');
const { needAuth, asyncHandler } = require('./middlewares');

const app = express();
app.use(helmet());
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: CONF.allowOrigins, credentials: true }));

app.use('/auth', AuthRouter);
app.use('/boards', BoardRouter);
app.use('/articles', ArticleRouter);
app.use('/comments', CommentRouter);
app.use('/statics', StaticsRouter);

app.get(
  '/me',
  needAuth,
  asyncHandler(async (req, res) => {
    res.json({ success: true, me: await User.findByPk(req.auth.id) });
  }),
);

app.listen(CONF.web.port, () => {
  console.log('start server');
});
