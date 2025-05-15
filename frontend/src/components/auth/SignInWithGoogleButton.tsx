import { useAuth } from "../../hooks/useAuth";
import { FcGoogle } from "react-icons/fc";

const SignInWithGoogleButton = () => {
	const { loginWithGoogle } = useAuth();
	return (
		<button
			type="button"
			className="w-full flex items-center justify-center gap-3 py-2 px-3 border rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
			onClick={loginWithGoogle}
		>
			<FcGoogle className="text-xl" />
			<span className="font-medium">Continue with Google</span>
		</button>
	);
};
export default SignInWithGoogleButton;
