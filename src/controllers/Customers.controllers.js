import connection from "../database.js";
import { StatusCodes } from 'http-status-codes';

async function getCustomers(req, res) {
    let { cpf, limit, offset } = req.query;
    if (!offset) { offset = 0; }
    if (!limit) { limit = 100; }
    try {
        let customers;
        const standardSearch = 'SELECT * FROM customers';
        if (!cpf) {
            customers = (
                await connection.query(`${standardSearch} OFFSET $1 LIMIT $2`, [offset, limit])
            ).rows;
        }
        if (cpf) {
            customers = (await connection
                .query(
                    `${standardSearch} WHERE cpf LIKE $1 OFFSET $2 LIMIT $3;`, [`${cpf}%`, offset, limit]
                )).rows;
        }
        return res.status(StatusCodes.ACCEPTED).send(customers);

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getCustomer(req, res) {
    const { id } = req.params;
    try {
        const customers = (await connection.query('SELECT * FROM customers WHERE id=$1;', [id])).rows;
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
        const equalCpf = (await connection.query('SELECT * FROM customers WHERE cpf=$1;', [cpf])).rows;
        if (equalCpf.length > 0) {
            return res.status(StatusCodes.CONFLICT).send('Error: cpf already exist');
        }
        await connection.query(
            'INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4);'
            , [name, phone, cpf, birthday]);
        return res.sendStatus(StatusCodes.CREATED);
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;
    const { id } = req.params;
    try {
        const equalCpf = (await connection.query('SELECT * FROM customers WHERE cpf=$1;', [cpf])).rows;
        if (equalCpf.length > 0) {
            return res.status(StatusCodes.CONFLICT).send('Error: cpf already exist');
        }
        await connection.query('UPDATE customers SET name=$1,phone=$2,cpf=$3,birthday=$4 WHERE id=$5;'
            , [name, phone, cpf, birthday, id]);
        return res.sendStatus(StatusCodes.OK);
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

export { getCustomers, getCustomer, postCustomer, updateCustomer }