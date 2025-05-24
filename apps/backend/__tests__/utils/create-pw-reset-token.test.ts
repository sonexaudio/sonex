import { describe, expect, test } from "vitest";
import { createResetPasswordToken } from "../../src/utils";

describe("Generate Password Reset Token", () => {
	test("should return raw 64-char token & hashed token", () => {
		const { token, hashedToken } = createResetPasswordToken();
		expect(typeof token).toBe("string");
		expect(typeof hashedToken).toBe("string");
		expect(token.length).toBe(64);
		expect(hashedToken.length).toBe(64);
	});
	test("should set expiration ~15min from now", () => {
		const before = Date.now() + 14 * 60 * 1000;
		const after = Date.now() + 16 * 60 * 1000;

		const { expiresAt } = createResetPasswordToken();
		expect(expiresAt.getTime()).toBeGreaterThan(before);
		expect(expiresAt.getTime()).toBeLessThan(after);
	});
});
