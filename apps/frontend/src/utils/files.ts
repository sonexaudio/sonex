import type { SonexFile } from "../types/files";
import { v4 as uuidv4 } from "uuid";

export function convertFileToSonexFile(file: File): SonexFile {
	return {
		id: uuidv4(),
		name: file.name,
		size: file.size,
		type: file.type,
		status: "idle",
		progress: 0,
		error: null,
	};
}
