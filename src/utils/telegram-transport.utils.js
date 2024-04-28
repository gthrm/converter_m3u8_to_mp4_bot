import { Telegraf } from 'telegraf';
import Transport from 'winston-transport';

export class TelegramTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.telegramBot = new Telegraf(opts.telegramBotToken);
    this.chatId = opts.chatId;
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    if (info.level === 'error') {
      const message = `[${info.level.toUpperCase()}] - ${info.timestamp} - ${info.message}`;
      this.telegramBot.telegram.sendMessage(this.chatId, message)
        .then(() => callback())
        .catch((error) => console.error('Error sending message to Telegram:', error));
    } else {
      callback();
    }
  }
}
