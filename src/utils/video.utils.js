/* eslint-disable no-constructor-return */
/* eslint-disable max-len */
/* eslint-disable camelcase */
import { logger } from './logger.utils.js';
import { RedisClient } from './redis.utils.js';

const redisClient = new RedisClient();

export default class RealsVideoProcessor {
  constructor(ctx) {
    if (RealsVideoProcessor.instance) {
      return RealsVideoProcessor.instance;
    }
    this.queue = [];
    this.isProcessing = false;
    this.init(ctx);
    RealsVideoProcessor.instance = this;
  }

  async addVideoToQueue({ url, ctx }) {
    const waitMessage = await ctx.reply('Wait a second...');

    this.queue.push({
      url, message_id: waitMessage.message_id, reply_to_message_id: ctx.message.message_id, chatId: ctx.chat.id,
    });

    redisClient.set('queue', this.queue);

    logger.info(`Added video to queue: ${url}`);
    if (!this.isProcessing) {
      this.processVideoQueue(ctx);
    }
  }

  updateQueue() {
    return redisClient.set('queue', this.queue);
  }

  async processVideoQueue(ctx) {
    try {
      if (this.queue.length > 0 && !this.isProcessing) {
        logger.info('Processing video queue');

        this.isProcessing = true;
        const video = this.queue.shift();

        logger.info(`Processing video: ${video.url}`);
        // const {
        //   url, message_id, reply_to_message_id, chatId,
        // } = video;

        // TODO

        this.isProcessing = false;
        await this.updateQueue();
        return this.processVideoQueue(ctx);
      }
      return null;
    } catch (error) {
      logger.error(error);
      return this.processVideoQueue(ctx);
    }
  }

  async init(ctx) {
    this.queue = await redisClient.get('queue') || [];
    this.processVideoQueue(ctx);
  }
}
