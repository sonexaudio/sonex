import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { CreditCard, DoorOpenIcon, Folder, PlusIcon, User } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "./ui/dialog";

const DashboardLayout = () => {
	const { user, loading, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const pathSegments = location.pathname.split("/").filter(Boolean);
	console.log(pathSegments);

	if (loading) return <p>Loading...</p>;

	return (
		<>
			<div className="min-h-screen flex flex-col">
				{/* Topbar */}
				<header className="w-full border-b px-4 py-3 flex justify-between items-center bg-background">
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

					{/* Avatar + Logout && New Prompt */}
					<div className="flex gap-2 items-center">
						{user && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Avatar>
										<AvatarImage src={user?.avatarUrl as string} />
										<AvatarFallback>{user.firstName[0]}</AvatarFallback>
									</Avatar>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuLabel className="flex flex-col">
										<span>{user.firstName} {user.lastName}</span>
										<span className="text-xs text-muted-foreground">{user.email}</span>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Button variant="ghost" size="lg" className="w-full" onClick={logout}>
											<DoorOpenIcon className="size-4" />
											Logout
										</Button>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

						)}

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
			</div >
		</>
	);
};
export default DashboardLayout;
