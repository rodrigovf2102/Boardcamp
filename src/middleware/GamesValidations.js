import joi from "joi";
import { StatusCodes } from "http-status-codes";
import { stripHtml } from "string-strip-html";

const gameSchema = joi.object({
    name: joi.string().min(3).required(),
    image: joi.string(),
    stockTotal: joi.number().greater(0).required(),
    categoryId: joi.number().greater(0).required(),
    pricePerDay: joi.number().greater(0).required()
})

async function gameValidations(req,res,next){
    const {name,image,stockTotal,categoryId,pricePerDay} = req.body;
    const validGame = {name:name,image:image,stockTotal:stockTotal,categoryId:categoryId,pricePerDay:pricePerDay}
    const validation = gameSchema.validate(validGame,{abortEarly:false});
    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(StatusCodes.BAD_REQUEST).send(errors);
    }
    req.body.name = stripHtml(req.body.name, { skipHtmlDecoding: true }).result.trim();
    req.body.image = stripHtml(req.body.image, { skipHtmlDecoding: true }).result.trim();
    next();
}

export { gameValidations}