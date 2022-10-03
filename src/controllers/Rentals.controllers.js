import connection from "../database.js";
import { StatusCodes } from "http-status-codes";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
dayjs.extend(relativeTime);

async function getRentals(req, res) {
    let { customerId, gameId, offset, limit } = req.query;
    if (!offset) { offset = 0; }
    if (!limit) { limit = 100; }
    try {
        let rentals;
        const standardQuerySearch = `SELECT rentals.*,customers.id AS "customerId",customers.name,
        games.name AS "gameName", games."categoryId",
        categories.name AS "categoryName" FROM rentals 
            JOIN customers ON rentals."customerId"=customers.id
            JOIN games ON rentals."gameId"=games.id
            JOIN categories ON games."categoryId"=categories.id`;
        if (!customerId && !gameId) {
            rentals = (await connection.query(
                `${standardQuerySearch} OFFSET $1 LIMIT $2;`,[offset,limit])).rows;
        }
        if (!customerId && gameId) {
            rentals = (await connection.query(
                `${standardQuerySearch} WHERE games.id=$1 OFFSET $1 LIMIT $2;`,
                [gameId,offset,limit])).rows;
        }
        if (customerId && !gameId) {
            rentals = (await connection.query(
                `${standardQuerySearch} WHERE customers.id=$1 OFFSET $1 LIMIT $2;`,
                [customerId,offset,limit])).rows;
        }
        if (customerId && gameId) {
            rentals = (await connection.query(
                `${standardQuerySearch} WHERE customers.id=$1 AND games.id=$2 OFFSET $1 LIMIT $2;`,
                [customerId, gameId,offset,limit])).rows;
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

async function postRentalReturn(req, res) {
    const { id } = req.params;
    const ticksPerDay = 864000000000;
    try {
        const rental = (await connection.query('SELECT * FROM rentals WHERE id=$1;', [id])).rows[0];
        if (!rental) {
            return res.status(StatusCodes.NOT_FOUND).send('Error: rental not found');
        }
        if (rental.returnDate !== null) {
            return res.status(StatusCodes.BAD_REQUEST).send('Error: game already returned');
        }
        rental.returnDate = new Date(dayjs().format('MM/DD/YYYY'));
        let delayedDays = Math.ceil(
            (rental.returnDate.getTime() - rental.daysRented * ticksPerDay - rental.rentDate.getTime())
            / ticksPerDay);
        if (delayedDays < 0) {
            delayedDays = 0;
        }
        rental.delayFee = delayedDays * (rental.originalPrice / rental.daysRented);
        const game = (await connection.query('SELECT * FROM games WHERE id=$1;', [rental.gameId])).rows[0];
        const gameStock = game.stockTotal + 1;
        await connection.query('UPDATE games SET "stockTotal"=$1 WHERE id=$2;', [gameStock, game.id]);
        await connection.query('UPDATE rentals SET "returnDate"=$1,"delayFee"=$2 WHERE id=$3;',
            [rental.returnDate, rental.delayFee, id])
        return res.sendStatus(StatusCodes.OK);
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function deleteRental(req, res) {
    const { id } = req.params;
    try {
        const verificationId = (await connection.query('SELECT * FROM rentals WHERE id=$1', [id])).rows[0];
        console.log(verificationId)
        if (!verificationId) {
            return res.status(StatusCodes.NOT_FOUND).send('Error: rental id not found');
        }
        await connection.query('DELETE FROM rentals WHERE id=$1', [id]);
        return res.sendStatus(StatusCodes.OK);
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

export { getRentals, postRental, postRentalReturn, deleteRental }
