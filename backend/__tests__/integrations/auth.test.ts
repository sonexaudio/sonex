import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import createServer from "../../src/utils/server";
import { prisma } from "../../src/lib/prisma";

const app = createServer();

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
