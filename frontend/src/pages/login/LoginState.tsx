import { cn } from "../../utils/cn";

type LoginStateProps = {
	type: "error" | "success";
	message: string;
	className?: string;
};

const LoginState = ({ type, message, className }: LoginStateProps) => {
	const baseStyle = "text-center text-sm py-2 px-3 rounded";
	const typeStyle =
		type === "error"
			? "bg-red-100 text-red-700 border border-red-300"
			: "bg-green-100 text-green-700 border border-green-300";
	return <div className={cn(baseStyle, typeStyle, className)}>{message}</div>;
};
export default LoginState;
