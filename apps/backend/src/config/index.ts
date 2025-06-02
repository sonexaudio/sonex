import dotenv from "dotenv";
dotenv.config();

const config = {
	port: process.env.PORT!,
	environment: process.env.NODE_ENV || "development",
	auth: {
		sessionSecret: process.env.SESSION_SECRET!,
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackUrl: process.env.GOOGLE_CALLBACK_URL!,
		},
	},
	frontendUrl: process.env.FRONTEND_URL!,
	stripe: {
		secretKey: process.env.STRIPE_SECRET_KEY!,
		webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
		connectSecret: process.env.STRIPE_CONNECT_WEBHOOK_SECRET!,
	},
	dbUrl: process.env.DATABASE_URL!,
	storage: {
		accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
		secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
		endpoint: process.env.CLOUDFLARE_ENDPOINT!
	}
};

export default config;
