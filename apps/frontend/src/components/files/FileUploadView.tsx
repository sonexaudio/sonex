import { useFileUpload } from "../../hooks/useFileUpload";

const FileUploadView = () => {
	const {
		clearFiles,
		filesToUpload,
		rejectFiles,
		isUploading,
		uploadFiles,
		removeFile,
	} = useFileUpload();

	if (filesToUpload.length === 0 && rejectFiles.length === 0)
		return <p>No files to upload.</p>;

	// console.log("I HAVE THESE TO UPLOAD", filesToUpload);

	return (
		<div>
			{!isUploading && (filesToUpload.length > 0 || rejectFiles.length > 0) && (
				<div>
					<button type="button" onClick={uploadFiles}>
						Upload File{filesToUpload.length > 1 && "s"}
					</button>
					<button type="button" onClick={clearFiles}>
						Clear All Files
					</button>
				</div>
			)}
			<div className="mt-4">
				<h4 className="font-semibold">Accepted Files</h4>
				<ul className="text-sm space-y-1">
					{filesToUpload.map((file) => (
						<li key={file.id}>
							<p>{file.name}</p>
							<p>{(file.size / 1024 / 1024).toFixed(2)}Mb</p>
							<p>{file.status}</p>

							{file.status !== "uploading" && (
								<button onClick={() => removeFile(file)}>X</button>
							)}

							{file.status === "uploading" && (
								<div className="space-y-2">
									<div className="h-2.5 w-full rounded-full bg-gray-200">
										<div
											className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
											style={{ width: `${file.progress}%` }}
										/>
									</div>
									<p className="text-sm text-gray-600">
										{file.progress}% uploaded
									</p>
								</div>
							)}
						</li>
					))}
				</ul>
			</div>

			<div className="mt-4">
				<h4 className="text-red-500 font-semibold">Rejected Files</h4>
				<ul className="text-sm text-red-600 space-y-1">
					{rejectFiles.map((file) => (
						<li key={file.id}>
							{file.name} — {file.error}
							{file.status !== "uploading" && (
								<button onClick={() => removeFile(file)}>X</button>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};
export default FileUploadView;
