// import useProjects from "../../../hooks/useProjects";

// Here for safe keeping
const NewProjectForm = () => {
	// const { createProject } = useProjects();
	return (
		<form className="flex flex-col gap-8">
			<h3>Create New Project</h3>
			<p>Add a new music project to collaborate on with clients.</p>
			<input type="text" name="" id="" placeholder="Enter new project title" />

			<textarea
				name="description"
				id=""
				placeholder="Enter a description (optional)"
			></textarea>

			<button type="submit">Submit Project</button>
		</form>
	);
};
export default NewProjectForm;
