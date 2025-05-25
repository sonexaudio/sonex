import type {  FC, InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {

}

const Input: FC<InputProps> = ({className, ...props}) => {
  return (
    <input {...props} className={cn("w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-main", className)} />
  )
}

export default Input