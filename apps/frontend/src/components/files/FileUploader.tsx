import { useFileUpload } from "../../hooks/useFileUpload";

const FileUploader = () => {
	const {
		handleFilesDrop,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		isDragging,
	} = useFileUpload();

	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={`flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 transition border-2 rounded-lg shadow-sm space-y-4
		${isDragging ? "border-indigo-500 bg-indigo-50" : "border-dashed border-gray-300 bg-white"}`}
		>
			<label
				htmlFor="file-upload"
				className="flex flex-col items-center justify-center w-full cursor-pointer"
			>
				<div className="flex flex-col items-center justify-center text-center space-y-2">
					<p className="text-sm text-gray-500">
						<span className="font-medium text-indigo-600">Click to upload</span>{" "}
						or drag and drop
					</p>
					<p className="text-xs text-gray-400">MP3, WAV up to 50MB</p>
				</div>
				<input
					type="file"
					multiple
					onChange={handleFilesDrop}
					className="hidden"
				/>
			</label>
		</div>
	);
};
export default FileUploader;
