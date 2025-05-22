import { z } from "zod";

export const LoginSchema = z.object({
	email: z
		.string({ message: "Email is required" })
		.email({ message: "Not a valid email" }),
	password: z.string().min(8, { message: "Password must be 8 characters" }),
});

export const SignupSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8, { message: "Password must be 8 characters" }),
	name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

export type Login = z.infer<typeof LoginSchema>;
export type Signup = z.infer<typeof SignupSchema>;
