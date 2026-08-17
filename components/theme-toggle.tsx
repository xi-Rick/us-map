"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className="w-9 h-9 px-0">
                <div className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 px-0 relative overflow-hidden hover:bg-accent/80"
        >
            <div className="relative h-[1.2rem] w-[1.2rem] z-10">
                <Sun
                    className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ease-in-out text-foreground ${
                        theme === "dark"
                            ? "rotate-90 scale-0 opacity-0"
                            : "rotate-0 scale-100 opacity-100"
                    }`}
                />
                <Moon
                    className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ease-in-out text-foreground ${
                        theme === "dark"
                            ? "rotate-0 scale-100 opacity-100"
                            : "-rotate-90 scale-0 opacity-0"
                    }`}
                />
            </div>
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
