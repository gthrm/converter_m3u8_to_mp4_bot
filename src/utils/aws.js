import fs from 'fs';
import aws from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3.js';
import * as FileType from 'file-type';

const {DEFAULT_DIR, SPACE_NAME, SPACE_ENDPOINT} = process.env;

// Set S3 endpoint to DigitalOcean Spaces
const s3 = new S3({
	endpoint: new aws.Endpoint(SPACE_ENDPOINT),
});

export async function saveToSpaces(fileName) {
	fs.readFile(fileName, async (error, buffer) => {
		if (error) {
			throw new Error(error);
		}

		const key = `${DEFAULT_DIR}/${fileName}`;
		try {
			const start = Date.now();
			const fileType = await FileType.fileTypeFromFile(fileName);
			console.log('====================================');
			console.log('fileType', fileType, 'fileName', fileName);
			console.log('====================================');
			const params = {
				Bucket: SPACE_NAME,
				Key: key,
				Body: buffer,
				ContentType: fileType?.mime,
				ACL: 'public-read',
			};
			console.log('====================================');
			console.log('params', params);
			console.log('====================================');
			const data = await s3.putObject(params).promise();
			const time = (Date.now() - start) / 1000;
			return {
				...data,
				time,
				url: `https://${SPACE_NAME}.${SPACE_ENDPOINT}/${params.Key}`,
			};
		} catch (err) {
			throw new Error(err);
		}
	});
}
