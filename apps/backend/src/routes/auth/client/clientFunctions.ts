import { addDays } from "date-fns";
import jwt from "jsonwebtoken";
import config from "../../../config";
import { generateClientAccessToken, generateTokenHash } from "../../../utils/token";
import { addClientAccessDataToDatabase, updateClientAccessData } from "../../../services/auth.service";
import { findClientAccessByToken } from "../../../services/db.service";

export async function sendClientAccess(email: string, projectId: string): Promise<{ token: string; url: string; } | null> {
    try {
        const token = generateClientAccessToken();
        const hashedToken = generateTokenHash(token);
        const expires = addDays(new Date(), 3); // expires in 3 days

        await addClientAccessDataToDatabase({
            email,
            projectId,
            token: hashedToken,
            expires
        });

        const url = generateClientAccessUrl(projectId, token);

        // TODO: Send email to client

        return { token, url };
    } catch (error) {
        console.error(error);
        return null;
    }
}


export async function validateClientCode(code: string, projectId: string) {
    const hashedToken = generateTokenHash(code);

    const access = await findClientAccessByToken(hashedToken, projectId);

    if (!access || access.projectId !== projectId || access.expires < new Date()) {
        return null;
    }

    // Mark code as accepted once validated and create a JWT token
    await updateClientAccessData({
        token: hashedToken, data: { acceptedAt: new Date() }
    });

    const clientToken = jwt.sign({
        projectId, email: access.email
    }, config.auth.clientTokenSecret);

    return clientToken;
}

function generateClientAccessUrl(projectId: string, token: string) {
    return `${config.frontendUrl}/projects/${projectId}?code=${token}`;
}