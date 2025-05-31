const FileUploadCircularProgress = ({ progress }: { progress: number }) => {
	const circumference = (2 * 22) / (7 * 120);
	return (
		<div className="flex items-center justify-center">
			<svg className="transform -rotate-90 w-72 h-72">
				<circle
					cx="145"
					cy="145"
					r="120"
					stroke="currentColor"
					strokeWidth="30"
					fill="transparent"
					className="text-gray-700"
				/>
				<circle
					cx="145"
					cy="145"
					r="120"
					stroke="currentColor"
					strokeWidth="30"
					fill="transparent"
					className="text-blue-500"
					strokeDasharray={circumference}
					strokeDashoffset={`circumference - ${progress} / 100 * circumference`}
				/>
			</svg>
		</div>
	);
};

export default FileUploadCircularProgress;
