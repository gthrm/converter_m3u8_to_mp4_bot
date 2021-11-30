import fs from 'fs';
import aws from 'aws-sdk';
import * as FileType from 'file-type';
const {DEFAULT_DIR, SPACE_NAME, SPACE_ENDPOINT} = process.env;

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint(SPACE_ENDPOINT);
const s3 = new aws.S3({
	endpoint: spacesEndpoint,
});

export async function saveToSpaces(fileName) {
	try {
		const fileType = await FileType.fileTypeFromFile(fileName);
		const fileContent = await fs.readFileSync(fileName);
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
		console.log('\nDownload complete', data);
		console.log(`\ndone, thanks - ${time}s`);
		return {...data, time, url: `https://${SPACE_NAME}.${SPACE_ENDPOINT}/${params.Key}`};
	} catch (error) {
		throw new Error(error);
	}
}
