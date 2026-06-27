'use client'

import { useEffect, useState, useCallback } from "react"
import { fetchAPI } from "@/src/lib/api"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/src/components/LoadingSpinner"

export default function CalendarView({ groupId }) {

    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [group, setGroup] = useState(null)
    const [members, setMembers] = useState([])
    const [availability, setAvailability] = useState([])
    const [myUserId, setMyUserId] = useState(null)
    const [showMembers, setShowMembers] = useState(false)
    const [togglingDay, setTogglingDay] = useState(null)

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

    const fetchAll = useCallback(async () => {
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
        } catch {
            router.push('/groups')
        }
    }, [groupId, router])

    const handleToggleDate = async (day) => {
        if (!day || togglingDay) return
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        const existing = availability.find(a => a.date === dateStr && a.user.id == myUserId)

        setTogglingDay(day)
        try {
            if (existing) {
                await fetchAPI(`/availability/${existing.id}`, { method: 'DELETE' })
            } else {
                await fetchAPI('/availability', {
                    method: 'POST',
                    body: JSON.stringify({ groupId: Number(groupId), date: dateStr })
                })
            }
            await fetchAll()
        } finally {
            setTogglingDay(null)
        }
    }

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    useEffect(() => {
        if (!showMembers) return
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setShowMembers(false)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [showMembers])

    if (!group) return <LoadingSpinner />

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

            {showMembers && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowMembers(false)}
                    role="presentation"
                >
                    <div
                        className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 border border-card-border"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="members-dialog-title"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="members-dialog-title" className="text-lg font-medium text-text-dark">
                                สมาชิก {members.length} คน
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowMembers(false)}
                                className="w-10 h-10 bg-input-bg border border-card-border rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-available-me transition-colors"
                                aria-label="ปิด"
                            >
                                ✕
                            </button>
                        </div>
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

            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-16 h-16 rounded-full border-2 border-white bg-available-me overflow-hidden shrink-0 flex items-center justify-center text-xl">
                            {group.imageUrl ? (
                                <img src={group.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : '👥'}
                        </div>
                        <h1 className="text-xl font-medium text-text-dark truncate">{group.name}</h1>
                        <span className="text-sm text-text-muted shrink-0">({members.length})</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={fetchAll}
                            className="w-10 h-10 bg-white/70 border border-card-border rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-available-me transition-colors"
                            aria-label="รีโหลดปฏิทิน"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                                <path d="M21 3v5h-5"/>
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push(`/groups/${groupId}/settings`)}
                            className="w-10 h-10 bg-white/70 border border-card-border rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-available-me transition-colors"
                            aria-label="ตั้งค่ากลุ่ม"
                        >
                            ⚙️
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    className="flex gap-1 mt-8 cursor-pointer rounded-xl p-1 -ml-1 hover:bg-white/40 transition-colors"
                    onClick={() => setShowMembers(true)}
                    aria-label={`ดูสมาชิก ${members.length} คน`}
                >
                    {members.slice(0, MAX_SHOW).map(m => (
                        <MemberAvatar key={m.id} member={m} />
                    ))}
                    {members.length > MAX_SHOW && (
                        <div className="w-10 h-10 rounded-full bg-input-bg border-2 border-white flex items-center justify-center text-xs text-primary font-medium">
                            +{members.length - MAX_SHOW}
                        </div>
                    )}
                </button>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-card-border max-w-full">

                <div className="flex items-center justify-between mb-4">
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(year, month - 1))}
                        className="w-10 h-10 bg-input-bg rounded-lg flex items-center justify-center text-primary hover:bg-available-me transition-colors"
                        aria-label="เดือนก่อนหน้า"
                    >
                        ‹
                    </button>
                    <p className="text-base font-medium text-text-dark">{monthName}</p>
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(year, month + 1))}
                        className="w-10 h-10 bg-input-bg rounded-lg flex items-center justify-center text-primary hover:bg-available-me transition-colors"
                        aria-label="เดือนถัดไป"
                    >
                        ›
                    </button>
                </div>

                <div className="grid grid-cols-7 text-center mb-2" role="row">
                    {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => (
                        <div key={d} className="text-sm text-text-muted py-1 font-medium" role="columnheader">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 text-center gap-1" role="grid" aria-label={`ปฏิทินความว่าง ${monthName}`}>
                    {days.map((day, index) => {
                        const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null
                        const isMarkedByMe = day && availability.some(a => a.date === dateStr && a.user.id == myUserId)
                        const isAllAvailable = day && availability.filter(a => a.date === dateStr).length === members.length
                        const isBusy = togglingDay === day

                        if (!day) {
                            return <div key={index} role="presentation" />
                        }

                        const stateLabel = isAllAvailable
                            ? 'ทุกคนว่าง'
                            : isMarkedByMe
                                ? 'ว่างของฉัน'
                                : 'ยังไม่ได้มาร์ค'

                        return (
                            <button
                                key={index}
                                type="button"
                                disabled={isBusy}
                                aria-label={`${day} ${monthName} — ${stateLabel}`}
                                aria-pressed={isMarkedByMe || isAllAvailable}
                                className={`min-h-11 py-2.5 rounded-xl text-base transition-colors focus-visible:ring-2 focus-visible:ring-primary/30
                                    ${isAllAvailable ? 'bg-available-all text-available-all-text font-medium' :
                                    isMarkedByMe ? 'bg-available-me text-available-me-text font-medium' :
                                    'hover:bg-input-bg text-text-dark'}
                                    ${isBusy ? 'opacity-60' : ''}
                                `}
                                onClick={() => handleToggleDate(day)}
                            >
                                {day}
                            </button>
                        )
                    })}
                </div>

                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border-subtle">
                    <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <div className="w-3.5 h-3.5 rounded bg-available-me border border-primary-light" aria-hidden="true" />
                        ว่างของฉัน
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <div className="w-3.5 h-3.5 rounded bg-available-all border border-primary-light" aria-hidden="true" />
                        ทุกคนว่าง
                    </div>
                </div>
            </div>
        </div>
    )
}
