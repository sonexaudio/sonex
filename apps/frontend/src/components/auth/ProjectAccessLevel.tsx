import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useParams } from "react-router";
import api from "../../lib/axios";
import ProjectAccessPrompt from "./ProjectAccessPrompt";
import ProjectAccessDenied from "./ProjectAccessDenied";
import PageLayout from "../PageLayout";

export type ProjectAccessGateState =
	| "loading"
	| "authorized"
	| "prompt"
	| "denied";

const ProjectAccessGate = ({ children }: { children: ReactNode; }) => {
	const { id: projectId } = useParams();
	const { search } = useLocation();

	const [access, setAccess] = useState<ProjectAccessGateState>("loading");

	useEffect(() => {
		const accessToken =
			localStorage.getItem("projectToken") ||
			new URLSearchParams(search).get("token") ||
			null;

		const checkAccess = async (token: string | null) => {
			try {
				const {
					data: { data },
				} = await api.post(`/projects/${projectId}/check-access`, {
					accessToken,
				});

				if (data.authorized) {
					setAccess("authorized");
					if (token && data.accessType === "client") {
						localStorage.setItem("projectToken", token); // ✅ saves token for future requests
						localStorage.setItem("projectAccessType", "client");
						localStorage.setItem("projectEmail", data.email);
					}
				} else {
					setAccess("prompt");
				}
			} catch (error) {
				setAccess("denied");
			}
		};

		checkAccess(accessToken);
	}, [projectId, search]);

	if (access === "loading")
		return (
			<PageLayout>
				<div>Checking access...</div>
			</PageLayout>
		);
	if (access === "authorized") return <>{children}</>;
	if (access === "prompt")
		return (
			<PageLayout>
				<ProjectAccessPrompt projectId={projectId!} />
			</PageLayout>
		);

	return <ProjectAccessDenied />;
};

export default ProjectAccessGate;
