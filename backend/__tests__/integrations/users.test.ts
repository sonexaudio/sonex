import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prisma } from "../../src/lib/prisma";
import request, { type Agent } from "supertest";
import createServer from "../../src/utils/server";
import type { User } from "../../src/generated/prisma";

const app = createServer();

describe("Managing Users", () => {
	let agent: Agent; // to persist sessions and cookies
	let testUser: Partial<User> | null;

	describe("Update User Information", () => {
		beforeEach(async () => {
			agent = request.agent(app);
			await agent.post("/auth/register").send({
				name: "Test User",
				email: "gooduser@example.com",
				password: "testing",
			});

			await agent
				.post("/auth/login")
				.send({ email: "gooduser@example.com", password: "testing" });

			// Fetch currently logged in user from DB
			testUser = await prisma.user.findUnique({
				where: { email: "gooduser@example.com" },
			});
		});

		afterEach(async () => {
			await agent.get("/auth/logout");
			try {
				await prisma.user.deleteMany({
					where: {
						email: "gooduser@example.com",
					},
				});
				await prisma.user.deleteMany({
					where: {
						email: "baduser@example.com",
					},
				});
			} catch (error) {
				return;
			}
		});
		test("should only allow authenticated users to access route", async () => {
			const res = await request(app)
				.put(`/users/${testUser?.id}`)
				.send({ name: "This will not work" });

			expect(res.status).toBe(401);
			expect(res.body.error).toMatch(/unauthorized/i);
		});

		test("returns 404 if user not found", async () => {
			const res = await agent
				.put("/users/thisuser-doesnt-exist")
				.send({ name: "User Not Found Update" });

			expect(res.status).toBe(404);
			expect(res.body.error).toMatch(/not exist/i);
		});

		test("returns 403 if authenticated user is not authorized user of account", async () => {
			// Create a second user
			const hacker = await prisma.user.create({
				data: {
					firstName: "Anonymous",
					lastName: "Hacker",
					email: "baduser@example.com",
					hashedPassword: "hackedpass",
				},
			});

			const res = await agent
				.put(`/users/${hacker.id}`)
				.send({ name: "Literally Hacking You Right-Now" });

			expect(res.status).toBe(403);
		});
		test("should idempotently return user with updated info", async () => {
			const res = await agent.put(`/users/${testUser?.id}`).send({
				name: "Updated Test User",
			});

			expect(res.status).toBe(200);
			expect(res.body.data.user.firstName).toBe("Updated");

			// Repeat update with same data (idempotent)
			const secondRes = await agent.put(`/users/${testUser?.id}`).send({
				name: "Updated Test User",
			});

			expect(secondRes.status).toBe(200);
			expect(secondRes.body.data.user.firstName).toBe("Updated");
		});
	});

	describe("Delete User Information", () => {
		beforeEach(async () => {
			agent = request.agent(app);
			await agent.post("/auth/register").send({
				name: "Test User",
				email: "gooduser@example.com",
				password: "testing",
			});

			await agent
				.post("/auth/login")
				.send({ email: "gooduser@example.com", password: "testing" });

			// Fetch currently logged in user from DB
			testUser = await prisma.user.findUnique({
				where: { email: "gooduser@example.com" },
			});
		});

		afterEach(async () => {
			await agent.get("/auth/logout");
			try {
				await prisma.user.deleteMany({
					where: {
						email: "gooduser@example.com",
					},
				});
				await prisma.user.deleteMany({
					where: {
						email: "baduser@example.com",
					},
				});
			} catch (error) {
				return;
			}
		});

		test("should only allow authenticated users to access route", async () => {
			const res = await request(app).delete(`/users/${testUser?.id}`);

			expect(res.status).toBe(401);
			expect(res.body.error).toMatch(/unauthorized/i);
		});

		test("returns 404 if user not found", async () => {
			const res = await agent.delete("/users/thisuser-doesnt-exist");

			expect(res.status).toBe(404);
			expect(res.body.error).toMatch(/not exist/i);
		});

		test("returns 403 if authenticated user is not authorized user of account", async () => {
			// Create a second user
			const hacker = await prisma.user.create({
				data: {
					firstName: "Anonymous",
					lastName: "Hacker",
					email: "baduser@example.com",
					hashedPassword: "hackedpass",
				},
			});

			const res = await agent.delete(`/users/${hacker.id}`);

			expect(res.status).toBe(403);
		});
		test("should successfully delete user if authenticated and matches", async () => {
			const res = await agent.delete(`/users/${testUser?.id}`);

			expect(res.status).toBe(204);

			const nonExistentUser = await prisma.user.findUnique({
				where: { id: testUser?.id },
			});

			expect(nonExistentUser).toBeNull();

			// need to also expect session has been deleted/changed as user logged out
			const resAfterDeletion = await agent.get("/auth/me");
			expect(resAfterDeletion.status).toBe(401);
			expect(resAfterDeletion.body.data).toBeNull();
		});
	});
});
