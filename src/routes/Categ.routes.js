import express from 'express';
import { getCategories } from '../controllers/Categ.controllers.js';

const categoriesRouter = express.Router();

//router.post('/categories',);
categoriesRouter.get('/categories/:id',getCategories);

export default categoriesRouter;