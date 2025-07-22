import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { TabsContent } from "../../../../../components/ui/tabs";
import { Button } from "../../../../../components/ui/button";
import { Check, Copy } from "lucide-react";
// import NewClientForm from "../../../clients/NewClientForm";
import ProjectClients from "../ProjectClients";
import { useProjectContext } from "../../../../../context/ProjectProvider";
import ClientAutoSuggestForm from "../../../../../components/ClientAutoSuggestForm";
import { useClients } from "../../../../../hooks/useClients";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "../../../../../components/ui/dialog";
import useUser from "../../../../../hooks/useUser";

const ProjectClientAccessTab = () => {
    const { project, clients, addClientToProject } = useProjectContext();
    const { currentUser } = useUser();
    const [showDialog, setShowDialog] = useState(false);
    const [newClientEmail, setNewClientEmail] = useState("");
    const [newClientName, setNewClientName] = useState("");
    const [copied, setCopied] = useState(false);

    const shareLink = `${import.meta.env.VITE_FRONTEND_URL}/projects/${project?.id}?shareToken=${crypto.randomUUID()}`;

    const copyShareLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

    };


    const addExistingClientToProject = async () => {
        alert("Adding Existing Client to Project");
    };

    const showClientDialog = async (email: string) => {
        setNewClientEmail(email);
        setShowDialog(true);
    };

    const handleAddNewClientToProject = async () => {
        await addClientToProject({ email: newClientEmail, name: newClientName, userId: currentUser?.id, projectId: project?.id });
        setShowDialog(false);
        setNewClientEmail("");
        setNewClientName("");
    };

    return (
        <TabsContent value="clients" className="mt-6 grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Share Link</CardTitle>
                    <CardDescription>Share this link with clients to give them access to the project</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input value={shareLink} readOnly />
                        <Button variant="outline" onClick={copyShareLink}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Add Client</CardTitle>
                    <CardDescription>Add an existing client or create and invite a new client</CardDescription>
                </CardHeader>
                <CardContent>
                    <ClientAutoSuggestForm
                        existingProjectClients={clients} onAddExistingClient={addExistingClientToProject} onAddNewClient={showClientDialog}
                    />
                </CardContent>
            </Card>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogDescription>
                            Provide a name for <span className="font-medium">{newClientEmail}</span> before inviting.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="Client Name"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="mt-4"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddNewClientToProject} disabled={!newClientName}>
                            Add Client
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <ProjectClients />
        </TabsContent>
    );
};

export default ProjectClientAccessTab;