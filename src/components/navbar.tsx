"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Info, Github, Twitter, Menu, X, ExternalLink, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="border-b border-zinc-800/50 backdrop-blur-md bg-zinc-950/80 sticky top-0 z-50">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo and Title */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                            <Database className="h-5 w-5 text-zinc-100 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h1 className="font-semibold text-zinc-100 group-hover:text-white transition-colors">ORM Test</h1>
                            <p className="text-xs text-zinc-500 hidden sm:block">Prisma 7.1.0 vs Drizzle 0.45.0</p>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-3">
                    {pathname === "/about" ? (
                        <Link href="/">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-zinc-400 hover:text-zinc-100"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Tests
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/about">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-zinc-400 hover:text-zinc-100"
                            >
                                <Info className="h-4 w-4 mr-2" />
                                About
                            </Button>
                        </Link>
                    )}

                    <Badge variant="outline" className="bg-zinc-900/50 border-zinc-800 text-zinc-400">
                        Neon PostgreSQL
                    </Badge>

                    <div className="w-px h-4 bg-zinc-800 mx-1" />

                    <a
                        href="https://x.com/cyberboyayush"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                        aria-label="Twitter/X"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                    <a
                        href="https://github.com/CyberBoyAyush/orm-test"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                        aria-label="GitHub"
                    >
                        <Github className="h-5 w-5" />
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl animate-in slide-in-from-top-2">
                    <div className="container mx-auto px-6 py-4 space-y-4">
                        {pathname !== "/about" ? (
                            <Link
                                href="/about"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-200"
                            >
                                <Info className="h-5 w-5" />
                                <span>About Project</span>
                            </Link>
                        ) : (
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-200"
                            >
                                <Database className="h-5 w-5" />
                                <span>Back to Tests</span>
                            </Link>
                        )}

                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 border border-zinc-900">
                            <span className="text-zinc-400 text-sm">Database Provider</span>
                            <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-300">
                                Neon PostgreSQL
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <a
                                href="https://x.com/cyberboyayush"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <span>Twitter</span>
                            </a>
                            <a
                                href="https://github.com/CyberBoyAyush/orm-test"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                            >
                                <Github className="h-5 w-5" />
                                <span>GitHub</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
