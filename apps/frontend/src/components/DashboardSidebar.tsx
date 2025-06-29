import { CreditCard, Files, FolderOpen, LayoutDashboard, MessageSquare, Settings, Users } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Button } from "./ui/button";
import UserProfileDropdown from "./UserProfileDropdown";
import { currentVersion } from "../utils/version";
import { useNavigate } from "react-router";

const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: "overview" },
    { id: 'projects', label: 'Projects', icon: FolderOpen, path: "projects" },
    { id: 'clients', label: 'Clients', icon: Users, path: "clients" },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: "messages" },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: "payments" },
    { id: 'files', label: 'Files', icon: Files, path: "files" },
    { id: 'settings', label: 'Settings', icon: Settings, path: "settings" },
];

const DashboardSidebar = () => {
    const navigate = useNavigate();
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenuButton className="cursor-pointer" onClick={() => navigate("/overview")}>
                    <span className="font-bold text-lg">SONEX</span>
                    <p className="text-xs text-gray-400">Audio Solutions</p>
                    <span className="text-xs text-muted-foreground">v{currentVersion}</span>
                </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                    <SidebarMenu className="flex-1">
                        {navigationItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <SidebarMenuItem key={item.id} className="w-full">
                                    <Button variant="ghost" className="text-left justify-start w-full" onClick={() => navigate(`/${item.path}`)}>
                                        <Icon className="size-5 transition-transform" />
                                        <span>{item.label}</span>
                                    </Button>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>

            </SidebarContent>
            <SidebarFooter>
                <UserProfileDropdown />
            </SidebarFooter>
        </Sidebar>
    );
};

export default DashboardSidebar;