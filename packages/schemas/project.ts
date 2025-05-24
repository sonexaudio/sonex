import { z } from "zod";

export const ProjectSchema = z.object({
	title: z.string().min(1, { message: "Project title is required" }),
	description: z.preprocess(
		(val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
		z
			.string()
			.min(5, { message: "Description must be a minimum of 5 characters" })
			.optional(),
	),
	amount: z
		.number()
		.gte(0, { message: "Amount must be a positive" })
		.optional(),
	status: z
		.enum(["Active", "Complete", "Archived", "Private"])
		.default("Active")
		.optional(),
	paymentStatus: z
		.enum(["Free", "Unpaid", "Paid"])
		.default("Unpaid")
		.optional(),
});

export type ProjectInputValues = z.infer<typeof ProjectSchema>;
