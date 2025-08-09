import { useEffect, type ReactNode } from "react";
import { useLocation, useParams } from "react-router";
import api from "../../lib/axios";
import ProjectAccessPrompt from "./ProjectAccessPrompt";
import ProjectAccessDenied from "./ProjectAccessDenied";
import PageLayout from "../PageLayout";
import { useProjectContext } from "../../hooks/projects/useProjectContext";
import useUser from "../../hooks/useUser";
import useClientAuth from "../../hooks/useClientAuth";


export type ProjectAccessGateState =
	| "loading"
	| "authorized"
	| "prompt"
	| "denied";

const ProjectAccessGate = ({ children }: { children: ReactNode; }) => {
	const { id: projectId } = useParams();
	const { loading: userLoading } = useUser();
	const { loading: clientLoading } = useClientAuth();
	const { search } = useLocation();
	const code = new URLSearchParams(search).get("code");

	const { isUnauthorized, isUnknown, isLoading, isOwner, isClient, client: currentClient, changeAccessLevel } = useProjectContext();

	const canAccess = isOwner || isClient;
	console.log("CAN ACCESS?", canAccess);
	const loading = userLoading || clientLoading || isLoading;

	useEffect(() => {
		if (loading) return; // Wait for all auth/project loading to finish
		// if (!code && !canAccess) {
		// 	changeAccessLevel("UNAUTHORIZED");
		// }
	}, [loading, code, canAccess, changeAccessLevel]);

	console.log("IS UNAUTHORIZED?", isUnauthorized);
	console.log("IS UNKNOWN?", isUnknown);
	console.log("IS LOADING?", isLoading);
	console.log("IS OWNER?", isOwner);
	console.log("IS CLIENT?", isClient);
	console.log("CURRENT CLIENT?", currentClient);

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

	return null; 

};

export default ProjectAccessGate;
