import { useState, type ChangeEvent, type FormEvent } from "react";
import { useClients, type Client } from "../../../hooks/useClients";
import { Eye, Mail, MessageCircle, Trash } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";

const ClientCard = ({ client }: { client: Client; }) => {
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
				<div className="flex items-center justify-between gap-4 border p-3 rounded-md my-2">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<p className="font-medium">{client.name}</p>
							{/* permissions indicators */}
							<div className="flex items-center gap-1">
								{/* can upload */}
								<div className="size-2 bg-blue-500 rounded-full" title="Can Upload" />
								<div className="size-2 bg-green-500 rounded-full" title="Can Comment" />
							</div>
						</div>
						<div className="flex text-xs text-muted-foreground items-center">
							<Mail className="mr-1 size-3" />
							{client.email}
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<Switch checked disabled />
							<Label htmlFor={`upload-${client.id}`}>
								<Eye className="size-5 text-muted-foreground" />
							</Label>
						</div>
						<div className="flex items-center gap-2">
							<Switch checked disabled />
							<Label htmlFor={`upload-${client.id}`}>
								<MessageCircle className="size-5 text-muted-foreground" />
							</Label>
						</div>
						<Button variant="ghost" size="icon" onClick={handleRemoveClient} className="text-destructive hover:text-destructive">
							<Trash className="size-4" />
						</Button>
					</div>
				</div>
			)}
		</>
	);
};

export default ClientCard;
