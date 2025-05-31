import { useState, type ChangeEvent, type FormEvent } from "react";
import { useClients, type Client } from "../../../hooks/useClients";

const ClientCard = ({ client }: { client: Client }) => {
	const { updateClient, removeClient } = useClients();
	const [clientData, setClientData] = useState({
		name: client.name,
		email: client.email,
	});
	const [isEditing, setIsEditing] = useState(false);

	const updateClientValue = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setClientData((prevData) => ({ ...prevData, [name]: value }));
	};

	const handleUpdate = async (e: FormEvent) => {
		e.preventDefault();
		await updateClient(client.id, clientData);
		setIsEditing(false);
	};

	const handleRemoveClient = async () => {
		await removeClient(client.id);
	};

	return (
		<>
			{isEditing ? (
				<div>
					<form
						onSubmit={handleUpdate}
						className="flex justify-between gap-4 border p-4"
					>
						<div className="flex gap-4">
							<input
								name="name"
								value={clientData.name}
								onChange={updateClientValue}
								className="border focus:ring-2 focus:ring-primary rounded-md p-2 w-full"
							/>
							<input
								type="email"
								name="email"
								value={clientData.email}
								onChange={updateClientValue}
								className="border focus:ring-2 focus:ring-primary rounded-md p-2 w-full"
							/>
						</div>

						<div className="flex gap-4">
							<button type="submit">Save</button>
							<button type="button" onClick={() => setIsEditing(false)}>
								Cancel
							</button>
						</div>
					</form>
				</div>
			) : (
				<div className="flex justify-between gap-4 border p-4">
					<div>
						<p>
							{client.name} - {client.email}
						</p>
						<div className="flex gap-4 items-center">
							<span>
								Created: {new Date(client.createdAt).toLocaleDateString()}
							</span>
							<span>
								Last Updated: {new Date(client.updatedAt).toLocaleDateString()}
							</span>
						</div>
					</div>
					<div className="flex gap-4">
						<button type="button" onClick={() => setIsEditing(true)}>
							Edit
						</button>
						<button type="button" onClick={handleRemoveClient}>
							Delete
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default ClientCard;
