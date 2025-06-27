import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { TabsContent } from "../../../../../components/ui/tabs";
import { Button } from "../../../../../components/ui/button";
import { Check, Copy, Plus } from "lucide-react";
import NewClientForm from "../../../clients/NewClientForm";
import ProjectClients from "../ProjectClients";
import { useProjectContext } from "../../../../../context/ProjectProvider";

const ProjectClientAccessTab = () => {
    const { project } = useProjectContext();
    const [email, setEmail] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareLink = `${import.meta.env.VITE_FRONTEND_URL}/projects/${project?.id}?shareToken=${crypto.randomUUID()}`;

    const copyShareLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

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
                    <CardTitle>Client Access</CardTitle>
                    <CardDescription>Manage client access to this project</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => e.preventDefault} className="flex gap-2">
                        <Input
                            type="email"
                            placeholder="Enter client email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={isAdding || !email}>
                            {isAdding ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <ProjectClients />
        </TabsContent>
    );
};

export default ProjectClientAccessTab;