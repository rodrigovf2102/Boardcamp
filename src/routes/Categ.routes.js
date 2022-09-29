import express from 'express';
import { getCategories, getCategorie } from '../controllers/Categ.controllers.js';

const categoriesRouter = express.Router();

categoriesRouter.get('/categories',getCategories);
categoriesRouter.get('/categories/:id',getCategorie);

export default categoriesRouter;