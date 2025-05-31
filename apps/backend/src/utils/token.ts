import { randomBytes, createHash } from "crypto";
import { prisma } from "../lib/prisma";
export function generateClientAccessToken() {
	return randomBytes(32).toString("hex");
}

export function generateTokenHash(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}

// Function to help me determine if a client has accepted or awaiting invitation to project
export async function getClientAccessStatus(email: string, projectId: string) {
	const access = await prisma.clientAccess.findFirst({
		where: {
			email,
			projectId,
		},
		orderBy: { createdAt: "desc" },
	});

	if (!access) return "not_invited";
	if (access.acceptedAt) return "accepted";
	if (access.expires < new Date()) return "expired";

	// Sent within 3 days, client just hasn't approved
	return "pending";
}
