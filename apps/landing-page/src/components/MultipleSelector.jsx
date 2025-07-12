"use client";

import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { X } from "lucide-react";
import React, {
	forwardRef,
	useRef,
	useState,
	useEffect,
	useImperativeHandle,
	useMemo,
	useCallback,
} from "react";

import { Badge } from "./ui/badge";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { cn } from "@/lib/utils";

// Utility Hooks
export function useDebounce(value, delay = 500) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debouncedValue;
}

// Helper Functions
function transToGroupOption(options, groupBy) {
	if (options.length === 0) return {};
	if (!groupBy) return { "": options };

	const groupOption = {};
	options.forEach((option) => {
		const key = option[groupBy] || "";
		if (!groupOption[key]) groupOption[key] = [];
		groupOption[key].push(option);
	});

	return groupOption;
}

function removePickedOption(groupOption, picked) {
	const cloneOption = JSON.parse(JSON.stringify(groupOption));
	for (const [key, value] of Object.entries(cloneOption)) {
		cloneOption[key] = value.filter(
			(val) => !picked.find((p) => p.value === val.value),
		);
	}
	return cloneOption;
}

function isOptionsExist(groupOption, targetOption) {
	for (const value of Object.values(groupOption)) {
		if (
			value.some((option) => targetOption.find((p) => p.value === option.value))
		) {
			return true;
		}
	}
	return false;
}

// Workaround Empty Component
const CommandEmpty = forwardRef(({ className, ...props }, ref) => {
	const render = useCommandState((state) => state.filtered.count === 0);
	if (!render) return null;

	return (
		<div
			ref={ref}
			className={cn("py-6 text-center text-sm", className)}
			cmdk-empty=""
			role="presentation"
			{...props}
		/>
	);
});

CommandEmpty.displayName = "CommandEmpty";

