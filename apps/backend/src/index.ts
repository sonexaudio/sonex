import createServer from "./utils/server";
import http from "http";
import config from "./config";
import logger from "./utils/logger";
import { setupSocketIO } from "./utils/socket";

const { port } = config;

const app = createServer();
const server = http.createServer(app);

setupSocketIO(server);

server
	.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	})
	.on("error", (error) => {
		logger.error(error.message);
		throw new Error(error.message);
	});
