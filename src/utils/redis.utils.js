/* eslint-disable no-constructor-return */
import { createClient } from 'redis';
import { logger } from './logger.utils.js';

export class RedisClient {
  constructor() {
    if (RedisClient.instance) {
      return RedisClient.instance;
    }
    this.client = null;
    RedisClient.instance = this;
  }

  async init() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL,
      });
      logger.info('Connecting to Redis client');
      this.client.on('error', (err) => logger.error('Redis Client Error', err));
      await this.client.connect();
      logger.info('Redis client connected');
    } catch (error) {
      logger.error('Error while connecting to Redis client', error);
    }
  }

  async get(key) {
    try {
      if (this.client) {
        return JSON.parse(await this.client.get(key));
      }
      return null;
    } catch (error) {
      logger.error('Error while getting value from Redis', error);
      return null;
    }
  }

  async set(key, value) {
    try {
      if (this.client) {
        return await this.client.set(key, JSON.stringify(value));
      }
      return null;
    } catch (error) {
      logger.error('Error while setting value to Redis', error);
      return null;
    }
  }
}
