// table-style card that will show overview of project information

import { Calendar1Icon, DollarSignIcon, EditIcon, EyeIcon, FileTextIcon, MoreVerticalIcon, Trash2Icon, UsersIcon } from "lucide-react";
import type { Project } from "../../types/projects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { format } from "date-fns";
import { useNavigate } from "react-router";

const ProjectViewCard = ({ project }: { project: Project; }) => {
    const navigate = useNavigate();
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

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg font-bold uppercase flex justify-between">
                    <span className="cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>{project.title}</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View Project
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <EditIcon className="h-4 w-4 mr-2" />
                                Edit Project
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-destructive"
                                    >
                                        <Trash2Icon className="mr-2 h-4 w-4" />
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
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardTitle>
                <CardDescription>
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(project.status as string)}>{project.status}</Badge>
                        <Badge variant={getPaymentStatusBadgeVariant(project.paymentStatus as string)}>
                            {project.paymentStatus}
                        </Badge>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-2">
                    <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{project.description || 'No description provided'}</span>
                </div>
                <div className="flex items-center gap-4">
                    <UsersIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        {project.clientCount || 0} {project.clientCount === 1 ? 'client' : 'clients'}
                    </span>
                </div>
                <div className="flex justify-between items-center gap-4 mt-4">
                    <div className="font-semibold flex items-center gap-1">
                        <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                        {project?.amount > 0 ? formatAmount(project.amount) : 'No budget set'}
                    </div>

                    {project.dueDate ? (
                        <div className="flex items-center gap-1">
                            <Calendar1Icon className="h-4 w-4 text-muted-foreground" />
                            <span className={project.dueDate < new Date() ? 'text-destructive' : ''}>
                                {format(project.dueDate, 'MMM dd, yyyy')}
                            </span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">No due date</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
export default ProjectViewCard;