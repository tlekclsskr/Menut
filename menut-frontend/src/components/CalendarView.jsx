'use client'

import { useEffect, useState } from "react"
import { fetchAPI } from "@/src/lib/api"
import { useRouter } from "next/navigation"

export default function CalendarView({ groupId }) {

    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [group, setGroup] = useState(null)
    const [members, setMembers] = useState([])
    const [availability, setAvailability] = useState([])
    const [myUserId, setMyUserId] = useState(null)

    const router = useRouter()

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = [
        ...Array(firstDay).fill(null),
        ...Array(daysInMonth).fill(null).map((_, i) => i + 1)
    ]

    const monthName = currentMonth.toLocaleString('th-TH', { month: 'long', year: 'numeric' })

    const fetchAll = async () => {
        try {
            const [groupInfo, membersInfo, availabilityInfo, profile] = await Promise.all([
                fetchAPI(`/groups/${groupId}`),
                fetchAPI(`/groups/${groupId}/members`),
                fetchAPI(`/availability/${groupId}`),
                fetchAPI('/auth/profile')
            ])

            setGroup(groupInfo)
            setMembers(membersInfo)
            setAvailability(availabilityInfo)
            setMyUserId(profile.id)
        } catch (error) {
            console.log(error)
            router.push('/groups')
        }
    }

    const handleToggleDate = async (day) => {
        if (!day) return
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        const existing = availability.find(a => a.date === dateStr && a.user.id == myUserId)

        if (existing) {
            await fetchAPI(`/availability/${existing.id}`, { method: 'DELETE' })
        } else {
            await fetchAPI('/availability', {
                method: 'POST',
                body: JSON.stringify({ groupId: Number(groupId), date: dateStr })
            })
        }
        fetchAll()
    }

    useEffect(() => {
        fetchAll()
    }, [groupId])

    if (!group) return <div className="flex items-center justify-center h-full text-text-muted">Loading...</div>

    return (
        <div className="p-4">
            {/* Group header */}
            <div className="mb-4">
                <h1 className="text-lg font-medium text-text-dark">{group.name}</h1>
                <div className="flex gap-1 mt-2">
                    {members.map(m => (
                        <div key={m.id} className="w-6 h-6 rounded-full bg-available-me flex items-center justify-center text-xs text-primary font-medium">
                            {m.user.name[0]}
                        </div>
                    ))}
                </div>
            </div>

            {/* Calendar nav */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCurrentMonth(new Date(year, month - 1))}
                    className="w-8 h-8 bg-input-bg rounded-lg flex items-center justify-center text-primary"
                >{'<'}</button>
                <p className="text-sm font-medium text-text-dark">{monthName}</p>
                <button
                    onClick={() => setCurrentMonth(new Date(year, month + 1))}
                    className="w-8 h-8 bg-input-bg rounded-lg flex items-center justify-center text-primary"
                >{'>'}</button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 text-center mb-2">
                {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => (
                    <div key={d} className="text-xs text-text-muted py-1">{d}</div>
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 text-center gap-1">
                {days.map((day, index) => {
                    const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null
                    const isMarkedByMe = day && availability.some(a => a.date === dateStr && a.user.id == myUserId)
                    const isAllAvailable = day && availability.filter(a => a.date === dateStr).length === members.length

                    return (
                        <div
                            key={index}
                            className={`p-2 rounded-lg cursor-pointer text-sm
                                ${isAllAvailable ? 'bg-available-all text-[#854d0e]' :
                                isMarkedByMe ? 'bg-available-me text-[#534AB7]' :
                                day ? 'hover:bg-input-bg text-text-dark' : ''}
                            `}
                            onClick={() => handleToggleDate(day)}
                        >
                            {day || ''}
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-1 text-xs text-text-muted">
                    <div className="w-3 h-3 rounded bg-available-me"></div>ว่างของฉัน
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                    <div className="w-3 h-3 rounded bg-available-all"></div>ทุกคนว่าง
                </div>
            </div>
        </div>
    )
}