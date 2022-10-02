import connection from "../database.js";
import { StatusCodes } from "http-status-codes";
import dayjs from 'dayjs';

async function getRentals(req, res) {
    const { customerId, gameId } = req.query;
    try {
        let rentals;
        let standardQuerySearch = `SELECT rentals.*,customers.id AS "customerId",customers.name,
        games.name AS "gameName", games."categoryId",
        categories.name AS "categoryName" FROM rentals 
            JOIN customers ON rentals."customerId"=customers.id
            JOIN games ON rentals."gameId"=games.id
            JOIN categories ON games."categoryId"=categories.id`;
        if (!customerId && !gameId) {
            rentals = (await connection.query(`${standardQuerySearch};`)).rows;
        }
        if (!customerId && gameId) {
            rentals = (await connection.query(
                `${standardQuerySearch} WHERE games.id=$1;`, [gameId])).rows;
        }
        if (customerId && !gameId) {
            rentals = (await connection.query(
                `${standardQuerySearch} WHERE customers.id=$1;`, [customerId])).rows;
        }
        if (customerId && gameId) {
            rentals = (await connection.query(
                `${standardQuerySearch} WHERE customers.id=$1 AND games.id=$2;`, [customerId, gameId])).rows;
        }
        for (let i = 0; i < rentals.length; i++) {
            rentals[i].customer = {
                id: rentals[i].customerId,
                name: rentals[i].name
            };
            rentals[i].game = {
                id: rentals[i].gameId,
                name: rentals[i].gameName,
                categoryId: rentals[i].categoryId,
                categoryName: rentals[i].categoryName
            }
            delete rentals[i].name;
            delete rentals[i].gameName;
            delete rentals[i].categoryId;
            delete rentals[i].categoryName;
        }
        return res.status(StatusCodes.OK).send(rentals);
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function postRental(req, res) {
    const { customerId, gameId, daysRented } = req.body;
    const rental = {
        customerId: customerId,
        gameId: gameId,
        rentDate: dayjs().format('DD/MM/YYYY'),
        daysRented: daysRented,
        returnDate: null,
        originalPrice: null,
        delayFee: null
    }
    try {
        const gamePricePerDay = (await connection.query(
            'SELECT games."pricePerDay" FROM games WHERE games.id=$1', [gameId]
        )).rows[0].pricePerDay;
        const clientIdVerification = (await connection.query('SELECT * FROM customers WHERE id=$1;', [customerId])).rows[0];
        const gameIdVerification = (await connection.query('SELECT * FROM games WHERE id=$1;', [gameId])).rows[0];
        if (!clientIdVerification && !gameIdVerification) {
            return res.status(StatusCodes.BAD_REQUEST).send('Error: client Id and game Id doesn`t exist');
        }
        if (!clientIdVerification) {
            return res.status(StatusCodes.BAD_REQUEST).send('Error: client Id doesn`t exist');
        }
        if (!gameIdVerification) {
            return res.status(StatusCodes.BAD_REQUEST).send('Error: game Id doesn`t exist');
        }
        if (gameIdVerification.stockTotal <= 0) {
            return res.status(StatusCodes.BAD_REQUEST).send('Error: game not available on stock');
        }
        if (gameIdVerification.stockTotal > 0) {
            const gameStock = gameIdVerification.stockTotal - 1;
            await connection.query('UPDATE games SET "stockTotal"=$1 WHERE id=$2', [gameStock, gameId]);
        }
        rental.originalPrice = gamePricePerDay * rental.daysRented;
        await connection.query(`INSERT INTO rentals 
            ("customerId","gameId","rentDate","daysRented","returnDate","originalPrice","delayFee")
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
                rental.customerId, rental.gameId, rental.rentDate, rental.daysRented, rental.returnDate,
                rental.originalPrice, rental.delayFee
            ]);
        return res.sendStatus(StatusCodes.CREATED);
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }

}



export { getRentals, postRental }
