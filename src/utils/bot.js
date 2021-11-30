import {Telegraf} from 'telegraf';
import {download} from './download.js';
import {log} from './logger.js';
import {db, posts} from './db.js';

const {AVAILABLE_USER_IDS, BOT_TOKEN} = process.env;
const HTTPS_IDENTIFIER = 'https://';
const M3U8_IDENTIFIER = '.m3u8';

const handlerTextBot = async ctx => {
	const userId = ctx.message.from.id;
	const isBot = ctx.message.from?.is_bot;
	const firstName = ctx.message.from?.first_name;
	if (!isBot) {
		const availableUserIds = AVAILABLE_USER_IDS.split(';');
		const {text} = ctx.message;
		const validUrl = text.includes(HTTPS_IDENTIFIER) && text.includes(M3U8_IDENTIFIER);
		if (!availableUserIds.includes(String(userId))) {
			log.warn(`User ${userId}, name ${firstName} is stranger`);
			return ctx.reply(`${firstName}, you stranger!`);
		}

		if (!validUrl) {
			log.warn(`User ${userId}, name ${firstName} url not valid`);
			return ctx.reply('It\'s not valid');
		}

		try {
			const {result} = await download(text, ctx);
			log.info({result});
			posts.push(result);
			// await db.write();
			return ctx.reply(`Url: ${result.url}, time: ${result.time}`);
		} catch (error) {
			log.error(error);
			return ctx.reply(error.message);
		}
	}

	log.warn(`User ${userId} is bot`);
	return ctx.reply(`${firstName}, you fucking bot!`);
};

export const bot = new Telegraf(BOT_TOKEN, {handlerTimeout: 9_000_000});
bot.start(ctx => ctx.reply('Welcome!'));
bot.help(ctx => ctx.reply('Send me a link'));
bot.on('sticker', ctx => ctx.reply('👍'));
bot.on('text', handlerTextBot);
bot.hears('hi', ctx => ctx.reply('Hey there'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
