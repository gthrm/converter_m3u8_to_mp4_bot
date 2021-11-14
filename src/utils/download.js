import Converter from './converter.js';
import {v4 as uid} from 'uuid';
import {saveToSpaces} from './aws.js';
import {log} from './logger.js';

const converter = new Converter();
export async function download(m3uPath, ctx) {
	try {
		const fileNameInput = `${uid()}.mp4`;
		await converter.setInputFile(m3uPath)
			.setOutputFile(fileNameInput)
			.setContext(ctx)
			.start();
		const result = await saveToSpaces(fileNameInput);
		return {result};
	} catch (error) {
		console.log('====================================');
		console.log('download', error);
		console.log('====================================');
		const message = 'It\'s f*cking error';
		const errorData = {error: {message, data: error}};
		log.error(errorData);
		throw new Error(message);
	}
}
