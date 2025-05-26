import { useState, type ChangeEvent } from "react";
import api from "../../lib/axios";
import { useParams } from "react-router";
import useUser from "../../hooks/useUser";

const FileUploadAndView = () => {
	const { id: projectId } = useParams();
	const { currentUser } = useUser();
	const [filesToUpload, setFilesToUpload] = useState([]);
	const [progress, setProgress] = useState({
		started: false,
		percentCompleted: 0,
	});

	const handleUpload = async () => {
		if (filesToUpload.length === 0) return;

		const fd = new FormData();

		for (let i = 0; i < filesToUpload.length; i++) {
			fd.append("file", filesToUpload[i]);
		}

		setProgress((prev) => ({ ...prev, started: true }));

		await api.post(
			`/projects/files?projectId=${projectId}&uploadedBy=${currentUser?.id as string}`,
			fd,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: (progressEvent) => {
					const progress = progressEvent.total
						? Math.round((progressEvent.loaded * 100) / progressEvent.total)
						: 0;
					console.log("onUploadProgress", progress);
					setProgress((prev) => ({ ...prev, percentCompleted: progress }));
				},
			},
		);

		setProgress((prev) => ({ ...prev, started: false }));
	};

	const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
		console.log(e.target.files);
		const newFiles = Array.from(e.target.files as FileList).map((f) => ({
			id: crypto.randomUUID(),
			name: f.name,
			size: f.size,
			type: f.type,
		}));

		console.log(newFiles);
		setFilesToUpload((prev) => [...prev, ...newFiles]);
	};

	return (
		<div>
			<input type="file" multiple onChange={handleFilesChange} />
			<button type="button" onClick={handleUpload}>
				Upload
			</button>

			<ul className="my-8">
				{filesToUpload.map((file) => (
					<li key={file.id}>
						{file.name} - {(file.size / 1024 / 1024).toFixed(2)}Mb
					</li>
				))}
			</ul>

			{progress.started && (
				<progress max={100} value={progress.percentCompleted} />
			)}
		</div>
	);
};

export default FileUploadAndView;
