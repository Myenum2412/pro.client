"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import {
    Search,
    Send,
    Folder,
    FileText,
    DollarSign,
    AlertCircle,
    HelpCircle,
    Loader2,
} from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";

interface SearchAction {
    id: string;
    label: string;
    icon: string;
    description?: string;
    short?: string;
    end?: string;
    url?: string;
    type?: string;
}

interface SearchResult {
    actions: SearchAction[];
}

const ANIMATION_VARIANTS = {
    container: {
        hidden: { opacity: 0, height: 0 },
        show: {
            opacity: 1,
            height: "auto",
            transition: {
                height: { duration: 0.4 },
                staggerChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            height: 0,
            transition: {
                height: { duration: 0.3 },
                opacity: { duration: 0.2 },
            },
        },
    },
    item: {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: { duration: 0.2 },
        },
    },
} as const;

function getIcon(iconName: string) {
    const icons: Record<string, React.ReactNode> = {
        folder: <Folder className="h-4 w-4 text-blue-500" />,
        "file-text": <FileText className="h-4 w-4 text-purple-500" />,
        "dollar-sign": <DollarSign className="h-4 w-4 text-green-500" />,
        send: <Send className="h-4 w-4 text-orange-500" />,
        "alert-circle": <AlertCircle className="h-4 w-4 text-red-500" />,
        "help-circle": <HelpCircle className="h-4 w-4 text-yellow-500" />,
    };
    return icons[iconName] || <Search className="h-4 w-4 text-gray-500" />;
}

export function RealtimeSearchBar({ defaultOpen = false }: { defaultOpen?: boolean }) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<SearchResult | null>(null);
    const [isFocused, setIsFocused] = useState(defaultOpen);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const debouncedQuery = useDebounce(query, 300);

    // Fetch real-time search results
    useEffect(() => {
        if (!isFocused) {
            setResult(null);
            setActiveIndex(-1);
            return;
        }

        if (!debouncedQuery || debouncedQuery.trim().length === 0) {
            setResult({ actions: [] });
            setIsLoading(false);
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                const data = await response.json();
                
                if (data.results) {
                    setResult({ actions: data.results });
                } else {
                    setResult({ actions: [] });
                }
            } catch {
                setResult({ actions: [] });
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery, isFocused]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
        },
        []
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!result?.actions.length) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setActiveIndex((prev) =>
                        prev < result.actions.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setActiveIndex((prev) =>
                        prev > 0 ? prev - 1 : result.actions.length - 1
                    );
                    break;
                case "Enter":
                    e.preventDefault();
                    if (activeIndex >= 0 && result.actions[activeIndex]) {
                        handleActionClick(result.actions[activeIndex]);
                    }
                    break;
                case "Escape":
                    setIsFocused(false);
                    setActiveIndex(-1);
                    break;
            }
        },
        [result?.actions, activeIndex]
    );

    const handleActionClick = useCallback((action: SearchAction) => {
        if (action.url) {
            router.push(action.url);
        }
    }, [router]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        setActiveIndex(-1);
    }, []);

    const handleBlur = useCallback(() => {
        setTimeout(() => {
            setIsFocused(false);
            setActiveIndex(-1);
        }, 200);
    }, []);

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="relative flex flex-col justify-start items-center min-h-[300px]">
                <div className="w-full max-w-sm sticky top-0 bg-background z-10 pt-4 pb-1">
                    <label
                        className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block"
                        htmlFor="search"
                    >
                        Search Everything
                    </label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search projects, drawings, billing..."
                            value={query}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            role="combobox"
                            aria-expanded={isFocused && !!result}
                            aria-autocomplete="list"
                            aria-activedescendant={
                                activeIndex >= 0
                                    ? `action-${result?.actions[activeIndex]?.id}`
                                    : undefined
                            }
                            id="search"
                            autoComplete="off"
                            className="pl-3 pr-9 py-1.5 h-9 text-sm rounded-lg focus-visible:ring-offset-0"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Loader2 className="w-4 h-4 text-gray-400 dark:text-gray-500 animate-spin" />
                                    </motion.div>
                                ) : query.length > 0 ? (
                                    <motion.div
                                        key="send"
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Send className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="search"
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-sm">
                    <AnimatePresence>
                        {isFocused && result && (
                            <motion.div
                                className="w-full border rounded-md shadow-xs overflow-hidden dark:border-gray-800 bg-white dark:bg-black mt-1"
                                variants={ANIMATION_VARIANTS.container}
                                role="listbox"
                                aria-label="Search results"
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                {result.actions.length > 0 ? (
                                    <>
                                        <motion.ul role="none">
                                            {result.actions.map((action) => (
                                                <motion.li
                                                    key={action.id}
                                                    id={`action-${action.id}`}
                                                    className={`px-3 py-2 flex items-center justify-between hover:bg-gray-200 dark:hover:bg-zinc-900 cursor-pointer rounded-md ${
                                                        activeIndex ===
                                                        result.actions.indexOf(action)
                                                            ? "bg-gray-100 dark:bg-zinc-800"
                                                            : ""
                                                    }`}
                                                    variants={ANIMATION_VARIANTS.item}
                                                    layout
                                                    onClick={() =>
                                                        handleActionClick(action)
                                                    }
                                                    role="option"
                                                    aria-selected={
                                                        activeIndex ===
                                                        result.actions.indexOf(action)
                                                    }
                                                >
                                                    <div className="flex items-center gap-2 justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="text-gray-500"
                                                                aria-hidden="true"
                                                            >
                                                                {getIcon(action.icon)}
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {action.label}
                                                            </span>
                                                            {action.description && (
                                                                <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                                                    {action.description}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {action.short && (
                                                            <span
                                                                className="text-xs text-gray-400"
                                                                aria-label={`Status: ${action.short}`}
                                                            >
                                                                {action.short}
                                                            </span>
                                                        )}
                                                        {action.end && (
                                                            <span className="text-xs text-gray-400 text-right">
                                                                {action.end}
                                                            </span>
                                                        )}
                                                    </div>
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                        <div className="mt-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>Press ⌘K to open search</span>
                                                <span>ESC to cancel</span>
                                            </div>
                                        </div>
                                    </>
                                ) : query.trim().length > 0 && !isLoading ? (
                                    <div className="px-3 py-8 text-center">
                                        <p className="text-sm text-gray-500">No results found</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Try searching for projects, drawings, or billing
                                        </p>
                                    </div>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

