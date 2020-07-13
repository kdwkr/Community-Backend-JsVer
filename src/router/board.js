const { Router } = require('express');
const { asyncHandler, needAuth } = require('../middlewares');
const { Board } = require('../db');

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const boards = await Board.findAll({ attributes: ['id', 'name'] });
    res.json({ success: true, boards });
  }),
);

router.post(
  '/',
  needAuth,
  asyncHandler(async (req, res) => {
    const { name, desc, type } = req.body;
    if (!name || !desc || !type) {
      res.json({ success: false, code: 400 });
      return;
    }
    await Board.create({ name, desc, type });
    res.json({ success: true });
  }),
);

router.get(
  '/:boardId',
  asyncHandler(async (req, res) => {
    const boardId = Number(req.params.boardId);
    if (!boardId) {
      res.json({ success: false, code: 404 });
      return;
    }
    const board = await Board.findByPk(boardId, {
      attributes: ['id', 'name', 'desc', 'type'],
    });
    if (!board) {
      res.json({ success: false, code: 404 });
      return;
    }
    res.json({ success: true, board });
  }),
);

router.put(
  '/:boardId',
  needAuth,
  asyncHandler(async (req, res) => {
    const name = req.body.title;
    const desc = req.body.content;
    const boardId = Number(req.params.boardId);
    if (!boardId) {
      res.json({ success: false, code: 404 });
      return;
    }
    if (!name || !desc) {
      res.json({ success: false, code: 400 });
      return;
    }
    const board = await Board.findByPk(boardId, {
      attributes: ['id', 'name', 'desc', 'type'],
    });
    if (!board) {
      res.json({ success: false, code: 404 });
      return;
    }
    await board.update({ name, desc });
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
    const board = await Board.findByPk(articleId);
    if (!board) {
      res.json({ success: false, code: 404 });
      return;
    }
    await board.destroy();
    res.json({ success: true });
  }),
);

module.exports = router;