const MultipleSelector = forwardRef((props, ref) => {
	const {
		value,
		onChange,
		placeholder,
		defaultOptions = [],
		options: arrayOptions,
		delay,
		onSearch,
		onSearchSync,
		loadingIndicator,
		emptyIndicator,
		maxSelected = Number.MAX_SAFE_INTEGER,
		onMaxSelected,
		hidePlaceholderWhenSelected,
		disabled,
		groupBy,
		className,
		badgeClassName,
		selectFirstItem = true,
		creatable = false,
		triggerSearchOnFocus = false,
		commandProps,
		inputProps,
		hideClearAllButton = false,
	} = props;

	const inputRef = useRef(null);
	const dropdownRef = useRef(null);

	const [open, setOpen] = useState(false);
	const [onScrollbar, setOnScrollbar] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [selected, setSelected] = useState(value || []);
	const [options, setOptions] = useState(
		transToGroupOption(defaultOptions, groupBy),
	);
	const [inputValue, setInputValue] = useState("");
	const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

	useImperativeHandle(
		ref,
		() => ({
			selectedValue: [...selected],
			input: inputRef.current,
			focus: () => inputRef.current?.focus(),
			reset: () => setSelected([]),
		}),
		[selected],
	);

	const handleClickOutside = (event) => {
		if (
			dropdownRef.current &&
			!dropdownRef.current.contains(event.target) &&
			inputRef.current &&
			!inputRef.current.contains(event.target)
		) {
			setOpen(false);
			inputRef.current.blur();
		}
	};

	const handleUnselect = useCallback(
		(option) => {
			const newOptions = selected.filter((s) => s.value !== option.value);
			setSelected(newOptions);
			onChange?.(newOptions);
		},
		[selected, onChange],
	);

	const handleKeyDown = useCallback(
		(e) => {
			if (!inputRef.current) return;
			if (["Delete", "Backspace"].includes(e.key)) {
				if (inputRef.current.value === "" && selected.length > 0) {
					const last = selected[selected.length - 1];
					if (last && !last.fixed) handleUnselect(last);
				}
			}
			if (e.key === "Escape") inputRef.current.blur();
		},
		[selected, handleUnselect],
	);

	useEffect(() => {
		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("touchend", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchend", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchend", handleClickOutside);
		};
	}, [open]);

	useEffect(() => {
		if (value) setSelected(value);
	}, [value]);

	useEffect(() => {
		if (!arrayOptions || onSearch) return;
		const newOption = transToGroupOption(arrayOptions || [], groupBy);
		if (JSON.stringify(newOption) !== JSON.stringify(options)) {
			setOptions(newOption);
		}
	}, [arrayOptions, groupBy, onSearch]);

	useEffect(() => {
		if (!onSearchSync || !open) return;

		const exec = () => {
			if (triggerSearchOnFocus || debouncedSearchTerm) {
				const result = onSearchSync(debouncedSearchTerm);
				setOptions(transToGroupOption(result || [], groupBy));
			}
		};

		exec();
	}, [debouncedSearchTerm, open]);

	useEffect(() => {
		if (!onSearch || !open) return;

		const doSearch = async () => {
			setIsLoading(true);
			const result = await onSearch(debouncedSearchTerm);
			setOptions(transToGroupOption(result || [], groupBy));
			setIsLoading(false);
		};

		if (triggerSearchOnFocus || debouncedSearchTerm) {
			doSearch();
		}
	}, [debouncedSearchTerm, open]);

	const CreatableItem = () => {
		if (!creatable) return null;

		const exists =
			isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
			selected.find((s) => s.value === inputValue);

		if (exists) return null;

		const item = (
			<CommandItem
				value={inputValue}
				className="cursor-pointer"
				onMouseDown={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
				onSelect={(val) => {
					if (selected.length >= maxSelected) {
						onMaxSelected?.(selected.length);
						return;
					}
					setInputValue("");
					const newOptions = [...selected, { value: val, label: val }];
					setSelected(newOptions);
					onChange?.(newOptions);
				}}
			>
				{`Create "${inputValue}"`}
			</CommandItem>
		);

		if (!onSearch && inputValue.length > 0) return item;
		if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) return item;
		return null;
	};

	const EmptyItem = useCallback(() => {
		if (!emptyIndicator) return null;

		if (onSearch && !creatable && Object.keys(options).length === 0) {
			return (
				<CommandItem value="-" disabled>
					{emptyIndicator}
				</CommandItem>
			);
		}

		return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
	}, [creatable, emptyIndicator, onSearch, options]);

	const selectables = useMemo(
		() => removePickedOption(options, selected),
		[options, selected],
	);

	const commandFilter = useCallback(() => {
		if (commandProps?.filter) return commandProps.filter;

		if (creatable) {
			return (value, search) =>
				value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
		}

		return undefined;
	}, [creatable, commandProps]);

	return (
		<Command
			ref={dropdownRef}
			{...commandProps}
			onKeyDown={(e) => {
				handleKeyDown(e);
				commandProps?.onKeyDown?.(e);
			}}
			className={cn(
				"h-auto overflow-visible bg-transparent",
				commandProps?.className,
			)}
			shouldFilter={
				commandProps?.shouldFilter !== undefined
					? commandProps.shouldFilter
					: !onSearch
			}
			filter={commandFilter()}
		>
			<div
				className={cn(
					"min-h-10 rounded-md border border-input text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:text-sm",
					{
						"px-3 py-2": selected.length !== 0,
						"cursor-text": !disabled && selected.length !== 0,
					},
					className,
				)}
				onClick={() => {
					if (disabled) return;
					inputRef?.current?.focus();
				}}
			>
				<div className="relative flex flex-wrap gap-1">
					{selected.map((option) => {
						return (
							<Badge
								key={option.value}
								className={cn(
									"data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground",
									"data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
									badgeClassName,
								)}
								data-fixed={option.fixed}
								data-disabled={disabled || undefined}
							>
								{option.label}
								<button
									type="button"
									className={cn(
										"ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
										(disabled || option.fixed) && "hidden",
									)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleUnselect(option);
										}
									}}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									onClick={() => handleUnselect(option)}
								>
									<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
								</button>
							</Badge>
						);
					})}
					{/* Avoid having the "Search" Icon */}
					<CommandPrimitive.Input
						{...inputProps}
						ref={inputRef}
						value={inputValue}
						disabled={disabled}
						onValueChange={(value) => {
							setInputValue(value);
							inputProps?.onValueChange?.(value);
						}}
						onBlur={(event) => {
							if (!onScrollbar) {
								setOpen(false);
							}
							inputProps?.onBlur?.(event);
						}}
						onFocus={(event) => {
							setOpen(true);
							inputProps?.onFocus?.(event);
						}}
						placeholder={
							hidePlaceholderWhenSelected && selected.length !== 0
								? ""
								: placeholder
						}
						className={cn(
							"flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
							{
								"w-full": hidePlaceholderWhenSelected,
								"px-3 py-2": selected.length === 0,
								"ml-1": selected.length !== 0,
							},
							inputProps?.className,
						)}
					/>
					<button
						type="button"
						onClick={() => {
							setSelected(selected.filter((s) => s.fixed));
							onChange?.(selected.filter((s) => s.fixed));
						}}
						className={cn(
							"absolute ltr:right-0 rtl:left-0 h-6 w-6 p-0",
							(hideClearAllButton ||
								disabled ||
								selected.length < 1 ||
								selected.filter((s) => s.fixed).length === selected.length) &&
								"hidden",
						)}
					>
						<X />
					</button>
				</div>
			</div>
			<div className="relative">
				{open && (
					<CommandList
						className="absolute top-1 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in"
						onMouseLeave={() => {
							setOnScrollbar(false);
						}}
						onMouseEnter={() => {
							setOnScrollbar(true);
						}}
						onMouseUp={() => {
							inputRef?.current?.focus();
						}}
					>
						{isLoading ? (
							<>{loadingIndicator}</>
						) : (
							<>
								{EmptyItem()}
								{CreatableItem()}
								{!selectFirstItem && (
									<CommandItem value="-" className="hidden" />
								)}
								{Object.entries(selectables).map(([key, dropdowns]) => (
									<CommandGroup
										key={key}
										heading={key}
										className="h-full overflow-auto"
									>
										{dropdowns.map((option) => {
											return (
												<CommandItem
													key={option.value}
													value={option.label}
													disabled={option.disable}
													onMouseDown={(e) => {
														e.preventDefault();
														e.stopPropagation();
													}}
													onSelect={() => {
														if (selected.length >= maxSelected) {
															onMaxSelected?.(selected.length);
															return;
														}
														setInputValue("");
														const newOptions = [...selected, option];
														setSelected(newOptions);
														onChange?.(newOptions);
													}}
													className={cn(
														"cursor-pointer",
														option.disable &&
															"cursor-default text-muted-foreground",
													)}
												>
													{option.label}
												</CommandItem>
											);
										})}
									</CommandGroup>
								))}
							</>
						)}
					</CommandList>
				)}
			</div>
		</Command>
	);
});

MultipleSelector.displayName = "MultipleSelector";
export default MultipleSelector;
