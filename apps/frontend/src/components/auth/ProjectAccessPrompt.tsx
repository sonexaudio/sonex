import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../../lib/axios";

const ProjectAccessPrompt = ({ projectId, code }: { projectId: string; code?: string; }) => {
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
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
			} = await api.post("/auth/client/validate", { code, email, projectId, name });

			if (data) {
				// Tokens have been set in cookies. Reload?
				console.log("Access granted, reloading page...", data);
				// window.location.reload();
			}

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
					<h3>Enter your name and email only</h3>
					<p>
						So that we know who you are, and can grant you access to the project
						<br />
					</p>
					<div>
						<input
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
						/>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your name"
						/>
						<button type="submit" onClick={handleRequestAccess}>
							View Project
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProjectAccessPrompt;
