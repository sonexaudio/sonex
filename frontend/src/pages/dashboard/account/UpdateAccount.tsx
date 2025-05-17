import { useEffect, useState } from "react";
import useUser from "../../../hooks/useUser";

const UpdateAccount = () => {
	const { currentUser: user } = useUser();

	const [profilePic, setProfilePic] = useState<string | null>(
		user?.avatarUrl || null,
	);

	const [newProfilePic, setNewProfilePic] = useState<File | null>(null);

	useEffect(() => {
		if (newProfilePic) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfilePic(reader.result as string);
			};
			reader.readAsDataURL(newProfilePic);
		}
	}, [newProfilePic]);

	return (
		<div>
			<h3>Profile Information</h3>
			<div className="w-[80px] h-auto ">
				<img
					src={profilePic ?? undefined}
					alt={user?.firstName}
					className="size-full rounded-full"
				/>
			</div>
			<input
				type="file"
				onChange={(e) => setNewProfilePic(e.target.files?.[0] || null)}
				accept="image/*"
			/>
			{newProfilePic && (
				<button type="button" onClick={() => alert("Profile Pic Changed!")}>
					Change profile pic
				</button>
			)}

			{/* Update profile form */}
			<form>
				<div className="flex items-center gap-4">
					<input type="text" value={user?.firstName} />
					<input type="text" value={user?.lastName} />
				</div>
				<div>
					<input type="email" value={user?.email} />
					<input type="password" placeholder="Enter new password" />
				</div>
			</form>
		</div>
	);
};
export default UpdateAccount;
