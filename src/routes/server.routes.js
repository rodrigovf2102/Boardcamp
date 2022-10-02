import express from 'express';
import categoriesRouter from './Categ.routes.js';
import gamesRouter from './Games.routes.js';
import customersRouter from './Customers.routes.js'
import rentalsRouter from './Rentals.routes.js'

const router = express.Router();

router.use(categoriesRouter);
router.use(gamesRouter);
router.use(customersRouter);
router.use(rentalsRouter);

export default router;