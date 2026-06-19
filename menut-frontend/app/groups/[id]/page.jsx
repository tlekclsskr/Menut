'use client'

import { useAuth } from "@/src/hooks/useAuth"
import CalendarView from "@/src/components/CalendarView"
import { use } from "react"
import { useRouter } from "next/navigation"

export default function GroupPage({ params }) {
    const isReady = useAuth()
    const { id } = use(params)
    const router = useRouter()

    if (!isReady) return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-linear-to-br from-[#e8d5f5] via-[#ffd6e7] to-[#ffefc5]">
            {/* Back button */}
            <div className="p-4">
                <button
                    onClick={() => router.push('/groups')}
                    className="w-9 h-9 bg-white/70 border border-card-border rounded-xl flex items-center justify-center text-primary"
                >
                    ←
                </button>
            </div>
            <CalendarView groupId={id} />
        </div>
    )
}