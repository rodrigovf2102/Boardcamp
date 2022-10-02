import joi from "joi";
import { StatusCodes } from "http-status-codes";

const rentalSchema = joi.object({
    customerId: joi.number().greater(0).required(),
    gameId: joi.number().greater(0).required(),
    daysRented: joi.number().greater(0).required()
})

async function rentalValidations(req,res,next){
    const {customerId,gameId,daysRented} = req.body;
    const validRental = {customerId:customerId,gameId:gameId,daysRented:daysRented};
    const validation = rentalSchema.validate(validRental,{abortEarly:false});
    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(StatusCodes.BAD_REQUEST).send(errors);
    }
    next();
}

export { rentalValidations }