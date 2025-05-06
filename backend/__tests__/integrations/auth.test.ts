import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";
import request from "supertest";
import createServer from "../../src/utils/server";
import { prisma } from "../../src/lib/prisma";
import { createResetPasswordToken } from "../../src/utils";

const app = createServer();

// ====== Register A User ======
describe("POST /auth/register: Registering a User", () => {
	beforeEach(async () => {
		try {
			await prisma.user.delete({
				where: {
					email: "testuser@example.com",
				},
			});
		} catch (error) {
			return;
		}
	});
	test("should return 422 if info missing", async () => {
		const res = await request(app).post("/auth/register").send({});
		expect(res.status).toBe(422);
		expect(res.body).toEqual({ error: "email, name, and password required" });
	});

	test("should return 409 if user exists", async () => {
		await prisma.user.create({
			data: {
				email: "testuser@example.com",
				firstName: "Izzy",
				lastName: "Vickers",
				hashedPassword: "alreadyHashedPassword",
			},
		});

		const res = await request(app).post("/auth/register").send({
			email: "testuser@example.com",
			name: "Izzy Vickers",
			password: "securepassword",
		});

		expect(res.status).toBe(409);
		expect(res.body).toEqual({ error: "Email already exists" });
	});

	describe("Full integration", () => {
		test("should create an add a new user to db", async () => {
			const res = await request(app).post("/auth/register").send({
				name: "izzy vickers",
				email: "testuser@example.com",
				password: "securepassword",
			});

			expect(res.status).toBe(201);
			expect(res.body.error).toBe(null);
			expect(res.body.data).toMatchObject({
				email: "testuser@example.com",
				firstName: "Izzy",
				lastName: "Vickers",
			});

			// Check user in database
			const testUser = await prisma.user.findUnique({
				where: {
					email: "testuser@example.com",
				},
			});

			expect(testUser).toBeDefined();
		});
	});
});

// ====== Forgot User Password ======
describe("POST /auth/forgot-password: I Forgot My Password", () => {
	afterEach(async () => {
		try {
			await prisma.user.delete({
				where: {
					email: "testuser@example.com",
				},
			});
		} catch (error) {
			return;
		}
	});
	test("should return 404 if user not found", async () => {
		const res = await request(app)
			.post("/auth/forgot-password")
			.send({ email: "bademail@test.com" });

		expect(res.status).toBe(404);
		expect(res.body.error).toMatch(/does not exist/i);
	});

	test("should generate and save tokens for valid user", async () => {
		const user = await prisma.user.create({
			data: {
				email: "testuser@example.com",
				hashedPassword: "existing_hashed_pw",
			},
		});

		const res = await request(app)
			.post("/auth/forgot-password")
			.send({ email: "testuser@example.com" });

		expect(res.status).toBe(200);

		const updatedUser = await prisma.user.findUnique({
			where: { id: user.id },
		});

		expect(updatedUser?.resetPasswordToken).not.toBe(null);
		expect(updatedUser?.resetTokenExpiresAt).not.toBe(null);
	});
});

// ====== Reset User Password ======
describe("PATCH /auth/reset-password: I Need a PW Reset", () => {
	afterAll(async () => {
		try {
			await prisma.user.delete({
				where: {
					email: "testuser@example.com",
				},
			});
		} catch (error) {
			return;
		}
	});
	test("should return 400 if token is missing", async () => {
		const res = await request(app)
			.patch("/auth/reset-password") // no token in req.query
			.send({ password: "newpassword123" });

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/required token/i);
	});

	test("should return 404 if token is invalid or expired", async () => {
		const fakeToken = "thistokendoesnotwork";

		const res = await request(app)
			.patch(`/auth/reset-password?token=${fakeToken}`)
			.send({ password: "newpassword123" });

		expect(res.status).toBe(404);
		expect(res.body.error).toMatch(/invalid or expired/i);
	});

	test("should hash and update the user information if valid token", async () => {
		const { expiresAt, hashedToken, token } = createResetPasswordToken();

		const user = await prisma.user.create({
			data: {
				email: "testuser@example.com",
				hashedPassword: "old_hashed_pw",
				resetPasswordToken: hashedToken,
				resetTokenExpiresAt: expiresAt,
			},
		});

		const res = await request(app)
			.patch(`/auth/reset-password?token=${token}`)
			.send({ password: "new_secure_pw" });

		expect(res.status).toBe(200);

		const updated = await prisma.user.findUnique({
			where: { id: user.id },
			omit: {
				hashedPassword: false,
			},
		});

		expect(updated?.resetPasswordToken).toBeNull();
		expect(updated?.resetTokenExpiresAt).toBeNull();
		expect(updated?.passwordLastChangedAt).toBeTruthy();
		expect(updated?.hashedPassword).not.toBe("old_hashed_pw");
	});
});
