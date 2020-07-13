const { Router } = require('express');
const { fn, col, Model } = require('sequelize');
const { asyncHandler, needAuth } = require('../middlewares');
const { Board, Comment, Article } = require('../db');

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const boardId = Number(req.query.boardId);
    const allowedLimits = [5, 15, 30, 50];
    let limit = Number(req.query.limit || 15);
    if (!allowedLimits.includes(limit)) limit = 15;
    const page = Math.max(1, Number(req.query.page || 1));
    if (!boardId) {
      res.json({ success: false, code: 404 });
      return;
    }
    const board = await Board.findByPk(boardId, { attributes: ['id'] });
    if (!board) {
      res.json({ success: false, code: 404 });
      return;
    }
    res.json({
      success: true,
      articles: await board.getArticles({
        subQuery: false,
        include: [
          {
            model: Comment,
            attributes: [],
            as: 'comments',
          },
          {
            association: Article.associations.writer,
            attributes: ['id', 'nickname'],
          },
        ],
        attributes: [
          'id',
          'title',
          'createdAt',
          [fn('COUNT', col('comments.id')), 'commentCount'],
        ],
        order: [['id', 'DESC']],
        group: 'id',
        limit,
        offset: limit * (page - 1),
      }),
    });
  }),
);

router.post(
  '/',
  needAuth,
  asyncHandler(async (req, res) => {
    const boardId = Number(req.query.boardId);
    const { title } = req.body;
    const { content } = req.body;
    if (!boardId) {
      res.json({ success: false, code: 404 });
      return;
    }
    if (!title || !content) {
      res.json({ success: false, code: 400 });
      return;
    }
    const board = await Board.findByPk(boardId);
    if (!board) {
      res.json({ success: false, code: 404 });
      return;
    }
    const article = await board.createArticle({
      title,
      content,
      boardId,
      userId: req.auth.id,
    });
    res.json({ success: true, id: article.id });
  }),
);

router.get(
  '/my',
  needAuth,
  asyncHandler(async (req, res) => {
    const allowedLimits = [5, 15, 30, 50];
    let limit = Number(req.query.limit || 15);
    if (!allowedLimits.includes(limit)) limit = 15;
    const page = Math.max(1, Number(req.query.page || 1));
    res.json({
      success: true,
      articles: await Article.findAll({
        subQuery: false,
        include: [
          {
            model: Comment,
            attributes: [],
            as: 'comments',
          },
          {
            association: Article.associations.writer,
            attributes: ['id', 'nickname'],
          },
        ],
        attributes: [
          'id',
          'title',
          'createdAt',
          [fn('COUNT', col('comments.id')), 'commentCount'],
        ],
        order: [['id', 'DESC']],
        group: 'id',
        where: { userId: req.auth.id },
        limit,
        offset: limit * (page - 1),
      }),
    });
  }),
);

router.get(
  '/:articleId',
  asyncHandler(async (req, res) => {
    const articleId = Number(req.params.articleId);
    if (!articleId) {
      res.json({ success: false, code: 404 });
      return;
    }
    const article = await Article.findByPk(articleId, {
      subQuery: false,
      include: [
        {
          model: Comment,
          attributes: [],
          as: 'comments',
        },
        {
          association: Article.associations.writer,
          attributes: ['id', 'nickname'],
        },
      ],
      attributes: [
        'id',
        'title',
        'boardId',
        'content',
        'createdAt',
        'updatedAt',
        [fn('COUNT', col('comments.id')), 'commentCount'],
      ],
      group: 'id',
    });
    if (!article) {
      res.json({ success: false, code: 404 });
      return;
    }
    res.json({ success: true, article });
  }),
);

router.put(
  '/:articleId',
  needAuth,
  asyncHandler(async (req, res) => {
    const articleId = Number(req.params.articleId);
    const { title } = req.body;
    const { content } = req.body;
    if (!articleId) {
      res.json({ success: false, code: 404 });
      return;
    }
    if (!title || !content) {
      res.json({ success: false, code: 400 });
      return;
    }
    const article = await Article.findByPk(articleId);
    if (!article) {
      res.json({ success: false, code: 404 });
      return;
    }
    if (article.userId !== req.auth.id) {
      res.json({ success: false, code: 401 });
      return;
    }
    await article.update({ title, content });
    res.json({ success: true });
  }),
);

router.delete(
  '/:articleId',
  needAuth,
  asyncHandler(async (req, res) => {
    const articleId = Number(req.params.articleId);
    if (!articleId) {
      res.json({ success: false, code: 404 });
      return;
    }
    const article = await Article.findByPk(articleId);
    if (!article) {
      res.json({ success: false, code: 404 });
      return;
    }
    if (article.userId !== req.auth.id) {
      res.json({ success: false, code: 401 });
      return;
    }
    await article.destroy();
    res.json({ success: true });
  }),
);

module.exports = router;
