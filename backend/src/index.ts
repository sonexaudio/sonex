import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import config from "./config";
import routes from "./routes";

const { frontendUrl, auth, port } = config;

const app = express();
app.use(express.json());
app.use(
	cors({
		credentials: true,
		origin: frontendUrl,
	}),
);
app.use(
	session({
		secret: auth.sessionSecret,
		resave: false,
		saveUninitialized: false,
	}),
);
app.use(morgan("common"));

app.use(routes);

app.listen(port, () => console.log(`Server running on port ${port}`));
