import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams } from "react-router";
import { useFolders } from "../../hooks/useFolders";

const NewFolderForm = () => {
    const { id: projectId } = useParams();
    const { createFolder } = useFolders();
    const [folderInputData, setFolderInputData] = useState<{ name: string, parentId?: string | null; }>({
        name: "",
        parentId: "",
    });
    const [loading, setLoading] = useState(false);

    const handleFolderInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFolderInputData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleCreateFolder = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const folderData = {
                ...folderInputData,
                parentId: folderInputData.parentId === "" ? null : folderInputData.parentId,
                projectId: projectId as string
            };

            const newFolder = await createFolder(folderData);

            return newFolder;
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    };

    if (!projectId) return null;

    return (
        <div>
            <h3 className="text-lg font-semibold">Create A New Folder</h3>
            <form className="flex items-center gap-2">
                <input type="text" name="name" placeholder="Enter new folder name" value={folderInputData.name} onChange={handleFolderInputChange} />
                <input type="text" disabled value={folderInputData.parentId as string} placeholder="Coming soon..." />
                <button type="submit" disabled={loading} onClick={handleCreateFolder}>Create New Folder</button>
            </form>
        </div>
    );
};

export default NewFolderForm;