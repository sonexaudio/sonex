import { type Response, Router } from "express";
import { sendErrorResponse, sendSuccessResponse } from "../../../utils/responses";
import { prisma } from "../../../lib/prisma";
import config from "../../../config";
import jwt from "jsonwebtoken";
import { findClientByEmail, findProjectById } from "../../../services/db.service";
import { NotFoundError } from "../../../errors";
import { addClient, addClientToProject } from "../../../services/client.service";


const clientAuthRouter = Router();

const isProduction = config.environment === "production";

clientAuthRouter.get("/", async (req, res) => {
    // get client authorization from request headers
    const token = req.cookies?.client_token || req.cookies?.client_refresh_token;

    if (!token) {
        sendSuccessResponse(res, { client: null });
        return;
    }

    try {
        const payload = jwt.verify(token, config.auth.clientTokenSecret) as { email: string; };

        const client = await findClientByEmail(payload.email);

        if (!client) {
            throw new NotFoundError("Client does not exist");
        }

        sendSuccessResponse(res, { client });

    } catch (error) {
        console.error("JWT verify failed", error);
        sendSuccessResponse(res, { client: null });
    }

});

/*
    TODO- Hold sending project access codes until emails are setup
*/

clientAuthRouter.post("/validate", async (req, res) => {
    try {
        const { code, projectId, name, email } = req.body;

        if (!code || !projectId || !email || !name) {
            sendErrorResponse(res, 400, "All fields required");
            return;
        }

        const project = await findProjectById(projectId);

        if (!project || project.shareCode !== code) {
            sendErrorResponse(res, 401, "Invalid code");
            return;
        }

        // Create client if it doesn't exist
        const client = await addClient({ email, name, userId: project.userId });

        // add to client project
        await addClientToProject({ clientId: client.id, projectId });

        const { accessToken, refreshToken } = signClientTokens(
            client.id,
            projectId,
            email,
        );

        // Set cookies
        addTokensToBrowserCookies(res, refreshToken, accessToken);

        sendSuccessResponse(res, { client: { name: client.name, email: client.email, accessToken, refreshToken } });
    } catch (error) {
        sendErrorResponse(res, 500, "Internal server error");
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

        sendSuccessResponse(res, { refreshToken });

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
    sendSuccessResponse(res, { message: "Logged out successfully" });
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
