import express from 'express';
import {bot} from './utils/bot.js';
import {limiter} from './utils/limiter.js';

const app = express();
const port = process.env.PORT || 3344;

app.use(express.json());
app.use(limiter);

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
	bot.launch();
});
