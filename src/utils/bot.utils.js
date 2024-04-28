import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { download } from './download.utils.js';
import { logger } from './logger.utils.js';

dotenv.config();

const { AVAILABLE_USER_IDS, BOT_TOKEN } = process.env;
const HTTPS_IDENTIFIER = 'https://';
const HTTP_IDENTIFIER = 'http://';
const M3U8_IDENTIFIER = '.m3u8';

const handlerTextBot = async (ctx) => {
  const userId = ctx.message.from.id;
  const isBot = ctx.message.from?.is_bot;
  const firstName = ctx.message.from?.first_name;
  if (!isBot) {
    const availableUserIds = AVAILABLE_USER_IDS.split(';');
    const { text } = ctx.message;
    const validUrl = (text.includes(HTTPS_IDENTIFIER) || text.includes(HTTP_IDENTIFIER))
    && text.includes(M3U8_IDENTIFIER);
    if (!availableUserIds.includes(String(userId))) {
      logger.error(`User ${userId}, name ${firstName} is stranger`);
      return ctx.reply(`${firstName}, you stranger!`);
    }

    if (!validUrl) {
      logger.error(`User ${userId}, name ${firstName} url not valid: ${text}`);
      return ctx.reply('It\'s not valid');
    }

    try {
      const { result } = await download(text, ctx);
      logger.info({ result });
      return ctx.reply(`Url: ${result.url}, time: ${result.time}`);
    } catch (error) {
      logger.error(error);
      return ctx.reply(error.message);
    }
  }

  logger.warn(`User ${userId} is bot`);
  return ctx.reply(`${firstName}, you fucking bot!`);
};

export const bot = new Telegraf(BOT_TOKEN, { handlerTimeout: 9_000_000 });
bot.start((ctx) => ctx.reply('Welcome!'));
bot.help((ctx) => ctx.reply('Send me a link'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.on('text', handlerTextBot);
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
