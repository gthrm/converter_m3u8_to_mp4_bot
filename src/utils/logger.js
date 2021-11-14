import bunyan from 'bunyan';

export const log = bunyan.createLogger({
	name: 'ips',
	streams: [{path: process.env.LOG_PATH}],
});
