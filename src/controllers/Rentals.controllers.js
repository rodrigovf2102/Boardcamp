import connection from "../database.js";
import { StatusCodes } from "http-status-codes";

async function getRentals(req,res){
    const {customerId,gameId} = req.query;
    try {
        let rentals;
        let standardQuerySearch = `SELECT rentals.*,customers.id AS "customerId",customers.name,
        games.name AS "gameName", games."categoryId",
        categories.name AS "categoryName" FROM rentals 
            JOIN customers ON rentals."customerId"=customers.id
            JOIN games ON rentals."gameId"=games.id
            JOIN categories ON games."categoryId"=categories.id`;
        if(!customerId && !gameId){
            rentals = (await connection.query(`${standardQuerySearch};`)).rows;
        }
        if(!customerId && gameId){
            rentals = (await connection.query(
                `${standardQuerySearch} WHERE games.id=$1;`,[gameId])).rows;
        }
        if(customerId && !gameId){
            rentals = (await connection.query(
                `${standardQuerySearch} WHERE customers.id=$1;`,[customerId])).rows;
        }
        if(customerId && gameId){
            rentals = (await connection.query(
                `${standardQuerySearch} WHERE customers.id=$1 AND games.id=$2;`,[customerId,gameId])).rows;
        }
        for(let i=0;i<rentals.length;i++){
            rentals[i].customer = {
                id:rentals[i].customerId,
                name:rentals[i].name
            };
            rentals[i].game = {
                id:rentals[i].gameId,
                name:rentals[i].gameName,
                categoryId:rentals[i].categoryId,
                categoryName:rentals[i].categoryName
            }
            delete rentals[i].name;
            delete rentals[i].gameName;
            delete rentals[i].categoryId;
            delete rentals[i].categoryName;
        }
        res.status(StatusCodes.OK).send(rentals);
    } catch (error) {
        console.log(error.message);
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}



export {getRentals}
