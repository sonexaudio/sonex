import { useEffect, type ReactNode } from "react";
import { useLocation, useParams } from "react-router";
import api from "../../lib/axios";
import ProjectAccessPrompt from "./ProjectAccessPrompt";
import ProjectAccessDenied from "./ProjectAccessDenied";
import PageLayout from "../PageLayout";
import { useProjectContext } from "../../hooks/projects/useProjectContext";


export type ProjectAccessGateState =
	| "loading"
	| "authorized"
	| "prompt"
	| "denied";

const ProjectAccessGate = ({ children }: { children: ReactNode; }) => {
	const { id: projectId } = useParams();
	const { search } = useLocation();
	const code = new URLSearchParams(search).get("code");

	const { isUnauthorized, isUnknown, clientLoading, userLoading, projectData: { isLoading }, isOwner, isClient, currentClient, changeAccessLevel } = useProjectContext();

	const canAccess = isOwner || isClient;
	const loading = userLoading || clientLoading || isLoading;

	useEffect(() => {
		// const clientView = new URLSearchParams(search).get("clientView");
		// const userViewingAsClient = isOwner && clientView && clientView === "true";

		// No need to do anything if there is already a user or authorized client
		// First check if the user is viewing as a client
		// if (userViewingAsClient || canAccess) return;
		if (isLoading) return;



		if (!code && !canAccess) {
			changeAccessLevel("UNAUTHORIZED");
			return;
		}

		// Validate code and get a JWT token
		// api.post("/auth/client/validate-code", { code, projectId })
		// 	.then(({ data: { data } }) => {

		// 		if (data) {
		// 			localStorage.setItem("accessToken", data.clientToken);
		// 			localStorage.setItem("clientEmail", data.email);
		// 			// setTimeout(() => window.location.replace(`/projects/${projectId}`), 3500);
		// 		}

		// 	})
		// 	.catch((e) => {
		// 		console.log("COULD NOT VALIDATE", e);
		// 		localStorage.removeItem("accessToken");
		// 		localStorage.removeItem("clientEmail");
		// 	});
	}, [search, projectId, loading, isOwner, isClient, changeAccessLevel, code]);



	if (loading) {
		return (
			<PageLayout>
				<div>Checking access...</div>
			</PageLayout>
		);
	}


	if (!loading && isUnknown) {
		return (
			<PageLayout>
				<ProjectAccessPrompt projectId={projectId!} code={code!} />
			</PageLayout>
		);
	}

	if (isOwner || (currentClient && !currentClient?.isBlocked)) {
		return <>{children}</>;
	}

	if (isUnauthorized) {
		return (
			<PageLayout>
				<ProjectAccessDenied />
			</PageLayout>
		);

	}



};

export default ProjectAccessGate;
