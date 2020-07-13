import { Router } from 'express';
import { asyncHandler, needAuth } from '../middlewares';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    // TODO
  }),
);

module.exports = router;
