import express from 'express';
import categoriesRouter from './Categ.routes.js';
import gamesRouter from './Games.routes.js';

const router = express.Router();

router.use(categoriesRouter);
router.use(gamesRouter);

export default router;