import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import useProjects from "../../../hooks/useProjects";
import { useInfiniteQuery } from "@tanstack/react-query";
import ProjectViewCard from "../../../components/projects/ProjectViewCard";
import { fetchProjects } from "../../../hooks/query-functions/projects";
import NoProjects from "../../../components/empty-state/NoProjects";
import { Card, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";

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
	// State for table functionality
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
	const [sortField, setSortField] = useState<SortField>('createdAt');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(12);
	const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

	const navigate = useNavigate();

	const { isLoading, isError } = useProjects({
		page: currentPage,
		limit: itemsPerPage,
		search: searchTerm,
		status: statusFilter !== "all" ? statusFilter : undefined,
		paymentStatus: paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
		sortField,
		sortDirection,
	});

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
		queryKey: ["projects", { searchTerm, statusFilter, paymentStatusFilter, sortField, sortDirection, itemsPerPage }],
		queryFn: ({ pageParam = 1 }) =>
			fetchProjects({
				page: pageParam,
				limit: itemsPerPage,
				search: searchTerm,
				status: statusFilter !== "all" ? statusFilter : undefined,
				paymentStatus: paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
				sortField,
				sortDirection,
			}),
		getNextPageParam: (lastPage) => {
			const { pagination } = lastPage;
			return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined;
		},
	});

	const projects = data?.pages.flatMap(page => page.projects) ?? [];

	// Intersection Observer for infinite scroll
	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!hasNextPage || isFetchingNextPage) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) fetchNextPage();
			},
			{ threshold: 1 }
		);
		if (loadMoreRef.current) observer.observe(loadMoreRef.current);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);


	if (isLoading) {
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
		<div className="space-y-2">

			{/* Search and Filters */}
			{/* <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
			</div> */}
			{projects.length === 0 ? <NoProjects /> : (
				<>
					{/* Show projects as cards so I can use infinite scroll */}
					<div className="grid lg:grid-cols-4 gap-2">
						{projects?.map((project) => (
							<ProjectViewCard key={project.id} project={project} />
						))}
					</div>
					<div ref={loadMoreRef} />
					{isFetchingNextPage && <div className="text-center py-4">Loading more...</div>}
					{!hasNextPage && <div className="text-center py-4 text-muted-foreground">End of projects.</div>}
				</>
			)}


		</div>
	);
};

export default ProjectsTable;
