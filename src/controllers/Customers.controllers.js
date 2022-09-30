import connection from "../database.js";
import { StatusCodes } from 'http-status-codes';

async function getCustomers(req, res) {
    const { cpf } = req.query;
    try {
        if (!cpf) {
            const customers = (await connection.query('SELECT * FROM customers;')).rows;
            return res.status(StatusCodes.ACCEPTED).send(customers);
        }
        if (cpf) {
            const customers = (await connection
                .query('SELECT * FROM customers WHERE cpf LIKE $1;', [`${cpf}%`])).rows;
            return res.status(StatusCodes.ACCEPTED).send(customers);
        }
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getCustomer(req, res) {
    const { id } = req.params;
    try {
        const customers = (await connection.query('SELECT * FROM customers WHERE id=$1;', [id])).rows
        if (customers.length < 1) {
            return res.status(StatusCodes.NOT_FOUND).send('Error: customer not found');
        }
        return res.status(StatusCodes.ACCEPTED).send(customers[0]);
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function postCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;
    try {
        await connection.query(
            'INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4);'
            , [name,phone,cpf,birthday]);
        return res.sendStatus(StatusCodes.CREATED);
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

export { getCustomers, getCustomer, postCustomer }