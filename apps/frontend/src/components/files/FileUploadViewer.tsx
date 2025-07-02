import { Check } from "lucide-react";
import { useFileUpload } from "../../hooks/useFileUpload";
import FileUploadCard from "./FileUploadCard";
import { Button } from "../ui/button";

const FileUploadViewer = () => {
	const { filesToUpload, clearUploadQueue, upload } = useFileUpload();

	if (filesToUpload.length === 0) return null;

	return (
		<div className="space-y-4 flex flex-col">
			<div className="flex items-center justify-center">
				<Check className="size-8 text-primary" />
				<span className="ml-2 font-medium">
					{filesToUpload.length} file{filesToUpload.length > 1 ? "s" : ""} awaiting to be uploaded
				</span>
			</div>

			<div className="my-4 flex gap-4 self-end">
				<Button type="button" onClick={upload}>
					Upload All
				</Button>
				<Button type="button" variant="outline" onClick={clearUploadQueue}>
					Clear All
				</Button>
			</div>

			<ul className="space-y-2">
				{filesToUpload.map((file) => (
					<FileUploadCard key={file.id} {...file} />
				))}
			</ul>


		</div>
	);
};

export default FileUploadViewer;
