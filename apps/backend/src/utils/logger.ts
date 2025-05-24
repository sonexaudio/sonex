import winston from "winston";

const { format } = winston;

const logger = winston.createLogger({
	format: format.combine(
		format.timestamp(),
		format.simple(),
		format.colorize(),
	),
	transports: [
		new winston.transports.Console({
			format: format.combine(format.colorize(), format.simple()),
		}),
		new winston.transports.File({ filename: "app.log" }),
	],
});

export default logger;
