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
import pg from "pg";
import pgSession from "connect-pg-simple";
import helmet from "helmet";

const { frontendUrl, auth, dbUrl, environment } = config;

const isProduction: boolean = environment === "production";

// PGSession for storing authentication sessions
const pgPool = new pg.Pool({
	connectionString: dbUrl, // same as db im currently working in
});

const PGSession = pgSession(session);

export default function createServer() {
	// instantiate express
	const app = express();

	// Establish middleware
	// Set security headers
	app.use(
		helmet({
			contentSecurityPolicy: false,
			crossOriginEmbedderPolicy: false,
		}),
	);

	app.use(
		cors({
			credentials: true,
			origin: frontendUrl,
		}),
	);
	app.use(
		session({
			secret: auth.sessionSecret,
			resave: false, // Only resave when session changes
			saveUninitialized: false, // Don't save uninitialized sessions
			store: new PGSession({
				pool: pgPool,
				tableName: "user_sessions",
				createTableIfMissing: true,
			}),
			cookie: {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction && "none",
				maxAge: 15 * 24 * 60 * 60 * 1000, // 15 Days
			},
		}),
	);
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(morgan("dev"));

	// Create routes
	app.use(routes);

	return app;
}
