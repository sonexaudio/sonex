import { useState, type ChangeEvent, type FormEvent } from "react";
import { useParams } from "react-router";
import { useFolders } from "../../hooks/useFolders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Folder } from "lucide-react";
import { useProjectContext } from "../../context/ProjectProvider";

interface NewFolderFormProps {
    onClose?: () => void;
}

const NewFolderForm = ({ onClose }: NewFolderFormProps) => {
    const { id: projectId } = useParams();
    const { createFolder } = useFolders();
    const { refetchFolders } = useProjectContext();

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
            await refetchFolders();

            if (onClose) {
                onClose();
            }

            return newFolder;
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    };

    if (!projectId) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex gap-2 font-bold text-lg items-center"><Folder /> Create A New Folder</CardTitle>
                <CardDescription>Your new folder will be added to your <em>Files</em> section.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="flex flex-col gap-2" onSubmit={handleCreateFolder}>
                    <Input
                        type="text"
                        name="name"
                        placeholder="Enter new folder name"
                        value={folderInputData.name}
                        onChange={handleFolderInputChange}
                    />
                    <Input
                        type="text"
                        disabled
                        value={folderInputData.parentId as string} placeholder="Add parent folder coming soon..."
                    />
                    <Button
                        type="submit"
                        disabled={loading}
                    >Create New Folder
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default NewFolderForm;