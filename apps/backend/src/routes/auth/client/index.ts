import { Router } from "express";
import { errorResponse, successResponse } from "../../../utils/responses";
import { sendClientAccess, validateClientCode } from "./clientFunctions";
import { prisma } from "../../../lib/prisma";

const clientAuthRouter = Router();

clientAuthRouter.get("/", async (req, res) => {
    // get client authorization from request headers

    const authorization = req.headers.authorization;
    const email = authorization?.split(" ")[1] || null;

    if (!authorization || !email) {
        successResponse(res, { client: null });
        return;
    }


    const client = await prisma.client.findFirst({
        where: { email }
    });

    if (!client) {
        errorResponse(res, 404, "Client not found");
        return;
    }

    successResponse(res, { client });
});

clientAuthRouter.post("/:id/send-access", async (req, res) => {
    const { email } = req.body;
    const projectId = req.params.id;

    if (!email || !projectId) {
        errorResponse(res, 400, "Missing email or projectId");
        return;
    }

    try {
        console.log("Sending client access for project:", projectId, "to email:", email);

        // Call the function to send client access
        const result = await sendClientAccess(email, projectId);
        if (!result) {
            errorResponse(res, 500, "Failed to create client access");
            return;
        }

        successResponse(res, {
            token: result.token,
            url: result.url,
        }); // for dev, will update to email

    } catch (error) {
        console.error(error);
        errorResponse(res, 500, "Failed to create client access");
    }
});

clientAuthRouter.post("/validate-code", async (req, res) => {
    try {
        const { code, projectId } = req.body;

        if (!code || !projectId) {
            errorResponse(res, 400, "Code and projectId are required");
            return;
        }

        // Find the client access record by token and projectId
        console.log("Validating client code for project:", projectId, "with code:", code);

        const validatedClientToken = await validateClientCode(code, projectId);

        if (!validatedClientToken) {
            errorResponse(res, 401, "Invalid or expired code");
            return;
        }

        successResponse(res, { clientToken: validatedClientToken });

    } catch (error) {
        errorResponse(res, 500, "Internal server error");
    }
});



export default clientAuthRouter;