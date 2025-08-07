import type { SonexFile } from "../types/files";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAllFiles, deleteFile, fetchFiles, getFile, getFileBlob } from "./query-functions/files";
import { useParams } from "react-router";

export default function useFiles(options?: { includeStreamUrl?: boolean; }) {
	const queryClient = useQueryClient();
	const { fileId } = useParams();

	const includeStreamUrl = options?.includeStreamUrl ?? false;

	const fetchAll = useQuery({
		queryKey: ["files"],
		queryFn: fetchFiles,
	});

	const getSingle = useQuery({
		queryKey: ["file", fileId, includeStreamUrl ? "include-stream-url" : "exclude-stream-url"],
		queryFn: ({ queryKey }) => {
			const [, id] = queryKey;
			if (!id) return Promise.resolve(null);
			return getFile(id as string, includeStreamUrl);
		},
		enabled: !!fileId,
	});

	const deleteSingle = useMutation({
		mutationFn: (id: string) => deleteFile(id),
		onSuccess: (id) => {
			queryClient.removeQueries({ queryKey: ["file", id] });
			queryClient.invalidateQueries({ queryKey: ["files"] });
		}
	});

	const deleteAll = useMutation({
		mutationFn: (fileIds: string[]) => deleteAllFiles(fileIds),
		onSuccess: (fileIds) => {
			fileIds.forEach(id => {
				queryClient.removeQueries({ queryKey: ["file", id] });
			});
			queryClient.invalidateQueries({ queryKey: ["files"] });
		}
	});

	const download = useMutation({
		mutationFn: (fileId: string) => getFileBlob(fileId),
	});

	const isLoading = fetchAll.isLoading || getSingle.isPending || deleteSingle.isPending || deleteAll.isPending || download.isPending;

	return {
		files: fetchAll.data || [],
		currentFile: getSingle.data as SonexFile | undefined | null,
		isLoading,
		downloadFile: download.mutateAsync,
		deleteAllFiles: deleteAll.mutateAsync,
		deleteFile: deleteSingle.mutateAsync,
	};
}
