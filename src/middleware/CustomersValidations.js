import { StatusCodes } from 'http-status-codes';
import joi from 'joi';
import { stripHtml } from 'string-strip-html';

const customersSchema = joi.object({
    name: joi.string().min(3).required(),
    phone: joi.string().min(11).max(12),
    cpf: joi.string().length(11),
    birthday: joi.date()
})

async function customerValidations(req, res, next) {
    try {
        req.body.name = stripHtml(req.body.name, { skipHtmlDecoding: true }).result.trim();
        req.body.phone = stripHtml(req.body.phone, { skipHtmlDecoding: true }).result.trim();
        req.body.cpf = stripHtml(req.body.cpf, { skipHtmlDecoding: true }).result.trim();
        req.body.birthday = stripHtml(req.body.birthday, { skipHtmlDecoding: true }).result.trim();
    } catch (error) {
        console.log(error.message);
    }
    const { name, phone, cpf, birthday } = req.body;
    const validCustomer = { name: name, phone: phone, cpf: cpf, birthday: birthday };
    const validation = customersSchema.validate(validCustomer, { abortEarly: false });
    if (validation.error) {
        const error = validation.error.details[0].message;
        return res.status(StatusCodes.CONFLICT).send(error);
    }
    next();
}

export default customerValidations;