import express from 'express';
import { getRentals } from '../controllers/Rentals.controllers.js'

const rentalsRouter = express.Router();

rentalsRouter.get('/rentals', getRentals);

export default rentalsRouter;