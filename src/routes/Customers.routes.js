import express from 'express';
import { getCustomers, getCustomer, postCustomer, updateCustomer} from '../controllers/Customers.controllers.js'
import customerValidations from '../middleware/CustomersValidations.js';

const customersRouter = express.Router();

customersRouter.get('/customers',getCustomers);
customersRouter.get('/customers/:id',getCustomer);
customersRouter.post('/customers',customerValidations,postCustomer);
customersRouter.put('/customers/:id',customerValidations,updateCustomer);


export default customersRouter;