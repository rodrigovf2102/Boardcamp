import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/server.routes.js'

dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());
server.use(router);

const port = process.env.API_PORT;

server.listen(port, ()=> console.log('Server ON'));