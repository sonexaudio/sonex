import { type Response, Router } from "express";
import { errorResponse, successResponse } from "../../../utils/responses";
import { sendClientAccess, validateClientCode } from "./clientFunctions";
import { prisma } from "../../../lib/prisma";
import config from "../../../config";
import jwt from "jsonwebtoken";
import { generateTokenHash } from "../../../utils/token";

const clientAuthRouter = Router();

const isProduction = config.environment === "production";

clientAuthRouter.get("/", async (req, res) => {
    // get client authorization from request headers
    const token = req.cookies?.client_token || req.cookies?.client_refresh_token;

    if (!token) {
        successResponse(res, { client: null });
        return;
    }

    try {
        console.log("Verifying client token:", token);
        const payload = jwt.verify(token, config.auth.clientTokenSecret) as { email: string; };

        const client = await prisma.client.findFirst({
            where: { email: payload.email },
        });

        if (!client) {
            errorResponse(res, 404, "Client not found");
            return;
        }

        console.log("First client found:", client);

        successResponse(res, { client });

    } catch (error) {
        console.error("JWT verify failed", error);
        successResponse(res, { client: null });
    }

});

/*
    TODO- Hold until emails are setup
*/

// clientAuthRouter.post("/send-project-access", async (req, res) => {
//     const { email, projectId } = req.body;

//     if (!email || !projectId) {
//         errorResponse(res, 400, "Missing email or projectId");
//         return;
//     }

//     try {
//         console.log(
//             "Sending client access for project:",
//             projectId,
//             "to email:",
//             email,
//         );

//         // Call the function to send client access
//         // TODO - need a check to make sure project exists
//         const result = await sendClientAccess(email, projectId);
//         if (!result) {
//             errorResponse(res, 500, "Failed to create client access");
//             return;
//         }

//         successResponse(res, {
//             token: result.token,
//             url: result.url,
//         }); // for dev, will update to email
//     } catch (error) {
//         console.error(error);
//         errorResponse(res, 500, "Failed to create client access");
//     }
// });

clientAuthRouter.post("/validate", async (req, res) => {
    try {
        const { code, projectId, name, email } = req.body;

        if (!code || !projectId || !email || !name) {
            errorResponse(res, 400, "All fields required");
            return;
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project || project.shareCode !== code) {
            errorResponse(res, 401, "Invalid code");
            return;
        }

        // Create client if it doesn't exist
        const client = await prisma.client.upsert({
            where: { email_userId: { email, userId: project.userId } },
            update: { name },
            create: { email, name, userId: project.userId },
        });

        // add to client project
        await prisma.clientProject.upsert({
            where: {
                clientId_projectId: { clientId: client.id, projectId: project.id },
            },
            update: {},
            create: { clientId: client.id, projectId: project.id },
        });

        const { accessToken, refreshToken } = signClientTokens(
            client.id,
            projectId,
            email,
        );

        // Set cookies
        addTokensToBrowserCookies(res, refreshToken, accessToken);

        successResponse(res, { client: { name: client.name, email: client.email, accessToken, refreshToken } });
    } catch (error) {
        errorResponse(res, 500, "Internal server error");
    }
});

clientAuthRouter.post("/refresh-token", async (req, res) => {
    const refresh = req.cookies?.client_refresh_token;

    if (!refresh) {
        res.sendStatus(401);
        return;
    }

    try {
        const { clientId, projectId, email } = jwt.verify(refresh, config.auth.sessionSecret) as { clientId: string; projectId: string; email: string; };

        const { refreshToken } = signClientTokens(clientId, projectId, email);

        addTokensToBrowserCookies(res, refreshToken);

        successResponse(res, { refreshToken });

    } catch (error) {
        res.sendStatus(403);
        return;
    }
});

clientAuthRouter.post("/logout", (req, res) => {
    res.clearCookie("client_token", {
        domain: isProduction ? ".sonex.app" : undefined,
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    res.clearCookie("client_refresh_token", {
        domain: isProduction ? ".sonex.app" : undefined,
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    successResponse(res, { message: "Logged out successfully" });
});

function signClientTokens(
    clientId: string,
    projectId: string,
    email: string,
): {
    accessToken: string;
    refreshToken: string;
} {
    const accessToken = jwt.sign(
        { clientId, projectId, email },
        config.auth.clientTokenSecret,
        { expiresIn: "15m" }, // 15 minutes
    );

    const refreshToken = jwt.sign(
        { clientId, projectId, email },
        config.auth.sessionSecret,
        { expiresIn: "7d" },
    );

    return { accessToken, refreshToken };
}

function addTokensToBrowserCookies(
    res: Response,
    refreshToken: string,
    accessToken?: string,
) {
    if (accessToken) {
        res.cookie("client_token", accessToken, {
            httpOnly: true,
            domain: isProduction ? ".sonex.app" : undefined,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
    }


    res.cookie("client_refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: isProduction ? ".sonex.app" : undefined,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}

export default clientAuthRouter;
