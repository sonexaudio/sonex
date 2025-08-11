import SignupForm from "./SignupForm";
import SignupHeader from "./SignupHeader";

const SignupPage = () => {
	return (
		<div className="flex flex-col items-center space-y-8 px-8 py-16">
			<SignupHeader />
			<SignupForm />
		</div>

	);
};
export default SignupPage;
