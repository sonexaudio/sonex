import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { CreditCard, DoorOpenIcon, Folder, PlusIcon, User } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import { Separator } from "./ui/separator";


const DashboardLayout = () => {
	const { user, loading, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const pathSegments = location.pathname.split("/").filter(Boolean);
	console.log(pathSegments);

	if (loading) return <p>Loading...</p>;

	return (
		<SidebarProvider>
			{/* Sidebar */}
			<DashboardSidebar />

			<SidebarInset>
				<div className="min-h-screen flex flex-col">
					{/* Topbar */}
					<header className="w-full border-b px-4 py-3 flex justify-between items-center bg-background">
						<div className="flex items-center">
							{/* Sidebar Trigger */}
							<SidebarTrigger className="ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 data-[orientation=vertical]:h-4"
							/>
							{/* Breadcrumbs */}
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink href="/overview">Dashboard</BreadcrumbLink>
									</BreadcrumbItem>

									{pathSegments.map((segment, idx) => {
										const isLast = idx === pathSegments.length - 1;
										const href = `/${pathSegments.slice(0, idx + 1).join("/")}`;
										const label = segment.charAt(0).toUpperCase() + segment.slice(1);

										return (
											<>
												<BreadcrumbSeparator key={`sep-${idx}`} />
												<BreadcrumbItem key={segment}>
													{isLast ? (
														<BreadcrumbPage>{label}</BreadcrumbPage>
													) : (
														<BreadcrumbLink href={href}>
															{label}
														</BreadcrumbLink>
													)}

												</BreadcrumbItem >
											</>
										);
									})}
								</BreadcrumbList>
							</Breadcrumb>
						</div>

						{/* Avatar + Logout && New Prompt */}
						<div className="flex gap-2 items-center">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline">
										<PlusIcon />
										New
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem asChild className="w-full">
										<Button variant="ghost">
											<Folder className="size-4" />
											Project
										</Button>
									</DropdownMenuItem>
									<DropdownMenuItem asChild className="w-full">
										<Button variant="ghost">
											<User className="size-4" />
											Client
										</Button>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Button variant="ghost">
											<CreditCard className="size-4" />
											Payment
										</Button>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</header>
					<Outlet />
				</div>
			</SidebarInset>

		</SidebarProvider>
	);
};
export default DashboardLayout;
