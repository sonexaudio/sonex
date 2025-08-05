import { useState } from "react";
import { Mail, MoreHorizontal, Trash2, User } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { useClients, type Client } from "../../../hooks/useClients";
import { formatDistanceToNow } from "date-fns";

interface ClientsTableProps {
    clients: Client[];
}

const ClientsTable = ({ clients }: ClientsTableProps) => {
    const { deleteClient } = useClients();

    const handleDeleteClient = async (clientId: string) => {
        await deleteClient({ id: clientId });
    };

    if (clients.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
                    <p className="text-muted-foreground text-center max-w-sm">
                        Start by adding your first client to begin collaborating on projects.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Clients</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {clients.map((client) => (
                        <div
                            key={client.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{client.name}</h3>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        <span>{client.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Badge variant="secondary">
                                    Added {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => handleDeleteClient(client.id)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove Client
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ClientsTable; 