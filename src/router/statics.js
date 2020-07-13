const { Router } = require('express');
const moment = require('moment');
const { Op } = require('sequelize');
const { asyncHandler, needAuth } = require('../middlewares');
const { Article, Comment } = require('../db');

const router = Router();

router.get(
  '/articlecount',
  asyncHandler(async (req, res) => {
    const start = moment().startOf('day');
    const end = moment().endOf('day');
    res.json({
      success: true,
      count: await Article.count({
        where: {
          createdAt: {
            [Op.gte]: start.toDate(),
            [Op.lte]: end.toDate(),
          },
        },
      }),
    });
  }),
);

router.get(
  '/commentcount',
  asyncHandler(async (req, res) => {
    const start = moment().startOf('day');
    const end = moment().endOf('day');
    res.json({
      success: true,
      count: await Comment.count({
        where: {
          createdAt: {
            [Op.gte]: start.toDate(),
            [Op.lte]: end.toDate(),
          },
        },
      }),
    });
  }),
);

module.exports = router;
