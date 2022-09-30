import { StatusCodes } from "http-status-codes";
import connection from "../database.js";

async function getGames(req, res) {
    const { name } = req.query;
    let nameCaseInsensitive = '';
    if (name) {
        for (let i = 0; i < name.length; i++) {
            if (i === 0) nameCaseInsensitive += name[i].toUpperCase();
            if (i !== 0) nameCaseInsensitive += name[i].toLowerCase();
        }
    }
    try {
        let games;
        if (name) {
            games = await connection.query(
                'SELECT games.*,categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id WHERE games.name LIKE $1', [`${nameCaseInsensitive}%`]);
        }
        if (!name) {
            games = await connection.query(
                'SELECT games.*,categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id');
        }
        if (games.rows.length < 1) {
            return res.status(StatusCodes.NOT_FOUND).send('Games table is empty');
        }
        return res.status(StatusCodes.ACCEPTED).send(games.rows);
    } catch (error) {
        console.log(error);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

export { getGames }