// import type { SonexFile } from "../types/files";
// import { v4 as uuidv4 } from "uuid";

// export function convertFileToSonexFile(file: File): SonexFile {
// 	return {
// 		id: uuidv4(),
// 		name: file.name,
// 		size: file.size,
// 		type: file.type,
// 		status: "idle",
// 		progress: 0,
// 		error: null,
// 	};
// }

export function formatFileSize(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes < 0) return "Invalid input";
	
	const units = ["B", "Kb", "Mb", "Gb", "Tb", "Pb"];
	const base = 1024

	if (bytes === 0) return "0B";

	const i = Math.floor(Math.log(bytes) / Math.log(base));
	const size = (bytes / Math.pow(base, i)).toFixed(2).replace(/\.00$/, "")

	return `${size}${units[i]}`
}