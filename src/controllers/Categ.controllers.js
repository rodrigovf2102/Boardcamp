import connection from "../database.js";
import { StatusCodes } from 'http-status-codes';

async function getCategorie(req, res) {
    const { id } = req.params;
    try {
        const categorie = await connection.query('SELECT * FROM categories WHERE id=$1', [id]);
        if (categorie.rows.length < 1) {
            return res.status(StatusCodes.NOT_FOUND).send('Error: category not found');
        }
        return res.status(StatusCodes.ACCEPTED).send(categorie.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getCategories(req, res) {
    let { offset, limit, order } = req.query;
    if (!offset) { offset = 0; }
    if (!limit) { limit = 100; }
    if (!order) { order = 'id'}
    try {
        let categorie;
        const standardSearch = 'SELECT * FROM categories';
        categorie = await connection.query(
            `${standardSearch} ORDER BY ${order} OFFSET $1 LIMIT $2`, [offset, limit]);
        if (categorie.rows.length < 1) {
            return res.status(StatusCodes.NOT_FOUND).send('Categories are empty');
        }
        return res.status(StatusCodes.ACCEPTED).send(categorie.rows);
    }
    catch (error) {
        console.log(error.message);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function postCategorie(req, res) {
    const { name } = req.body
    try {
        const equal = await connection.query("SELECT * FROM categories WHERE name=$1", [name]);
        if (equal.rows.length > 0) {
            return res.status(StatusCodes.CONFLICT).send('Error: category already exists');
        }
        await connection.query('INSERT INTO categories (name) VALUES ($1)', [name]);
        return res.sendStatus(StatusCodes.CREATED);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

export { getCategories, getCategorie, postCategorie }