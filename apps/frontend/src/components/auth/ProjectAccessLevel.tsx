import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useParams } from "react-router";
import api from "../../lib/axios";
import ProjectAccessPrompt from "./ProjectAccessPrompt";
import ProjectAccessDenied from "./ProjectAccessDenied";
import PageLayout from "../PageLayout";
import { useProjectContext } from "../../context/ProjectProvider";
import useClientAuth from "../../hooks/useClientAuth";

export type ProjectAccessGateState =
	| "loading"
	| "authorized"
	| "prompt"
	| "denied";

const ProjectAccessGate = ({ children }: { children: ReactNode; }) => {
	const { id: projectId } = useParams();
	const { search } = useLocation();

	const { accessLevel, isLoading, isOwner, authorizedClient, isUnauthorized } = useProjectContext();
	const { loading: clientAuthLoading } = useClientAuth();

	useEffect(() => {
		// first check if the visitor has a token in the search params
		// This will mean that the user is trying to access the project as a client
		// They are automatically authorized to access the project if the token is valid

		console.log("ACCESS LEVEL", accessLevel);
		const hasValidClientAccessToken = async (token: string | null) => {
			try {
				const { data: { data } } = await api.post(`/projects/${projectId}/check-access`, { accessToken: token });

				if (data.authorized) {
					return data.email;
				}

				return null;
			} catch (error) {
				return null;
			}
		};

		const getClientAccessToken = (): string | null => {
			const accessToken = localStorage.getItem("projectToken") || new URLSearchParams(search).get("token") || null;
			return accessToken;
		};

		// first check if the user is trying to access the project via a client access token
		const accessToken = getClientAccessToken();
		if (accessToken) {
			hasValidClientAccessToken(accessToken).then(email => {
				if (email) {
					localStorage.setItem("projectToken", accessToken);
					localStorage.setItem("projectAccessType", "client");
					localStorage.setItem("clientEmail", email);
				}
			});
			return;
		}
	}, [projectId, search, accessLevel]);

	if (isLoading)
		return (
			<PageLayout>
				<div>Checking access...</div>
			</PageLayout>
		);

	if (isOwner || (!authorizedClient?.isBlocked)) return <>{children}</>;

	if (isUnauthorized) {
		return <ProjectAccessDenied />;
	}

	return (
		<PageLayout>
			<ProjectAccessPrompt projectId={projectId!} />
		</PageLayout>
	);
};

export default ProjectAccessGate;
