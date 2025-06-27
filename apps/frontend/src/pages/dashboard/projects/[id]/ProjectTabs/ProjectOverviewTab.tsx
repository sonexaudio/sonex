import { TabsContent } from "../../../../../components/ui/tabs";
import ProjectActions from "../ProjectActions";
import ProjectDetails from "../ProjectDetails";

const ProjectOverviewTab = () => {
    return (
        <TabsContent value="overview">
            <ProjectDetails />
        </TabsContent>
    );
};

export default ProjectOverviewTab;