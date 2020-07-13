const { Sequelize } = require('sequelize');
const { User, UserInit } = require('./user');
const { Board, BoardInit } = require('./board');
const { Article, ArticleInit } = require('./article');
const { Comment, CommentInit } = require('./comment');
const CONF = require('../config');

const sequelize = new Sequelize(CONF.db);

CommentInit(sequelize);
ArticleInit(sequelize);
BoardInit(sequelize);
UserInit(sequelize);
sequelize.sync({ alter: true });

module.exports = { User, Board, Article, Comment };
