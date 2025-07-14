import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import useProjects from "../../../hooks/useProjects";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../../components/ui/alert-dialog";
import { Skeleton } from "../../../components/ui/skeleton";
import {
	Search,
	MoreHorizontal,
	Edit,
	Trash2,
	Eye,
	Calendar,
	DollarSign,
	Users,
	FileText,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ChevronDown,
	ArrowUpDown
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

type SortField = 'title' | 'status' | 'paymentStatus' | 'amount' | 'dueDate' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

interface ProjectTableData {
	id: string;
	title: string;
	description?: string | null;
	status: string;
	paymentStatus: string;
	amount?: number | null;
	dueDate?: Date | null;
	createdAt: Date;
	updatedAt: Date;
	fileCount?: number;
	clientCount?: number;
}

const ProjectsTable = () => {
	const { state, getAllProjects, deleteProject, loading } = useProjects();
	const navigate = useNavigate();

	// State for table functionality
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
	const [sortField, setSortField] = useState<SortField>('createdAt');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

	const projects = state.allProjects;
	const pagination = state.pagination;

	useEffect(() => {
		getAllProjects({
			page: currentPage,
			limit: itemsPerPage,
			search: searchTerm,
			status: statusFilter !== 'all' ? statusFilter : undefined,
			paymentStatus: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
			sortField,
			sortDirection,
		});
	}, [currentPage, itemsPerPage, searchTerm, statusFilter, paymentStatusFilter, sortField, sortDirection, getAllProjects]);

	// Transform projects data for table
	const tableData: ProjectTableData[] = useMemo(() => {
		return projects.map(project => ({
			id: project.id,
			title: project.title,
			description: project.description,
			status: project.status || 'Active',
			paymentStatus: project.paymentStatus || 'Unpaid',
			amount: project.amount,
			dueDate: project.dueDate ? new Date(project.dueDate) : null,
			createdAt: new Date(project.createdAt as Date),
			updatedAt: new Date(project.updatedAt as Date),
			fileCount: project.fileCount || 0,
			clientCount: project.clientCount || 0,
		}));
	}, [projects]);

	// Use tableData directly since server handles filtering, sorting, and pagination
	const paginatedData = tableData;

	// Handle sorting
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	// Handle project deletion
	const handleDeleteProject = async () => {
		if (deleteProjectId) {
			try {
				await deleteProject(deleteProjectId);
				setDeleteProjectId(null);
			} catch (error) {
				console.error('Failed to delete project:', error);
			}
		}
	};

	// Get status badge variant
	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'Active': return 'default';
			case 'Complete': return 'secondary';
			case 'Archived': return 'outline';
			case 'Private': return 'destructive';
			default: return 'default';
		}
	};

	// Get payment status badge variant
	const getPaymentStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'Paid': return 'default';
			case 'Unpaid': return 'destructive';
			case 'Free': return 'secondary';
			default: return 'outline';
		}
	};

	// Format amount
	const formatAmount = (amount?: number | null) => {
		if (!amount) return '—';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	// Get sort icon
	const getSortIcon = (field: SortField) => {
		if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
		return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
	};

	if (loading) {
		return (
			<Card>
				<CardContent>
					<div className="space-y-4">
						{[1, 2, 3, 4, 5].map((id) => (
							<div key={`skeleton-${id}`} className="flex items-center space-x-4">
								<Skeleton className="h-12 w-12 rounded" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-[250px]" />
									<Skeleton className="h-4 w-[200px]" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">

			{/* Search and Filters */}
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<Input
						placeholder="Search projects..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="Active">Active</SelectItem>
						<SelectItem value="Complete">Complete</SelectItem>
						<SelectItem value="Archived">Archived</SelectItem>
						<SelectItem value="Private">Private</SelectItem>
					</SelectContent>
				</Select>
				<Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by payment" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Payment Status</SelectItem>
						<SelectItem value="Paid">Paid</SelectItem>
						<SelectItem value="Unpaid">Unpaid</SelectItem>
						<SelectItem value="Free">Free</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-muted/50">
							<tr>
								<th className="text-left p-4 font-medium">
									<Button
										variant="ghost"
										onClick={() => handleSort('title')}
										className="h-auto p-0 font-medium"
									>
										Project
										{getSortIcon('title')}
									</Button>
								</th>
								<th className="text-left p-4 font-medium">
									<Button
										variant="ghost"
										onClick={() => handleSort('status')}
										className="h-auto p-0 font-medium"
									>
										Status
										{getSortIcon('status')}
									</Button>
								</th>
								<th className="text-left p-4 font-medium">
									<Button
										variant="ghost"
										onClick={() => handleSort('paymentStatus')}
										className="h-auto p-0 font-medium"
									>
										Payment
										{getSortIcon('paymentStatus')}
									</Button>
								</th>
								<th className="text-left p-4 font-medium">
									<Button
										variant="ghost"
										onClick={() => handleSort('amount')}
										className="h-auto p-0 font-medium"
									>
										Amount
										{getSortIcon('amount')}
									</Button>
								</th>
								<th className="text-left p-4 font-medium">
									<Button
										variant="ghost"
										onClick={() => handleSort('dueDate')}
										className="h-auto p-0 font-medium"
									>
										Due Date
										{getSortIcon('dueDate')}
									</Button>
								</th>
								<th className="text-left p-4 font-medium">
									<Button
										variant="ghost"
										onClick={() => handleSort('createdAt')}
										className="h-auto p-0 font-medium"
									>
										Created
										{getSortIcon('createdAt')}
									</Button>
								</th>
								<th className="text-left p-4 font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{paginatedData.map((project) => (
								<tr key={project.id} className="border-t hover:bg-muted/50 transition-colors">
									<td className="p-4">
										<div>
											<div className="font-medium cursor-pointer hover:text-primary"
												onClick={() => navigate(`/projects/${project.id}`)}>
												{project.title}
											</div>
											{project.description && (
												<div className="text-sm text-muted-foreground mt-1">
													{project.description.length > 50
														? `${project.description.substring(0, 50)}...`
														: project.description}
												</div>
											)}
											<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<FileText className="h-3 w-3" />
													{project.fileCount || 0} files
												</span>
												<span className="flex items-center gap-1">
													<Users className="h-3 w-3" />
													{project.clientCount || 0} clients
												</span>
											</div>
										</div>
									</td>
									<td className="p-4">
										<Badge variant={getStatusBadgeVariant(project.status)}>
											{project.status}
										</Badge>
									</td>
									<td className="p-4">
										<Badge variant={getPaymentStatusBadgeVariant(project.paymentStatus)}>
											{project.paymentStatus}
										</Badge>
									</td>
									<td className="p-4">
										<div className="flex items-center gap-1">
											<DollarSign className="h-4 w-4 text-muted-foreground" />
											{formatAmount(project.amount)}
										</div>
									</td>
									<td className="p-4">
										{project.dueDate ? (
											<div className="flex items-center gap-1">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<span className={project.dueDate < new Date() ? 'text-destructive' : ''}>
													{format(project.dueDate, 'MMM dd, yyyy')}
												</span>
											</div>
										) : (
											<span className="text-muted-foreground">No due date</span>
										)}
									</td>
									<td className="p-4">
										<div className="text-sm">
											<div>{format(project.createdAt, 'MMM dd, yyyy')}</div>
											<div className="text-muted-foreground">
												{formatDistanceToNow(project.createdAt, { addSuffix: true })}
											</div>
										</div>
									</td>
									<td className="p-4">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => navigate(`/projects/${project.id}`)}>
													<Eye className="mr-2 h-4 w-4" />
													View Project
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => navigate(`/projects/${project.id}/edit`)}>
													<Edit className="mr-2 h-4 w-4" />
													Edit Project
												</DropdownMenuItem>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<DropdownMenuItem
															onSelect={(e) => e.preventDefault()}
															onClick={() => setDeleteProjectId(project.id)}
															className="text-destructive"
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete Project
														</DropdownMenuItem>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Delete Project</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete "{project.title}"? This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel onClick={() => setDeleteProjectId(null)}>
																Cancel
															</AlertDialogCancel>
															<AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</DropdownMenuContent>
										</DropdownMenu>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			{pagination && pagination.totalPages > 1 && (
				<div className="flex items-center justify-between mt-6">
					<div className="text-sm text-muted-foreground">
						Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} projects
					</div>
					<div className="flex items-center gap-2">
						<Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
							<SelectTrigger className="w-[80px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="5">5</SelectItem>
								<SelectItem value="10">10</SelectItem>
								<SelectItem value="20">20</SelectItem>
								<SelectItem value="50">50</SelectItem>
							</SelectContent>
						</Select>
						<div className="flex items-center gap-1">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage(currentPage - 1)}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="px-3 py-2 text-sm">
								Page {currentPage} of {pagination?.totalPages || 1}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage(currentPage + 1)}
								disabled={currentPage === (pagination?.totalPages || 1)}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Empty State */}
			{paginatedData.length === 0 && (
				<div className="text-center py-12">
					<div className="text-muted-foreground mb-4">
						{searchTerm || statusFilter !== 'all' || paymentStatusFilter !== 'all'
							? 'No projects match your filters.'
							: 'No projects yet.'}
					</div>
					{searchTerm || statusFilter !== 'all' || paymentStatusFilter !== 'all' ? (
						<Button variant="outline" onClick={() => {
							setSearchTerm('');
							setStatusFilter('all');
							setPaymentStatusFilter('all');
						}}>
							Clear Filters
						</Button>
					) : (
						<Button onClick={() => navigate('/projects/new')}>
							Create Your First Project
						</Button>
					)}
				</div>
			)}

		</div>
	);
};

export default ProjectsTable;
