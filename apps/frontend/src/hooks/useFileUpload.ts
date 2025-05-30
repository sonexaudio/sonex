import { useContext } from "react";
import { FileUploadContext } from "../context/FileUploadProvider";

export function useFileUpload() {
	const ctx = useContext(FileUploadContext);

	if (!ctx)
		throw new Error(
			"useFileUpload must be used within the FileUpload Provider",
		);

	return ctx;
}
