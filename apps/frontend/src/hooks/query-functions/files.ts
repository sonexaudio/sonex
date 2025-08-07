import api from "../../lib/axios";

export async function fetchFiles() {
    const { data } = await api.get("/files");
    return data.data.files; // returns all files
}

// Get file by ID, optionally including stream URL or download URL
export async function getFile(id: string, includeStreamUrl = false) {
    let fileUrl = `/files/${id}`;

    // Append stream or download URL if requested
    if (includeStreamUrl) {
        fileUrl += "/stream-url";
    }

    const { data } = await api.get(fileUrl);
    return data.data.file; // returns the file
}

export async function getFileBlob(id: string) {
    const { data } = await api.get(`/files/${id}/download`);
    return data.data.url; // returns the file blob
}


export async function deleteFile(id: string) {
    await api.delete(`/files/${id}`);
    return id; // returns the deleted file ID
}

export async function deleteAllFiles(fileIds: string[]) {
    await api.post("/files/delete-all", { fileIds: JSON.stringify(fileIds) });
    return fileIds; // returns the deleted file IDs
}