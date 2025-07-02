import { useAuth } from "../hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ArrowRight, DoorOpenIcon } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";

const UserProfileDropdown = () => {
    const { user, logout, loading } = useAuth();
    if (!user) return null;
    if (loading) return <p>Loading...</p>;

    return (


        <Card className="gap-2 py-4 shadow-none">
            <CardHeader>
                <CardTitle>
                    <div className="text-sm flex items-center gap-2">
                        <Avatar>
                            <AvatarImage src={user?.avatarUrl as string} />
                            <AvatarFallback>{user.firstName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span>{user?.firstName} {user?.lastName}</span>
                            <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardFooter>
                <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                    <DoorOpenIcon />
                    Logout
                    <ArrowRight />
                </Button>
            </CardFooter>
        </Card>

    );
};

export default UserProfileDropdown;
