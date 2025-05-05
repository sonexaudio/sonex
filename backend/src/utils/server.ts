/* 
	Express factory function so that app instance can be called separately in testing
*/
import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import config from "../config";
import routes from "../routes";
import passport from "passport";

const { frontendUrl, auth } = config;

export default function createServer() {
	// instantiate express
	const app = express();

	// Establish middleware
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
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(morgan("common"));

	// Create routes
	app.use(routes);

	return app;
}
