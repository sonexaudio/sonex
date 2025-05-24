import useUser from "../../../hooks/useUser";

const AccountDangerZone = () => {
	const { deleteUser } = useUser();
	// TODO add more sections to the danger zone
	return (
		<div>
			<button onClick={deleteUser} type="button">
				Delete account
			</button>
		</div>
	);
};
export default AccountDangerZone;
