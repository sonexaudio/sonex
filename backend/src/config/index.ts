import dotenv from "dotenv";
dotenv.config();

const config = {
	port: process.env.PORT!,
	auth: {
		sessionSecret: process.env.SESSION_SECRET!,
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackUrl: process.env.GOOGLE_CALLBACK_URL!,
		},
	},
	frontendUrl: process.env.FRONTEND_URL!,
};

export default config;
