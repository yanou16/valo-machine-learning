"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Effectively avoid hydration mismatch by waiting for mount
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                <span className="w-5 h-5 bg-slate-700/50 rounded-full animate-pulse" />
            </div>
        )
    }

    // Determine if we show dark or light state
    // Use resolvedTheme to know what is actually displayed
    const isDark = resolvedTheme === "dark"

    const toggleTheme = () => {
        const newTheme = isDark ? "light" : "dark"
        setTheme(newTheme)

        // Force manual class toggle for immediate feedback
        // This helps if next-themes is slow or stuck on system
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 flex items-center justify-center overflow-hidden transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            <motion.div
                initial={false}
                animate={{
                    scale: isDark ? 1 : 0,
                    rotate: isDark ? 0 : 90,
                    opacity: isDark ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Moon className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
            </motion.div>

            <motion.div
                initial={false}
                animate={{
                    scale: !isDark ? 1 : 0,
                    rotate: !isDark ? 0 : -90,
                    opacity: !isDark ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Sun className="h-5 w-5 text-slate-700 hover:text-slate-900 transition-colors" />
            </motion.div>
        </motion.button>
    )
}
