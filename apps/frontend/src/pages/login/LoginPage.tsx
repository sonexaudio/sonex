import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";
import MagicLinkLoginForm from "../../components/forms/MagicLinkLoginForm";


const LoginPage = () => {
	return (

		<div className="flex flex-col items-center space-y-8 px-8 py-16">
			<LoginHeader />
			<MagicLinkLoginForm />
			<LoginForm />
		</div>
	);
};
export default LoginPage;
