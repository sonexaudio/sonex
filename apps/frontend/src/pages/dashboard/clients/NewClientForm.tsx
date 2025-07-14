import { useState, type ChangeEvent, type FormEvent } from "react";
import useUser from "../../../hooks/useUser";
import { useParams } from "react-router";
import { useClients } from "../../../hooks/useClients";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";

interface NewClientFormProps {
	onClose: () => void;
}

const NewClientForm = ({ onClose }: NewClientFormProps) => {
	const { currentUser } = useUser();
	const { id: projectId } = useParams();
	const { addClient } = useClients();
	const [clientData, setClientData] = useState({
		name: "",
		email: "",
	});
	const [loading, setLoading] = useState(false);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setClientData((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddClient = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const data = {
				name: clientData.name,
				email: clientData.email,
				projectId,
				addedBy: currentUser?.id,
			};

			await addClient(data);
			setClientData({ name: "", email: "" });
			onClose();
		} catch (error) {
			console.error("Failed to add client:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>Create a New Client</DialogTitle>
			</DialogHeader>
			<form onSubmit={handleAddClient} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						type="text"
						value={clientData.name}
						onChange={handleInputChange}
						name="name"
						placeholder="Enter client name"
						required
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						name="email"
						value={clientData.email}
						onChange={handleInputChange}
						placeholder="Enter client email"
						required
					/>
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" disabled={loading}>
						{loading ? "Creating..." : "Create Client"}
					</Button>
				</DialogFooter>
			</form>
		</>
	);
};

export default NewClientForm;
