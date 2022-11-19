import express from 'express';
import dotenv from 'dotenv';
import { bot } from './utils/bot.utils.js';
import { limiter } from './utils/limiter.utils.js';
import { logger } from './utils/logger.utils.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3344;

app.use(express.json());
app.use(limiter);

app.listen(port, () => {
  logger.info(`App listening at http://localhost:${port}`);
  bot.launch();
});
