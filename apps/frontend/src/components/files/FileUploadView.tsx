import { useFileUpload } from "../../hooks/useFileUpload";
import FileUploadActionButton from "./FileUploadActionButton";

const FileUploadView = () => {
	const { filesToUpload, uploading, removeFile, retryFile } = useFileUpload();
	return (
		<div>
			<h2>Files to be uploaded</h2>
			<div className="flex gap-4 my-4">
				<FileUploadActionButton method="upload" />
				<FileUploadActionButton method="clear" />
			</div>
			<ul>
				{filesToUpload.map(
					({ file, id, previewUrl, progress, status, error }) => (
						<li key={id}>
							<div className="flex gap-4">
								<span>{file.name}</span>
								<span>{status}</span>
								<span>{(file.size / 1024 / 1024).toFixed(2)}MB</span>
								<span onClick={() => removeFile(id)}>X</span>
								{(error || status === "failed") && (
									<button type="button" onClick={() => retryFile(id)}>
										Retry
									</button>
								)}
							</div>
							<div>
								{file.type.includes("audio/") && (
									<audio src={previewUrl} controls />
								)}

								{file.type.includes("image/") && (
									<img src={previewUrl} alt="" />
								)}
							</div>

							{uploading && status === "uploading" && (
								<progress max={100} value={progress} />
							)}

							{error && <p>{error}</p>}
						</li>
					),
				)}
			</ul>
		</div>
	);
};

export default FileUploadView;
