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
    const [showMembers, setShowMembers] = useState(false)

    const MAX_SHOW = 5

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

    if (!group) return (
        <div className="flex items-center justify-center h-full text-text-muted">
            Loading...
        </div>
    )

    const MemberAvatar = ({ member }) => (
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shrink-0">
            {member.user.imageUrl ? (
                <img src={member.user.imageUrl} alt={member.user.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-available-me flex items-center justify-center text-xs text-primary font-medium">
                    {member.user.name[0]}
                </div>
            )}
        </div>
    )

    return (
        <div className="p-6 max-w-full">

            {/* Modal สมาชิก */}
            {showMembers && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowMembers(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 border border-card-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-medium text-text-dark mb-4">สมาชิก {members.length} คน</h2>
                        <div className="flex flex-col gap-3">
                            {members.map(m => (
                                <div key={m.id} className="flex items-center gap-3">
                                    <MemberAvatar member={m} />
                                    <p className="text-sm font-medium text-text-dark">{m.user.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Group header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full border-2 border-white bg-available-me overflow-hidden shrink-0">
                            {group.imageUrl ? (
                                <img src={group.imageUrl} className="w-full h-full object-cover" />
                            ) : '👥'}
                        </div>
                        <h1 className="text-xl font-medium text-text-dark">{group.name} ({members.length})</h1>
                    </div>
                    <button
                        onClick={() => router.push(`/groups/${groupId}/settings`)}
                        className="w-9 h-9 bg-white/70 border border-card-border rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-available-me transition-colors cursor-pointer"
                    >
                        ⚙️
                    </button>
                </div>

                {/* Members */}
                <div className="flex gap-1 mt-8 cursor-pointer" onClick={() => setShowMembers(true)}>
                    {members.slice(0, MAX_SHOW).map(m => (
                        <MemberAvatar key={m.id} member={m} />
                    ))}
                    {members.length > MAX_SHOW && (
                        <div className="w-10 h-10 rounded-full bg-input-bg border-2 border-white flex items-center justify-center text-xs text-primary font-medium">
                            +{members.length - MAX_SHOW}
                        </div>
                    )}
                </div>
            </div>

            {/* Calendar card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-card-border max-w-full">

                {/* Nav */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="w-8 h-8 bg-input-bg rounded-lg flex items-center justify-center text-primary">{'<'}</button>
                    <p className="text-base font-medium text-text-dark">{monthName}</p>
                    <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="w-8 h-8 bg-input-bg rounded-lg flex items-center justify-center text-primary">{'>'}</button>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 text-center mb-2">
                    {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => (
                        <div key={d} className="text-md text-text-muted py-1">{d}</div>
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
                                className={`py-3 rounded-xl cursor-pointer text-base transition-colors
                                    ${isAllAvailable ? 'bg-available-all text-[#854d0e] font-medium' :
                                    isMarkedByMe ? 'bg-available-me text-[#534AB7] font-medium' :
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
                <div className="flex gap-4 mt-4 pt-4 border-t border-[#f0ebff]">
                    <div className="flex items-center gap-1.5 text-md text-text-muted">
                        <div className="w-3 h-3 rounded bg-available-me border border-primary-light"></div>ว่างของฉัน
                    </div>
                    <div className="flex items-center gap-1.5 text-md text-text-muted">
                        <div className="w-3 h-3 rounded bg-available-all border border-primary-light"></div>ทุกคนว่าง
                    </div>
                </div>
            </div>
        </div>
    )
}