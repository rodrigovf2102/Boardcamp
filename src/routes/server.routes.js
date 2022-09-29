import express from 'express';
import categoriesRouter from './Categ.routes.js';

const router = express.Router();

router.use(categoriesRouter);

export default router;