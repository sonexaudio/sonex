import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { FileText, Users } from "lucide-react";
import ProjectOverviewTab from "./ProjectOverviewTab";
import ProjectFilesTab from "./ProjectFilesTab";
import ProjectClientAccessTab from "./ProjectClientAccessTab";

const ProjectViewTabs = () => {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="files">
                    <FileText className="mr-0.5 size-4" />
                    Files
                </TabsTrigger>
                <TabsTrigger value="clients">
                    <Users className="mr-0.5 size-4" />
                    Client Access
                </TabsTrigger>
            </TabsList>
            <ProjectOverviewTab />
            <ProjectFilesTab />
            <ProjectClientAccessTab />
        </Tabs>
    );
};

export default ProjectViewTabs;