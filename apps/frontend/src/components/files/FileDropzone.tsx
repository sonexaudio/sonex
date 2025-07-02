import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, UploadIcon } from "lucide-react";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useCallback } from "react";
import { Button } from "../ui/button";

const FileDropzone = () => {
	const { addFiles, filesToUpload } = useFileUpload();

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			addFiles(acceptedFiles);
		},
		[addFiles],
	);

	function onDropRejected(rejectedFiles: FileRejection[]) {
		rejectedFiles.forEach((file) =>
			console.log(
				`File Not Accepted: ${file.file.name}. Reason(s): ${file.errors.forEach((err) => console.log(err.code))}`,
			),
		);
	}

	const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
		onDrop,
		onDropRejected,
		accept: {
			"image/*": [],
			"audio/*": [],
		},
		multiple: true,
		maxSize: 10_000_000_000,
	});

	return (
		<div>
			<div
				className={`border-2 border-dashed rounded-lg w-full h-[300px] cursor-pointer p-4 text-center ${filesToUpload.length > 0 ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25"}`}
				{...getRootProps()}
			>
				<div className="flex flex-col items-center justify-center h-full">
					{isDragActive ? (
						<p>Add files here...</p>
					) : (
						<div className="space-y-2">
							<div className="flex justify-center">
								<Upload className="h-10 w-10 text-muted-foreground" />
							</div>
							<div>
								<p className="text-muted-foreground">
									Drag and drop audio files here, or{" "}
									<Button variant="link" className="p-0 h-auto" onClick={() => inputRef.current.click()}>
										browse
									</Button>
								</p>
								<p className="text-xs text-muted-foreground mt-1">Supported formats: MP3, WAV, FLAC, AAC (max 500MB)</p>
							</div>
						</div>
					)}
				</div>
				<input {...getInputProps()} />
			</div>
		</div>
	);
};

export default FileDropzone;
