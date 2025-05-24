import { zodResolver } from "@hookform/resolvers/zod";
import {
	createContext,
	useContext,
	useState,
	type InputHTMLAttributes,
	type PropsWithChildren,
} from "react";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import type { z, ZodType } from "zod";

interface AuthFormProps<T extends ZodType<any>> extends PropsWithChildren {
	schema: T;
	onSubmit: (data: z.infer<T>) => Promise<void>;
}

interface AuthFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
	name: string;
	label?: string;
}

type AuthFormContextProps = {
	methods: UseFormReturn;
	showPassword: boolean;
	togglePassword: () => void;
};

const AuthFormContext = createContext<AuthFormContextProps | undefined>(
	undefined,
);

const useAuthForm = () => {
	const ctx = useContext(AuthFormContext);
	if (!ctx)
		throw new Error(
			"Authentication Form Elements must be used within Authentication Form",
		);
	return ctx;
};

const AuthenticationForm = <T extends ZodType<any>>({
	schema,
	onSubmit,
	children,
}: AuthFormProps<T>) => {
	const [showPassword, setShowPassword] = useState(false);
	const methods = useForm({
		resolver: zodResolver(schema),
	});

	const togglePassword = () => setShowPassword((prev) => !prev);

	return (
		<AuthFormContext.Provider value={{ methods, showPassword, togglePassword }}>
			<FormProvider {...methods}>
				<form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
					{children}
				</form>
			</FormProvider>
		</AuthFormContext.Provider>
	);
};

// Input to cover email, password, and name
AuthenticationForm.Input = function Input(props: AuthFormInputProps) {
	const { name, placeholder, type = "text", label, ...rest } = props;
	const {
		methods: {
			register,
			formState: { errors },
		},
		showPassword,
	} = useAuthForm();

	if (!name) throw new Error("<AuthenticationForm.Input/> must have a name.");

	const error = errors[name]?.message as string | undefined;

	const inputType = type === "password" && showPassword ? "text" : type;

	return (
		<div className="space-y-1">
			{label && <label htmlFor={name}>{label}</label>}
			<input
				{...register(name)}
				type={inputType}
				placeholder={placeholder}
				autoComplete={type === "email" ? "email" : ""}
				{...rest}
				className="w-full border rounded-md py-2 px-4"
			/>
			{error && <p className="text-red-500 text-sm">{error}</p>}
		</div>
	);
};

// Separate and password password check to be able to toggle show password check
AuthenticationForm.ShowPasswordToggle = function ShowPassword() {
	const { togglePassword, showPassword } = useAuthForm();
	return (
		<label
			htmlFor="showPassword"
			className="flex items-center gap-2 cursor-pointer"
		>
			<input
				type="checkbox"
				name="showPassword"
				checked={showPassword}
				onChange={togglePassword}
			/>
			<span className="text-sm">Show password</span>
		</label>
	);
};

// Submit button
AuthenticationForm.SubmitButton = function SubmitButton({
	children,
}: PropsWithChildren) {
	const { methods } = useAuthForm();
	const { isSubmitting } = methods.formState;
	return (
		<button
			disabled={isSubmitting}
			type="submit"
			className="px-4 py-1 w-full bg-black text-neutral-50 disabled:bg-black/50"
		>
			{isSubmitting ? "Submitting..." : children}
		</button>
	);
};

export default AuthenticationForm;
