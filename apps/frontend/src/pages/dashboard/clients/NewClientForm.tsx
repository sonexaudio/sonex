import { useState, type ChangeEvent, type FormEvent } from "react";
import useUser from "../../../hooks/useUser";
import { useParams } from "react-router";
import { useClients } from "../../../hooks/useClients";

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
            addedBy: currentUser?.id
        };

        await addClient(data);

        setClientData({ name: "", email: "" });
    };

    return (
        <form onSubmit={handleAddClient}>
            <h3>New Client Form</h3>
            <input type="text" value={clientData.name} onChange={handleInputChange} name="name" placeholder="Enter Client Name" />
            <input type="email" name="email" onChange={handleInputChange} placeholder="Enter Client Email" />
            <button type="submit">Create new Client</button>
        </form>
    );
};

export default NewClientForm;