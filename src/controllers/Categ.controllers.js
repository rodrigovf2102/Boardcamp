import connection from "../database.js";
import {StatusCodes} from 'http-status-codes';

async function getCategorie(req,res){
    const {id} = req.params;
    try{
        const categorie = await connection.query('SELECT * FROM categories WHERE id=$1',[id]);
        if(!categorie){
            res.status(StatusCodes.NOT_FOUND).send('Error: categorie not found');
        }
        res.status(StatusCodes.ACCEPTED).send(categorie.rows[0]);
    }
    catch(error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getCategories(req,res){
    try{
        const categorie = await connection.query('SELECT * FROM categories');
        if(!categorie){
            res.status(StatusCodes.NOT_FOUND).send('Error: categories are empty');
        }
        res.status(StatusCodes.ACCEPTED).send(categorie.rows);
    }
    catch(error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

export {getCategories, getCategorie}