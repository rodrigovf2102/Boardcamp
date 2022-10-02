import express from 'express';
import { getRentals, postRental } from '../controllers/Rentals.controllers.js'

const rentalsRouter = express.Router();

rentalsRouter.get('/rentals', getRentals);
rentalsRouter.post('/rentals', postRental)

export default rentalsRouter;