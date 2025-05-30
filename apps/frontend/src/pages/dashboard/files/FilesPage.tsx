import { AuthProvider } from "../../../context/AuthProvider";
import PageLayout from "../../../components/PageLayout";
import FilesViewTable from "./FilesViewTable";

const FilesPage = () => {
	return (
		<AuthProvider>
			<PageLayout>
				<FilesViewTable />
			</PageLayout>
		</AuthProvider>
	);
};

export default FilesPage;
