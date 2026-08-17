"use client"

import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-border/50 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="max-w-md">
                        <div className="flex items-center space-x-2.5 mb-4">
                            <img src="/us-map-icon.svg" alt="US Map" className="nav-logo" />
                            <h3 className="text-lg font-semibold tracking-tight">MapKit</h3>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            A high-quality, interactive US map component built specifically for React and Next.js applications.
                            Featuring accurate state boundaries and smooth interactions.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button variant="outline" size="sm" asChild>
                            <a href="https://github.com/xi-Rick" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <Github className="w-4 h-4" />
                                GitHub
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        &copy; 2026 MapKit by <a href="https://github.com/xi-Rick" target="_blank" rel="noopener noreferrer" className="hover:underline">Dana</a>. Built with Next.js and Tailwind CSS.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4 md:mt-0">
                        Made with care for the React community
                    </p>
                </div>
            </div>
        </footer>
    )
}
