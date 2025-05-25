import type {ButtonHTMLAttributes, ReactNode} from "react"
import { cn } from "../../utils/cn";
import {cva, type VariantProps} from "class-variance-authority"
import {clsx} from "clsx"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    children: ReactNode;    
}

// variants
// default, danger, secondary, outline

const buttonVariants = cva(["cursor-pointer",], {
    variants: {
        variant: {
            default: "bg-main text-foreground hover:bg-main/90 disabled:bg-main/60",
            secondary: "bg-accent-primary text-background hover:bg-accent-primary/90",
            outline: "bg-transparent border-2 border-background text-foreground",
            danger: "bg-red-600 text-white hover:bg-red-500"
        }
    },
    defaultVariants: {
        variant: "default",
    }
})

const Button = ({children, className, variant, ...props}: ButtonProps) => {
  return (
    <button {...props} className={cn("w-full rounded-md px-4 py-2 text-sm font-title font-bold transition-all duration-200", clsx(buttonVariants({variant, className})))}>{children}</button>
  )
}

export default Button