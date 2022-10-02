import express from 'express';
import { getRentals, postRental } from '../controllers/Rentals.controllers.js'
import { rentalValidations } from '../middleware/RentalsValidations.js';

const rentalsRouter = express.Router();

rentalsRouter.get('/rentals', getRentals);
rentalsRouter.post('/rentals', rentalValidations, postRental)

export default rentalsRouter;