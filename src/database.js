import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();


const {Pool} = pg;


const connection = new Pool({
    user: process.env.USER_DB,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE
  });
  
export default connection;