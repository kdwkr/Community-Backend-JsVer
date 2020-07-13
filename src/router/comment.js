const { Router } = require('express');
const { fn, col } = require('sequelize');
const { asyncHandler, needAuth } = require('../middlewares');
const { Comment, Article } = require('../db');

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const articleId = Number(req.query.articleId);
    const parentCommentId = Number(req.query.parentCommentId);
    const page = Math.max(1, Number(req.query.page || 1));
    if (!articleId) {
      res.json({ success: false, code: 404 });
      return;
    }
    const article = await Article.findByPk(articleId);
    if (!article) {
      res.json({ success: false, code: 404 });
      return;
    }
    res.json({
      success: true,
      comments: await article.getComments({
        subQuery: false,
        include: [
          {
            model: Comment,
            attributes: [],
            as: 'childComments',
          },
          {
            association: Comment.associations.writer,
            attributes: ['id', 'nickname'],
          },
        ],
        attributes: [
          'id',
          'content',
          'createdAt',
          'updatedAt',
          [
            fn('COUNT', col('childComments.parentCommentId')),
            'childCommentCount',
          ],
        ],
        group: 'id',
        limit: 15,
        offset: 15 * (page - 1),
        where: {
          parentCommentId: parentCommentId || null,
        },
      }),
    });
  }),
);

router.post(
  '/',
  needAuth,
  asyncHandler(async (req, res) => {
    const articleId = Number(req.query.articleId);
    const parentCommentId = Number(req.query.parentCommentId);
    const { content } = req.body;
    if (!articleId) {
      res.json({ success: false, code: 404 });
      return;
    }
    if (!content) {
      res.json({ success: false, code: 400 });
      return;
    }
    const article = await Article.findByPk(articleId);
    if (!article) {
      res.json({ success: false, code: 404 });
      return;
    }
    const comment = await article.createComment({
      content,
      articleId,
      parentCommentId: parentCommentId || null,
      userId: req.auth.id,
    });
    res.json({ success: true, id: comment.id });
  }),
);

router.get(
  '/my',
  needAuth,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page || 1));
    res.json({
      success: true,
      comments: await Comment.findAll({
        subQuery: false,
        include: [
          {
            model: Comment,
            attributes: [],
            as: 'childComments',
          },
          {
            association: Comment.associations.writer,
            attributes: ['id', 'nickname'],
          },
        ],
        attributes: [
          'id',
          'content',
          'createdAt',
          'updatedAt',
          [
            fn('COUNT', col('childComments.parentCommentId')),
            'childCommentCount',
          ],
        ],
        group: 'id',
        limit: 15,
        offset: 15 * (page - 1),
        where: {
          userId: req.auth.id,
        },
      }),
    });
  }),
);

router.put(
  '/:commentId',
  needAuth,
  asyncHandler(async (req, res) => {
    const commentId = Number(req.params.commentId);
    const { content } = req.body;
    if (!commentId) {
      res.json({ success: false, code: 404 });
      return;
    }
    if (!content) {
      res.json({ success: false, code: 400 });
      return;
    }
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      res.json({ success: false, code: 404 });
      return;
    }
    if (comment.userId !== req.auth.id) {
      res.json({ success: false, code: 401 });
      return;
    }
    await comment.update({ content });
    res.json({ success: true });
  }),
);

router.delete(
  '/:commentId',
  needAuth,
  asyncHandler(async (req, res) => {
    const commentId = Number(req.params.commentId);
    if (!commentId) {
      res.json({ success: false, code: 404 });
      return;
    }
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      res.json({ success: false, code: 404 });
      return;
    }
    if (comment.userId !== req.auth.id) {
      res.json({ success: false, code: 401 });
      return;
    }
    await comment.destroy();
    res.json({ success: true });
  }),
);

module.exports = router;
