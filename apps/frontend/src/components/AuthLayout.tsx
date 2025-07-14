import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import useProjects from "../hooks/useProjects";
import OnboardingDialog from "./onboarding/OnboardingDialog";
import api from "../lib/axios";

const publicRoutes = [
	"/",
	"/login",
	"/signup",
	"/forgot-password",
	"/reset-password",
];

const AuthLayout = ({ children }: PropsWithChildren) => {
	const { user, loading, refetchUser } = useAuth();
	const location = useLocation();
	const { state: { allProjects }, loading: projectsLoading, getAllProjects } = useProjects();
	const [clients, setClients] = useState<any[]>([]);
	const [clientsLoading, setClientsLoading] = useState(false);
	const [showOnboarding, setShowOnboarding] = useState(false);

	const isPublicAuthRoute = publicRoutes.includes(location.pathname);

	useEffect(() => {
		const fetchClients = async () => {
			setClientsLoading(true);
			try {
				const { data: { data } } = await api.get("/clients/all");
				setClients(data.clients || []);
			} catch (e) {
				setClients([]);
			} finally {
				setClientsLoading(false);
			}
		};
		if (user && !clientsLoading) fetchClients();
	}, [user]);

	useEffect(() => {
		if (user && allProjects.length === 0) getAllProjects();
	}, [user, allProjects.length, getAllProjects]);

	useEffect(() => {
		const prompt = localStorage.getItem("promptForOnboarding");
		setShowOnboarding(!user?.isOnboarded || !!prompt);
	}, [user]);

	// remove promptForOnboarding from local storage if user is onboarded
	useEffect(() => {
		if (user?.isOnboarded) {
			localStorage.removeItem("promptForOnboarding");
		}
	}, [user]);

	const handleOnboardingComplete = async () => {
		if (!user?.isOnboarded) {
			await api.put("/users/onboarded", { isOnboarded: true });
			await refetchUser();
		}
		localStorage.removeItem("promptForOnboarding");
		setShowOnboarding(false);
	};

	if (loading) return <p>Loading...</p>; // TODO: create nice loader

	if (!loading && !user && !isPublicAuthRoute) {
		return (
			<Navigate
				to="/login"
				replace
				state={{
					message: "You must be logged in to view this page",
					from: location.pathname,
				}}
			/>
		);
	}

	if (isPublicAuthRoute && user && location.pathname !== "/") {
		return <Navigate to="/" replace />;
	}

	return <>
		{user && showOnboarding && (
			<OnboardingDialog
				open={showOnboarding}
				user={user}
				projects={allProjects}
				clients={clients}
				onComplete={handleOnboardingComplete}
			/>
		)}
		{children}
	</>;
};
export default AuthLayout;
