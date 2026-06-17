'use client'

import { useAuth } from "@/src/hooks/useAuth"
import CalendarView from "@/src/components/CalendarView"
import { use } from "react"

export default function GroupPage({ params }) {
    const isReady = useAuth()
    const { id } = use(params)

    if (!isReady) return <div>Loading...</div>

    return <CalendarView groupId={id} />
}