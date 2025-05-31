import PageLayout from "../../../components/PageLayout";
import FilesViewTable from "./FilesViewTable";
import AuthLayout from "../../../components/AuthLayout";

const FilesPage = () => {
	return (
		<AuthLayout>
			<PageLayout>
				<FilesViewTable />
			</PageLayout>
		</AuthLayout>
	);
};

export default FilesPage;
