import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Seeding database...");

	// Create a user
	console.log("Creating a user...");
	const user = await prisma.user.create({
		data: {
			firstName: "Demo",
			lastName: "User",
			email: "iamauser@sonex.app",
			hashedPassword: bcrypt.hashSync("123456789"),
		},
	});

	// Project
	console.log("Creating a project...");
	const project = await prisma.project.create({
		data: {
			title: "Hello Project",
			description: "This is a sample project",
			userId: user.id,
			status: "Active",
			amount: 2400,
			paymentStatus: "Unpaid",
		},
	});

	console.log("Creating a client, or two...");
	const clients = await prisma.client.createManyAndReturn({
		data: [
			{
				email: "myfirstclient@sonexdemo.com",
				name: "Client Demo",
				userId: user.id,
				projectId: project.id,
			},
			{
				email: "mybesclient@sonexdemo.com",
				name: "Precious Clientele",
				userId: user.id,
				projectId: project.id,
			},
		],
	});

	console.log("Adding file...");
	const file = await prisma.file.create({
		data: {
			name: "demo_audio.wav",
			size: 10485760,
			mimeType: "audio/wav",
			path: `/${user.id}/${project.id}/demo_audio.wav`,
			projectId: project.id,
			uploaderId: user.id,
			uploaderType: "USER",
		},
	});


	console.log("Updating user info being that file is uploaded");
	await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			storageUsed: user.storageUsed + (file.size / 1024 / 1024),
		}
	});

	console.log("Creating comments for created file...");
	await prisma.comment.createManyAndReturn({
		data: [
			{
				clientId: clients[0].id,
				content: "Can we take out the drums here?",
				fileId: file.id,
				timestamp: 63,
			},
			{
				clientId: clients[1].id,
				content: "Loving this!",
				fileId: file.id,
			},
			{
				clientId: clients[0].id,
				content: "Add reverb here",
				fileId: file.id,
				timestamp: 42,
			}
		]
	});

	console.log("Recording activities...");
	await prisma.activity.createMany({
		data: [
			{
				userId: user.id,
				action: "Created account",
				targetType: "user",
			},
			{
				userId: user.id,
				action: "Created project",
				targetType: "project",
				targetId: project.id,
				metadata: {
					projectTitle: project.title,
				},
			},
			{
				userId: user.id,
				action: "Added client",
				targetType: "client",
				metadata: {
					email: clients[0].name,
					projectTitle: project.title,
				},
				targetId: clients[0].id,
			},
			{
				userId: user.id,
				action: "Added client",
				targetType: "client",
				metadata: {
					email: clients[1].name,
					projectTitle: project.title,
				},
				targetId: clients[1].id,
			},
			{
				userId: user.id,
				action: "Uploaded file",
				targetType: "file",
				metadata: {
					filename: "demo_audio.wav",
					projectTitle: project.title,
				},
				targetId: project.id,
			},
		],
	});

	console.log("✅ Done seeding.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
