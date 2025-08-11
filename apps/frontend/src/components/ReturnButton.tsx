import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { ArrowLeftIcon } from "lucide-react";

const ReturnButton = ({ href, label }: { href: string, label: string; }) => {
    const navigate = useNavigate();
    return (
        <Button variant="secondary" onClick={() => navigate(href)}><ArrowLeftIcon /> {label}</Button>
    );
};
export default ReturnButton;