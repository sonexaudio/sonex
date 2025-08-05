import NewProjectForm from "../forms/NewProjectForm";

const NoProjects = () => {
    return (
        <div className="text-center mt-10">
            <h2 className="text-2xl font-bold mb-4">Get Started</h2>
            <p className="text-muted-foreground mb-6">Create your first project, invite clients, and start collaborating!</p>
            <NewProjectForm />
        </div>
    );
};
export default NoProjects;