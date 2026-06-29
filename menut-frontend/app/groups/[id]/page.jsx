'use client'

import { useAuth } from "@/src/hooks/useAuth"
import CalendarView from "@/src/components/CalendarView"
import LoadingSpinner from "@/src/components/LoadingSpinner"
import { use } from "react"
import { useRouter } from "next/navigation"

export default function GroupDetailPage({ params }) {
    const isReady = useAuth()
    const { id } = use(params)
    const router = useRouter()

    if (!isReady) return <LoadingSpinner />

    return (
        <div className="min-h-screen bg-shell">
            <div className="p-4">
                <button
                    type="button"
                    onClick={() => router.push('/groups')}
                    className="w-10 h-10 bg-white/70 dark:bg-white/10 border border-card-border rounded-xl flex items-center justify-center text-primary hover:bg-available-me transition-colors"
                    aria-label="กลับไปหน้ากลุ่ม"
                >
                    ←
                </button>
            </div>
            <CalendarView groupId={id} />
        </div>
    )
}
