import createServer from "./utils/server";
import config from "./config";
import logger from "./utils/logger";

const { port } = config;

const app = createServer();

app
	.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	})
	.on("error", (error) => {
		logger.error(error.message);
		throw new Error(error.message);
	});
