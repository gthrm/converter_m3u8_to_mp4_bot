import { v4 as uid } from 'uuid';
import dotenv from 'dotenv';
import Converter from './converter.utils.js';
import { saveToSpaces } from './aws.utils.js';
import { logger } from './logger.utils.js';

dotenv.config();

const converter = new Converter();
export async function download(m3uPath, ctx) {
  try {
    const newFileName = uid();
    logger.info('New file name', newFileName);
    const fileNameInput = `${newFileName}.mp4`;
    await converter.setInputFile(m3uPath)
      .setOutputFile(fileNameInput)
      .setContext(ctx)
      .start();
    const result = await saveToSpaces(fileNameInput);
    return { result };
  } catch (error) {
    const message = 'Error!';
    const errorData = { error: { message, data: error } };
    logger.error(errorData);
    throw new Error(message);
  }
}

export default download;
