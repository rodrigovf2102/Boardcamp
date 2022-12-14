import { StatusCodes } from "http-status-codes";
import connection from "../database.js";

async function getGames(req, res) {
    let { name, offset, limit } = req.query;
    if (!offset) { offset = 0; }
    if (!limit) { limit = 100; }
    let nameCaseInsensitive = '';
    if (name) {
        for (let i = 0; i < name.length; i++) {
            if (i === 0) nameCaseInsensitive += name[i].toUpperCase();
            if (i !== 0) nameCaseInsensitive += name[i].toLowerCase();
        }
    }
    try {
        let games;
        const standardSearch = `SELECT games.*,categories.name AS "categoryName" 
        FROM games JOIN categories ON games."categoryId"=categories.id`;
        if (name) {
            games = await connection.query(
                `${standardSearch} WHERE games.name LIKE $1 OFFSET $2 LIMIT $3;`,
                [`${nameCaseInsensitive}%`, offset, limit]);
        }
        if (!name) {
            games = await connection.query(`${standardSearch} OFFSET $1 LIMIT $2;`,
                [offset, limit]);
        }
        if (games.rows.length < 1) {
            return res.status(StatusCodes.NOT_FOUND).send('Games not found');
        }
        return res.status(StatusCodes.ACCEPTED).send(games.rows);
    } catch (error) {
        console.log(error);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function postGame(req, res) {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
    try {
        const category = (await connection
            .query('SELECT * FROM categories WHERE id=$1;', [categoryId])).rows[0];
        const gameName = (await connection
            .query('SELECT * FROM games WHERE name=$1;', [name])).rows[0];
        if (category && !gameName) {
            await connection.query(
                `INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") 
                VALUES ($1,$2,$3,$4,$5);`
                , [name, image, stockTotal, categoryId, pricePerDay]);
            return res.sendStatus(StatusCodes.CREATED);
        }
        if (!category && gameName) {
            return res.status(StatusCodes.CONFLICT).
                send('Error: category Id doesn`t exist and game name already exist');
        }
        if (!category) {
            return res.status(StatusCodes.BAD_REQUEST).send('Error: category Id doesn`t exist');
        }
        if (gameName) {
            return res.status(StatusCodes.CONFLICT).send('Error: game name already exist');
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }

}

export { getGames, postGame }