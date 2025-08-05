import { CreditCard, Files, FolderOpen, LayoutDashboard, MessageSquare, Settings, Users, Rocket } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import UserProfileDropdown from "./UserProfileDropdown";
import { currentVersion } from "../utils/version";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

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
    const { user } = useAuth();
    const { open } = useSidebar();
    const [triggered, setTriggered] = useState(false);

    const handleOnboardingTrigger = () => {
        localStorage.setItem("promptForOnboarding", "true");
        setTriggered(true);
        window.location.reload(); // Ensures ProtectedRoute picks up the change
    };

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
            {open && (
                <SidebarFooter>
                    {/* Onboarding trigger button, only if user needs onboarding */}
                    {user && !user.isOnboarded && (
                        <Button
                            variant="secondary"
                            className="w-full mb-2 flex items-center justify-center"
                            onClick={handleOnboardingTrigger}
                            disabled={triggered}
                        >
                            <Rocket className="mr-2 size-4" />
                            Setup Sonex
                        </Button>
                    )}

                    <UserProfileDropdown />
                </SidebarFooter>
            )}

        </Sidebar>
    );
};

export default DashboardSidebar;