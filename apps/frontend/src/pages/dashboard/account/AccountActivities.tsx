export interface Activity {
	id: string;
	userId: string;
	action: string;
	metadata?: Record<string, unknown>;
	targetType: string;
	targetId: string;
	createdAt: Date | string;
}

const AccountActivities = ({ activities }: { activities: Activity[]; }) => {
	console.log(activities);

	return (
		<div>
			<h3 className="font-semibold text-lg my-4">Activities</h3>
			{activities?.length > 0 ? (
				<ul >
					{activities.map(act => (
						<li key={act.id} className="grid grid-cols-3 gap-4">
							<p>{act.action}</p>
							<p>{act.metadata?.email || act.metadata?.filename || act.metadata?.projectTitle}</p>
							<p>{new Date(act.createdAt).toLocaleDateString()}</p>
						</li>
					))}
				</ul>
			) : (
				<p>No recent activities</p>
			)}
		</div>
	);
};
export default AccountActivities;
