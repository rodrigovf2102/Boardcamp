import express from 'express';
import { getRentals, postRental, postRentalReturn, deleteRental } from '../controllers/Rentals.controllers.js'
import { rentalValidations } from '../middleware/RentalsValidations.js';

const rentalsRouter = express.Router();

rentalsRouter.get('/rentals', getRentals);
rentalsRouter.post('/rentals', rentalValidations, postRental);
rentalsRouter.post('/rentals/:id/return',postRentalReturn);
rentalsRouter.delete('/rentals/:id', deleteRental);

export default rentalsRouter;