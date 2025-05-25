import type { FC, OptionHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface RootProps extends SelectHTMLAttributes<HTMLSelectElement> {
    children: ReactNode;
}

interface OptionProps extends OptionHTMLAttributes<HTMLOptionElement> {
    children?: ReactNode;
    label?: string;
}


const SelectRoot: FC<RootProps> = ({children, className, ...props}) => {
  return (
    <select {...props} className={cn("w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-main", className)}>
        {children}
    </select>
  )
}

const Option: FC<OptionProps> = ({children, label, ...props}) => {
    return (
        <option className={cn("w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-main")} {...props}>
            {label || children}
        </option>
    )
}

export const Select = Object.assign(SelectRoot, {Option});