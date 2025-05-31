import { useFileUpload } from "../../hooks/useFileUpload";
import FileUploadCard from "./FileUploadCard";

const FileUploadViewer = () => {
	const { filesToUpload, clearUploadQueue, upload } = useFileUpload();

	return (
		<div>
			<h2 className="text-lg font-semibold">Files to Be Uploaded</h2>
			<ul>
				{filesToUpload.map((file) => (
					<FileUploadCard key={file.id} {...file} />
				))}
			</ul>
			<div className="my-4 flex gap-4">
				<button type="button" onClick={upload}>
					Upload All
				</button>
				<button type="button" onClick={clearUploadQueue}>
					Clear All
				</button>
			</div>
		</div>
	);
};

export default FileUploadViewer;
