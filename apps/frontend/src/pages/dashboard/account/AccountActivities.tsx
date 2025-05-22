const AccountActivities = ({ activities }: { activities: any }) => {
	return (
		<div>
			{activities?.length > 0 ? (
				<p>Will show activities table</p>
			) : (
				<p>No recent activities</p>
			)}
		</div>
	);
};
export default AccountActivities;
