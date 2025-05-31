import {
	FileAudioIcon,
	FileIcon,
	FileImageIcon,
	FileTextIcon,
	FileVideoIcon,
} from "lucide-react";

function getFileType(extension: string) {
	switch (extension) {
		case "jpg":
		case "jpeg":
		case "png":
		case "gif":
			return "image";
		case "mp4":
		case "mov":
		case "avi":
		case "mkv":
			return "video";
		case "mp3":
		case "wav":
			return "audio";
		case "pdf":
		case "doc":
		case "docx":
		case "txt":
			return "document";
		default:
			return "file";
	}
}

type FileThumbnailProps = Pick<File, "name">;

const FileThumbnail = ({ name }: FileThumbnailProps) => {
	const extension = name.split(".").pop()?.toLowerCase();
	const fileType = extension ? getFileType(extension) : "file";

	switch (fileType) {
		case "image":
			return <FileImageIcon />;
		case "video":
			return <FileVideoIcon />;
		case "audio":
			return <FileAudioIcon />;
		case "document":
			return <FileTextIcon />;
		default:
			return <FileIcon />;
	}
};

export default FileThumbnail;
