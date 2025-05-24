import { describe, expect, it } from "vitest";
import { encryptResetPasswordToken } from "../../src/utils";

describe("encryptResetPasswordToken", () => {
	it("should return a SHA256 hash of the token", () => {
		const token = "my-secret-token";
		const hashed = encryptResetPasswordToken(token);

		expect(typeof hashed).toBe("string");
		expect(hashed.length).toBe(64); // SHA256 hex string
	});

	it("should produce consistent hashes for same input", () => {
		const token = "reusable-token";
		const hash1 = encryptResetPasswordToken(token);
		const hash2 = encryptResetPasswordToken(token);

		expect(hash1).toBe(hash2);
	});

	it("should produce different hashes for different tokens", () => {
		const hash1 = encryptResetPasswordToken("token-1");
		const hash2 = encryptResetPasswordToken("token-2");

		expect(hash1).not.toBe(hash2);
	});
});
