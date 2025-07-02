import { useState, type FormEvent } from "react";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Clock, Send } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface CommentFormProps {
    onSubmit: (content: string, isRevision: boolean, audioTimestamp?: number) => void;
    getCurrentTime?: () => number;
    placeholder?: string;
    buttonText?: string;
    compact?: boolean;
};

const CommentForm: React.FC<CommentFormProps> = ({
    onSubmit,
    getCurrentTime,
    placeholder = "Add a comment",
    buttonText = "Post Comment",
    compact = false
}) => {
    const [content, setContent] = useState("");
    const [isRevision, setIsRevision] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const audioTimeStamp = isRevision && getCurrentTime ? getCurrentTime() : undefined;
        onSubmit(content, isRevision, audioTimeStamp);
        setContent("");
        setIsRevision(false);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <form onSubmit={handleSubmit} className={`${compact ? "space-y-2" : "space-y-4"}`}>
            <div className="flex gap-x-3">
                <div className={`${compact ? "size-6" : "size-8"} bg-gradient-to-br from-bg-primary to-bg-primary-50 rounded-full flex items-center justify-center shrink-0`}>
                    <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-white`}>IV</span>
                </div>
                <div className="flex-1">
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={placeholder} rows={compact ? 2 : 3} />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                    <Label htmlFor="revision" className="flex items-center gap-x-2 cursor-pointer">
                        <Checkbox checked={isRevision} onChange={(e) => setIsRevision(!isRevision)} />

                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="size-4" />
                            <span>This is a revision</span>
                        </span>
                    </Label>

                    {isRevision && getCurrentTime && (
                        <Badge>&commat; {formatTime(getCurrentTime())}</Badge>
                    )}
                </div>

                <Button type="submit" disabled={!content.trim() || content.length <= 5}>
                    <Send className={compact ? "size-3" : "size-4"} />
                    <span>{buttonText}</span>
                </Button>
            </div>
        </form>
    );
};

export default CommentForm;