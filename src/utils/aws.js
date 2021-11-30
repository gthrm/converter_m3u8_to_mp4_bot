import fs from 'fs';
import aws from 'aws-sdk';

const {DEFAULT_DIR, SPACE_NAME, SPACE_ENDPOINT} = process.env;

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint(SPACE_ENDPOINT);
const s3 = new aws.S3({
	endpoint: spacesEndpoint,
});

export async function saveToSpaces(fileName) {
	try {
		const start = Date.now();
		const key = `${DEFAULT_DIR}/${fileName}`;
		const data = await s3
			.putObject({
				Bucket: SPACE_NAME,
				Key: key,
				Body: await fs.readFileSync(fileName),
				ACL: 'public-read',
			})
			.promise();
		console.log('====================================');
		console.log('data', data);
		console.log('====================================');
		await fs.unlinkSync(fileName);
		const time = (Date.now() - start) / 1000;
		console.log('\nDownload complete', data);
		console.log(`\ndone, thanks - ${time}s`);
		return {
			...data,
			time,
			url: `https://${SPACE_NAME}.${SPACE_ENDPOINT}/${key}`,
		};
	} catch (error) {
		throw new Error(error);
	}
}
