import Converter from './converter.js';
import {v4 as uid} from 'uuid';
import {saveToSpaces} from './aws.js';
import {log} from './logger.js';

const converter = new Converter();
export async function download(m3uPath, ctx) {
	try {
		const fileNameInput = `${uid()}.mp4`;
		console.log('====================================');
		console.log('fileNameInput', fileNameInput);
		console.log('====================================');
		await converter.setInputFile(m3uPath)
			.setOutputFile(fileNameInput)
			.setContext(ctx)
			.start();
		const result = await saveToSpaces(fileNameInput);
		console.log('====================================');
		console.log('result', result);
		console.log('====================================');
		return {result};
	} catch (error) {
		const message = 'It\'s f*cking error';
		const errorData = {error: {message, data: error}};
		log.error(errorData);
		throw new Error(message);
	}
}
