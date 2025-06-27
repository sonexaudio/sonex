import { useState, type ChangeEvent, type FormEvent } from "react";
import useUser from "../../../hooks/useUser";
import { useParams } from "react-router";
import { useClients } from "../../../hooks/useClients";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

const NewClientForm = () => {
	const { currentUser } = useUser();
	const { id: projectId } = useParams();
	const { addClient } = useClients();
	const [clientData, setClientData] = useState({
		name: "",
		email: "",
	});

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setClientData((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddClient = async (e: FormEvent) => {
		e.preventDefault();

		const data = {
			name: clientData.name,
			email: clientData.email,
			projectId,
			addedBy: currentUser?.id,
		};

		await addClient(data);

		setClientData({ name: "", email: "" });
	};

	return (
		<form onSubmit={handleAddClient}>
			<h3>Create a New Client</h3>
			<Input
				type="text"
				value={clientData.name}
				onChange={handleInputChange}
				name="name"
				placeholder="Enter Client Name"
			/>
			<Input
				type="email"
				name="email"
				onChange={handleInputChange}
				placeholder="Enter Client Email"
			/>
			<Button type="submit">Create new Client</Button>
		</form>
	);
};

export default NewClientForm;
