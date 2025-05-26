import { useFileUpload } from "../../hooks/useFileUpload";

const FileUploadActionButton = ({
	method = "upload",
}: { method: "upload" | "clear" }) => {
	const { uploadAll, clearFiles, uploading } = useFileUpload();

	return (
		<button
			type="button"
			disabled={uploading}
			onClick={method === "upload" ? uploadAll : clearFiles}
		>
			{method === "upload" ? "Upload all" : "Clear all"}
		</button>
	);
};

export default FileUploadActionButton;
