import fs from 'fs';
import aws from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3.js';
import * as FileType from 'file-type';
import dotenv from 'dotenv';
import { logger } from './logger.utils.js';

dotenv.config();

const { DEFAULT_DIR, SPACE_NAME, SPACE_ENDPOINT } = process.env;

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint(SPACE_ENDPOINT);
const s3 = new S3({
  endpoint: spacesEndpoint,
});

export async function saveToSpaces(fileName) {
  try {
    const fileType = await FileType.fileTypeFromFile(fileName);
    const fileContent = await fs.createReadStream(fileName);
    const start = Date.now();

    const params = {
      Bucket: SPACE_NAME,
      Key: `${DEFAULT_DIR}/${fileName}`,
      Body: fileContent,
      ContentType: fileType.mime,
      ACL: 'public-read',
    };
    const data = await s3.putObject(params).promise();
    await fs.unlinkSync(fileName);
    const time = (Date.now() - start) / 1000;
    logger.info('\nDownload complete', data);
    logger.info(`\ndone, thanks - ${time}s`);
    return { ...data, time, url: `https://${SPACE_NAME}.${SPACE_ENDPOINT}/${params.Key}` };
  } catch (error) {
    throw new Error(error);
  }
}
export default saveToSpaces;
