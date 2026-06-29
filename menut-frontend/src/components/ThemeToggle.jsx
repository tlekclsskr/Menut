'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    return (
        <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 bg-white/70 dark:bg-white/10 border border-card-border rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-available-me transition-colors"
            aria-label="สลับ dark mode"
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    )
}