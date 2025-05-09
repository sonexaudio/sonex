import createServer from "./utils/server";
import config from "./config";

const { port } = config;

const app = createServer();

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
