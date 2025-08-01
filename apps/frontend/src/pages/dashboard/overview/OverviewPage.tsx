import { useEffect } from "react";
import { useComments } from "../../../hooks/useComments";
// import { useProjectData } from "../../../hooks/useProjectData";
import useUser from "../../../hooks/useUser";
import { useTransactions } from "../../../hooks/useTransactions";
import useProjects from "../../../hooks/useProjects";
import PageLayout from "../../../components/PageLayout";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Plus, Upload, Users, Folder, FileText, MessageCircle } from "lucide-react";
import type { Project } from "../../../types/projects";
import AuthLayout from "../../../components/AuthLayout";
import { useProjectData } from "../../../hooks/projects/useProjectData";
import { useClients } from "../../../hooks/useClients";
import useFiles from "../../../hooks/useFiles";

const OverviewPage = () => {
	const { currentUser } = useUser();
	const { projects, loading: projectsLoading } = useProjects();
	const { clients, loading: clientsLoading } = useClients();
	const { files, loading: filesLoading } = useFiles();
	const { comments, loading: commentsLoading } = useComments();
	const { transactions, loading: paymentsLoading } = useTransactions();

	const quickActions = [
		{ icon: <Plus />, label: "New Project", onClick: () => {/* route to new project */ } },
		{ icon: <Upload />, label: "Upload File", onClick: () => {/* open upload dialog */ } },
		{ icon: <Users />, label: "Invite Client", onClick: () => {/* open invite dialog */ } },
	];

	const stats = [
		{ icon: <Folder />, label: "Projects", value: projects.length },
		{ icon: <Users />, label: "Clients", value: clients.length },
		{ icon: <FileText />, label: "Files", value: files.length },
		{ icon: <MessageCircle />, label: "Comments", value: comments.length },
	];

	const ChartPlaceholder = ({ title }: { title: string; }) => (
		<Card className="h-40 flex flex-col justify-between">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-20 bg-muted rounded flex items-center justify-center text-muted-foreground">
					Chart
				</div>
			</CardContent>
		</Card>
	);

	return (
		<AuthLayout>
			<PageLayout>
				<div
					className="grid gap-6"
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(6, 1fr)',
						gridTemplateRows: 'repeat(3, minmax(120px, auto))',
						gridTemplateAreas: `
						  'main main main activity activity activity'
						  'projects revenue comments comments unique unique'
						  'flexible flexible payments payments status status'
						`,
					}}
				>
					{/* Main Board/Quick Actions/Stats */}
					<Card className="col-span-3 row-span-1" style={{ gridArea: 'main' }}>
						<CardHeader>
							<CardTitle>Welcome{currentUser ? `, ${currentUser.firstName}` : ""}!</CardTitle>
							<CardDescription>Quick Actions</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-3 mb-4">
								{quickActions.map((action) => (
									<Button key={action.label} variant="outline" className="flex items-center gap-2" onClick={action.onClick}>
										{action.icon} {action.label}
									</Button>
								))}
							</div>
							<div className="flex gap-4">
								{stats.map((stat) => (
									<div key={stat.label} className="flex flex-col items-center justify-center px-4">
										<div className="mb-1">{stat.icon}</div>
										<div className="text-xl font-bold">{stat.value}</div>
										<div className="text-muted-foreground text-xs">{stat.label}</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Lightning Fast Delivery/Recent Activity */}
					<Card className="col-span-3 row-span-1" style={{ gridArea: 'activity' }}>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2">
								{/* Replace with real activities */}
								<li>No recent activities yet.</li>
							</ul>
						</CardContent>
					</Card>

					{/* Top-notch quality/Recent Projects */}
					<Card className="col-span-2 row-span-1" style={{ gridArea: 'projects' }}>
						<CardHeader>
							<CardTitle>Recent Projects</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2">
								{allProjects.slice(0, 4).map((project: Project) => (
									<li key={project.id} className="flex items-center justify-between">
										<span>{project.title}</span>
										<Button size="sm" variant="link">Go to Project</Button>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					{/* Fixed Monthly Rate/Revenue Chart */}
					<div className="col-span-1 row-span-1" style={{ gridArea: 'revenue' }}>
						<ChartPlaceholder title="Revenue Over Time" />
					</div>

					{/* Unique and all yours/Unresponded Comments */}
					<Card className="col-span-2 row-span-1" style={{ gridArea: 'comments' }}>
						<CardHeader>
							<CardTitle>Comments Needing Attention</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2">
								{commentsLoading ? (
									<li>Loading...</li>
								) : comments.filter(c => !c.done).slice(0, 4).map((comment) => (
									<li key={comment.id} className="flex items-center justify-between">
										<span>{comment.content}</span>
										<Button size="sm" variant="outline">Respond</Button>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					{/* Unique/Info Card */}
					<Card className="col-span-2 row-span-1" style={{ gridArea: 'unique' }}>
						<CardHeader>
							<CardTitle>Unique and all yours</CardTitle>
						</CardHeader>
						<CardContent>
							<p>Each of your projects and files is made especially for you and is 100% yours.</p>
						</CardContent>
					</Card>

					{/* Flexible and scalable/Payments/Files */}
					<Card className="col-span-4 row-span-1" style={{ gridArea: 'flexible' }}>
						<CardHeader>
							<CardTitle>Flexible and Scalable</CardTitle>
						</CardHeader>
						<CardContent>
							<p>Scale up or down as needed, and pause or cancel at anytime.</p>
							<ul className="space-y-2 mt-4">
								{paymentsLoading ? (
									<li>Loading payments...</li>
								) : transactions.slice(0, 3).map((tx) => (
									<li key={tx.id} className="flex items-center justify-between">
										<span>{tx.type} - ${tx.amount.toFixed(2)}</span>
										<Button size="sm" variant="link">Details</Button>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					{/* Membership/Status/Quick Toggle */}
					<Card className="col-span-2 row-span-1 flex flex-col justify-between" style={{ gridArea: 'status' }}>
						<CardHeader>
							<CardTitle>Status</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between">
								<span>Your Membership is active</span>
								<input type="checkbox" checked readOnly className="accent-primary scale-125" />
							</div>
						</CardContent>
					</Card>
				</div>
			</PageLayout>
		</AuthLayout>
	);
};

export default OverviewPage;
