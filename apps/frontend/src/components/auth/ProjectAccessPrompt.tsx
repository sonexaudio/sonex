import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../../lib/axios";

const ProjectAccessPrompt = ({ projectId }: { projectId: string; }) => {
	const [email, setEmail] = useState("");
	const navigate = useNavigate();

	const handleLoginRedirect = () => {
		navigate("/login", {
			state: {
				message: "Login to be redirected back to your project",
				from: `/projects/${projectId}`,
			},
		});
	};

	const handleRequestAccess = async () => {
		try {
			const {
				data: { data },
			} = await api.post(`/projects/${projectId}/request-access`, { email });

			// TODO. Temporary. Remove when email responses arrive
			localStorage.setItem("projectToken", data.token);
			localStorage.setItem("clientEmail", email);
			alert("Access request sent to the project creator!");

			window.location.href = data.url;
		} catch (error) {
			alert("Request failed!");
			console.error(error);
		}
	};

	return (
		<div>
			<h1>Hello! This project is only for authorized clients</h1>
			<div className="grid grid-cols-2 gap-8">
				<div className="border p-4 rounded-lg">
					<h3>Is this your project?</h3>
					<p>Login, and we'll bring you right back here</p>
					<button type="button" onClick={handleLoginRedirect}>
						I am the project creator
					</button>
				</div>
				<div className="border p-4 rounded-lg">
					<h3>Want to get in?</h3>
					<p>
						If you have not received an email from us, provide your email, and
						we'll notify the creator
					</p>
					<div>
						<input
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
						/>
						<button type="submit" onClick={handleRequestAccess}>
							Request Access
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProjectAccessPrompt;
