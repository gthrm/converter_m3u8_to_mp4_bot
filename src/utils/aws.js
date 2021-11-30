import fs from 'fs';
import aws from 'aws-sdk';
import {fileTypeFromFile} from 'file-type';

const {DEFAULT_DIR, SPACE_NAME, SPACE_ENDPOINT} = process.env;

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint(SPACE_ENDPOINT);
const s3 = new aws.S3({
	endpoint: spacesEndpoint,
});

export async function saveToSpaces(fileName) {
	return fs.readFile(fileName, async (error, buffer) => {
		if (error) {
			throw new Error(error);
		}

		const key = `${DEFAULT_DIR}/${fileName}`;
		try {
			const fileType = await fileTypeFromFile(fileName);
			console.log('====================================');
			console.log('fileType', fileType);
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
			await s3.putObject(params).promise();
		} catch (err) {
			throw new Error(err);
		}
	});
}
