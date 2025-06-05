import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

type DraggableItemProps = {
    id: string;
    children: ReactNode;
    itemType: "file" | "folder";
};

const DraggableItem = ({ id, itemType, children }: DraggableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data: { type: itemType } });

    const style = {
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 w-full group mb-2"
            {...attributes}
            onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                listeners?.onPointerDown?.(e);
            }}
            onTouchStart={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                listeners?.onTouchStart?.(e);
            }}
        >
            {children}
        </div >
    );
};

export default DraggableItem;