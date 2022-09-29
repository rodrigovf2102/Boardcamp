import express from 'express';
import { getGames } from '../controllers/Games.controllers.js';

const gamesRouter = express.Router();

gamesRouter.get('/games',getGames);

export default gamesRouter;