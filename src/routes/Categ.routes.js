import express from 'express';
import { getCategories, getCategorie, postCategorie } from '../controllers/Categ.controllers.js';
import categorieValidations from '../middleware/CategorieValidations.js';

const categoriesRouter = express.Router();

categoriesRouter.get('/categories',getCategories);
categoriesRouter.get('/categories/:id',getCategorie);
categoriesRouter.post('/categories',categorieValidations,postCategorie);

export default categoriesRouter;