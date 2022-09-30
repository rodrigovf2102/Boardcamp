import express from 'express';
import { getGames, postGame } from '../controllers/Games.controllers.js';
import { gameValidations } from '../middleware/GamesValidations.js';

const gamesRouter = express.Router();

gamesRouter.get('/games',getGames);
gamesRouter.post('/games',gameValidations,postGame);

export default gamesRouter;