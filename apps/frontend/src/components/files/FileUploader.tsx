import { useFileUpload } from "../../hooks/useFileUpload";

const FileUploader = () => {
	const { addFiles } = useFileUpload();
	return (
		<div className="p-4 border rounded">
			<div>
				<p>Upload files here...</p>
			</div>
			<input
				type="file"
				multiple
				onChange={(e) => {
					if (!e.target.files) return;
					addFiles(e.target.files);
				}}
			/>
		</div>
	);
};

export default FileUploader;
