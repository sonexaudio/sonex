import { useState, type ChangeEvent, type FormEvent } from "react";
import useUser from "../../hooks/useUser";
import { useParams } from "react-router";
import { useClients } from "../../hooks/useClients";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { DialogHeader, DialogTitle, DialogFooter, DialogTrigger, Dialog, DialogContent } from "../ui/dialog";
import { Plus } from "lucide-react";

const NewClientForm = () => {
	const { currentUser } = useUser();
	const { id: projectId } = useParams();
	const { createClient } = useClients();
	const [showNewClientForm, setShowNewClientForm] = useState(false);
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
				name: clientData.name.trim(),
				email: clientData.email.trim(),
				projectId,
				userId: currentUser?.id,
			};

			await createClient(data);
			setClientData({ name: "", email: "" });
			setShowNewClientForm(false);
		} catch (error) {
			console.error("Failed to add client:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={showNewClientForm} onOpenChange={setShowNewClientForm}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					New Client
				</Button>
			</DialogTrigger>
			<DialogContent>
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
						<Button type="button" variant="outline" onClick={() => setShowNewClientForm(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Creating..." : "Create Client"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default NewClientForm;
