import { useState } from "react";
import { FolderPlus, Upload, Grid, List, Search, Filter, MoreHorizontal } from "lucide-react";
import PageLayout from "../../../components/PageLayout";
import FilesViewTable from "./FilesViewTable";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { formatFileSize } from "../../../utils/files";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogTrigger, DialogContent } from "../../../components/ui/dialog";
import NewFolderForm from "../../../components/folders/NewFolderForm";
import { FileUploadProvider } from "../../../context/FileUploadProvider";
import FileDropzone from "../../../components/files/FileDropzone";
import FileUploadViewer from "../../../components/files/FileUploadViewer";
import useUser from "../../../hooks/useUser";
import useFiles from "../../../hooks/useFiles";
import { useFolders } from "../../../hooks/useFolders";

const FilesPage = () => {
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
	const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
	const [showUploadDialog, setShowUploadDialog] = useState(false);

	const { currentUser } = useUser();
	const { files, deleteAllFiles, deleteFile, loading: filesLoading, downloadFile, fetchFiles } = useFiles();
	const { folders, loading: foldersLoading, fetchFolders, } = useFolders();


	// Filter files based on search query and selected folder
	const filteredFiles = files.filter(file => {
		const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFolder = selectedFolder ? file.folderId === selectedFolder : !file.folderId;
		return matchesSearch && matchesFolder;
	});

	const handleCloseFolderDialog = () => {
		setShowNewFolderDialog(false);
	};

	const handleCloseUploadDialog = () => {
		setShowUploadDialog(false);
	};

	if (loading) {
		return (

			<PageLayout>
				<div className="flex items-center justify-center h-64">
					<p>Loading files...</p>
				</div>
			</PageLayout>

		);
	}

	return (

		<PageLayout>
			<div className="space-y-6 mt-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Files</h1>
						<p className="text-muted-foreground">
							Manage your files, organize with folders, and control access permissions.
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
							<DialogTrigger asChild>
								<Button variant="outline">
									<FolderPlus className="h-4 w-4 mr-2" />
									New Folder
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px]">
								<NewFolderForm onClose={handleCloseFolderDialog} />
							</DialogContent>
						</Dialog>
						<Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
							<DialogTrigger asChild>
								<Button>
									<Upload className="h-4 w-4 mr-2" />
									Upload Files
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[600px]">
								<FileUploadProvider
									projectId="global"
									uploaderId={currentUser?.id || ""}
									uploaderType="USER"
								>
									<div className="space-y-4">
										<h3 className="text-lg font-semibold">Upload Files</h3>
										<FileDropzone />
										<FileUploadViewer />
									</div>
								</FileUploadProvider>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="flex items-center space-x-4">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search files..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Button variant="outline" size="sm">
						<Filter className="h-4 w-4 mr-2" />
						Filter
					</Button>
					<div className="flex items-center border rounded-md">
						<Button
							variant={viewMode === "grid" ? "default" : "ghost"}
							size="sm"
							onClick={() => setViewMode("grid")}
						>
							<Grid className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === "list" ? "default" : "ghost"}
							size="sm"
							onClick={() => setViewMode("list")}
						>
							<List className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Folder Navigation */}
				{folders.length > 0 && (
					<div className="flex items-center space-x-2 overflow-x-auto pb-2">
						<Button
							variant={selectedFolder === null ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectedFolder(null)}
						>
							All Files
						</Button>
						{folders.map((folder) => (
							<Button
								key={folder.id}
								variant={selectedFolder === folder.id ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedFolder(folder.id)}
							>
								{folder.name}
							</Button>
						))}
					</div>
				)}

				{/* Content */}
				<Tabs defaultValue="files" className="w-full">
					<TabsList>
						<TabsTrigger value="files">Files ({filteredFiles.length})</TabsTrigger>
						<TabsTrigger value="folders">Folders ({folders.length})</TabsTrigger>
					</TabsList>

					<TabsContent value="files" className="mt-6">
						{viewMode === "grid" ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
								{filteredFiles.map((file) => (
									<Card key={file.id} className="hover:shadow-md transition-shadow cursor-pointer">
										<CardContent className="p-4">
											<div className="flex items-center space-x-3">
												<div className="flex-shrink-0">
													<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
														<span className="text-xs font-medium text-primary">
															{file.name.split('.').pop()?.toUpperCase()}
														</span>
													</div>
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">{file.name}</p>
													<p className="text-xs text-muted-foreground">
														{formatFileSize(file.size)}
													</p>
													<p className="text-xs text-muted-foreground">
														{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
													</p>
												</div>
											</div>
											<div className="mt-3 flex items-center justify-between">
												<Badge variant={file.isPublic ? "default" : "secondary"}>
													{file.isPublic ? "Public" : "Private"}
												</Badge>
												<Button variant="ghost" size="sm">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<FilesViewTable />
						)}
					</TabsContent>

					<TabsContent value="folders" className="mt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{folders.map((folder) => (
								<Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer">
									<CardContent className="p-4">
										<div className="flex items-center space-x-3">
											<div className="flex-shrink-0">
												<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
													<FolderPlus className="h-5 w-5 text-blue-600" />
												</div>
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium truncate">{folder.name}</p>
												<p className="text-xs text-muted-foreground">
													{formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true })}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</PageLayout>

	);
};

export default FilesPage;
