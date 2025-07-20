import { CreditCardIcon, HardDriveIcon, ReceiptIcon, Settings2Icon, UserIcon } from "lucide-react";
import { useIsMobile } from "../../../hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Button } from "../../../components/ui/button";

const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "subscription", label: "Subscription", icon: CreditCardIcon },
    { id: "storage", label: "Storage", icon: HardDriveIcon },
    { id: "billing", label: "Billing", icon: ReceiptIcon },
    { id: "account", label: "Account", icon: Settings2Icon },
];

const SettingsTabs = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void; }) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Tabs defaultValue="profile" value={activeTab} onValueChange={onTabChange} className="w-full">
                <ScrollArea className="w-full">
                    <TabsList className="w-full justify-start">
                        {tabs.map(tab => (
                            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                                <tab.icon className="size-4" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </ScrollArea>
            </Tabs>
        );
    }

    return (
        <div className="md:w-1/4 lg:w-1/5">
            <div className="sticky top-6 space-y-1">
                {tabs.map(tab => (
                    <Button key={tab.id} onClick={() => onTabChange(tab.id)} variant="ghost" className={`w-full transition-colors rounded ${activeTab === tab.id ? "bg-primary text-primary-foreground" : ""}`}>
                        <tab.icon className="size-4" />
                        {tab.label}
                    </Button>
                ))}
            </div>
        </div>
    );

};
export default SettingsTabs;