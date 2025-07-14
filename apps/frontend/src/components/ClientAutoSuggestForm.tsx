import type React from "react";
import { useClients, type Client } from "../hooks/useClients";
import { useEffect, useRef, useState } from "react";
import { Check, Mail, Plus, Search, User, X } from "lucide-react";
import { Button } from "./ui/button";
import clsx from "clsx";
import { Input } from "./ui/input";

interface ClientAutoSuggestProps {
    existingProjectClients: string[];
    onAddExistingClient: (client: Client) => void;
    onAddNewClient: (email: string) => void;
    placeholder?: string;
    className?: string;
}

const ClientAutoSuggestForm: React.FC<ClientAutoSuggestProps> = ({
    existingProjectClients,
    onAddExistingClient,
    onAddNewClient,
    placeholder = "Enter client name or email address...",
    className = "",
}) => {
    const { clients, loading } = useClients();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                !inputRef.current?.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredClients = clients.filter(client => {
        const matches = (
            client.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            client.email.toLowerCase().includes(inputValue.toLowerCase())
        );
        const notInProject = !existingProjectClients.includes(client.id);

        return matches && notInProject && inputValue.length > 0;
    });

    const exactMatch = clients.find(client =>
        client.email.toLowerCase() === inputValue.toLowerCase() &&
        !existingProjectClients.includes(client.id)
    );

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue);
    const showAddNewOption = inputValue && isValidEmail && !exactMatch;

    const handleSelectClient = (client: Client) => {
        console.log("Client", client);
        console.log("CLIENT EXISTS IN PROJECT?", existingProjectClients.includes(client.id));
        if (existingProjectClients.includes(client.id)) return;
        onAddExistingClient(client);
        setInputValue('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setIsOpen(value.length > 0);
        setHighlightedIndex(-1);
    };

    const handleInputFocus = () => {
        if (inputValue.length > 0) {
            setIsOpen(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        const totalOptions = filteredClients.length + (showAddNewOption ? 1 : 0);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < totalOptions - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : totalOptions - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    if (highlightedIndex < filteredClients.length) {
                        handleSelectClient(filteredClients[highlightedIndex]);
                    } else if (showAddNewOption) {
                        handleAddNewClient();
                    }
                } else if (exactMatch) {
                    handleSelectClient(exactMatch);
                } else if (showAddNewOption) {
                    handleAddNewClient();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const handleAddNewClient = () => {
        onAddNewClient(inputValue); // passes email up to ClientAccessTab
        setInputValue('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleClearInput = () => {
        setInputValue('');
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className={clsx("relative", className)}>
            {/* Input field */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
                {inputValue && (
                    <button
                        type="button"
                        onClick={handleClearInput}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (filteredClients.length > 0 || showAddNewOption) && (
                <div
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-h-fit max-h-60 overflow-y-auto" ref={dropdownRef}
                >

                    {/* existing clients */}
                    {filteredClients.map((client) => (
                        <Button
                            variant="ghost"
                            key={client.id}
                            onClick={() => handleSelectClient(client)}
                            className="w-full justify-start px-4 py-8"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-semibold text-white">
                                        {client.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {client.name}
                                        </p>
                                        <Check className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{client.email}</span>
                                    </div>

                                </div>
                            </div>
                        </Button>
                    ))}

                    {/* add new client option */}
                    {showAddNewOption && (
                        <Button
                            variant="ghost"
                            onClick={handleAddNewClient}
                            className="w-full justify-start p-6"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Plus className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        Add new client
                                    </p>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{inputValue}</span>
                                    </div>
                                </div>
                            </div>
                        </Button>
                    )}

                    {/* no results */}
                    {filteredClients.length === 0 && !showAddNewOption && (
                        <div className="px-4 py-6 text-center">
                            <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                                {inputValue.length > 0
                                    ? 'No clients found matching your search'
                                    : 'Start typing to search for clients'
                                }
                            </p>
                            {inputValue.length > 0 && !isValidEmail && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Enter a valid email to add a new client
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
            {/* Helper Text */}
            {!isOpen && inputValue.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                    Type to search existing clients or enter an email to add a new one
                </p>
            )}

        </div>
    );
};

export default ClientAutoSuggestForm;
