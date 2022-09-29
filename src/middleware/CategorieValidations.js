import { StatusCodes } from 'http-status-codes';
import joi from 'joi';
import { stripHtml } from 'string-strip-html';

const categoriesSchema = joi.object({
    name: joi.string().min(3).required()
})

async function categorieValidations(req,res,next){
    let name = req.body.name;
    req.body.name = stripHtml(req.body.name, { skipHtmlDecoding: true }).result.trim();
    let validCategorie = {name:name};
    const validation = categoriesSchema.validate(validCategorie,{abortEarly:false});
    if(validation.error){
        const error = validation.error.details[0].message;
        return res.status(StatusCodes.CONFLICT).send(error);
    }
    next();
}

export default categorieValidations;