import crypto from "node:crypto";
import type { User } from "../generated/prisma";
import { stripe } from "../lib/stripe";
import { prisma } from "../lib/prisma";

export type UserDisplayName = {
	firstName: string;
	lastName: string;
};

export function parseUserName(name: string): UserDisplayName | undefined {
	if (!name) return;

	const nameArr = name.split(" ");

	let firstName: string;
	// biome-ignore lint/style/useConst: suppressing this rule
	let lastName: string;

	if (nameArr.length === 1) {
		firstName = _capitalizeName(name);
		return { firstName, lastName: "" };
	}

	firstName = _capitalizeName(nameArr[0]);

	lastName = nameArr
		.slice(1)
		.map((n) => _capitalizeName(n))
		.join(" ");

	return { firstName, lastName };
}

// password reset functions
export function createResetPasswordToken(): {
	token: string;
	hashedToken: string;
	expiresAt: Date;
} {
	const token = crypto.randomBytes(32).toString("hex");
	const hashedToken = encryptResetPasswordToken(token);
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

	return { token, hashedToken, expiresAt };
}

export function encryptResetPasswordToken(token: string): string {
	return crypto.createHash("sha256").update(token).digest("hex");
}

export async function getOrCreateStripeCustomer(user: User): Promise<string> {
	if (user.stripeCustomerId) return user.stripeCustomerId;

	let name: string | undefined;

	if (user.firstName && user.lastName) {
		name = `${user.firstName} ${user.lastName}`;
	}

	const customer = await stripe.customers.create({
		email: user.email,
		name,
		metadata: {
			userId: user.id,
		},
	});

	await prisma.user.update({
		where: { id: user.id },
		data: { stripeCustomerId: customer.id },
	});

	return customer.id;
}

// helper functions
function _capitalizeName(name: string) {
	const hyphenated = name.split("-").length > 1;

	if (hyphenated) {
		const parsedHyphenatedName = name
			.split("-")
			.map((n) => n[0].toUpperCase() + n.slice(1).toLowerCase())
			.join("-");

		return parsedHyphenatedName;
	}

	return name[0].toUpperCase() + name.slice(1).toLowerCase();
}
