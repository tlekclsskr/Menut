'use client'

import { useEffect, useState } from "react"
import { fetchAPI } from "@/src/lib/api"
import { useRouter } from "next/navigation"
import { useAuth } from "@/src/hooks/useAuth"

export default function GroupsPage({ params }) {

    const isReady = useAuth()

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
            const { id } = await params

            try {
                const [groupInfo, membersInfo, availabilityInfo, profile] = await Promise.all([
                    fetchAPI(`/groups/${id}`),
                    fetchAPI(`/groups/${id}/members`),
                    fetchAPI(`/availability/${id}`),
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
        if  (!day) return
        const { id } = await params
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        console.log('กดวันที่:', day)
        console.log('dateStr:', dateStr)

        const existing = availability.find(a => {
            return a.date === dateStr && a.user.id == myUserId
        })

        if  (existing) {
            await fetchAPI(`/availability/${existing.id}`, {
                method: 'DELETE'
            })
        } else {
            await fetchAPI('/availability', {
                method: 'POST',
                body: JSON.stringify({
                    groupId: Number(id),
                    date: dateStr
                })
            })
        }
        fetchAll()
    }

    useEffect(() => {
        fetchAll()
    }, [])

    if (!isReady || !group) {
        return <div>Loading...</div>
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">{group.name}</h1>
            <div className="my-4">
                <h2 className="font-bold mb-2">สมาชิก</h2>
                {members.map(m => (
                    <div key={m.id} className="flex items-center gap-2">
                        <p>{m.user.name}</p>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentMonth(new Date(year, month - 1))}>{'<'}</button>
                <p>{monthName}</p>
                <button onClick={() => setCurrentMonth(new Date(year, month + 1))}>{'>'}</button>
            </div>
            
            {/* วันในสัปดาห์ */}
            <div className="grid grid-cols-7 text-center mb-2">
                {[ 'อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส' ].map(d => (
                    <div key={d} className="font-bold">{d}</div>
                ))}
            </div>

            {/* วันในเดือน */}
            <div className="grid grid-cols-7 text-center gap-1">
                {days.map((day, index) => {
                    const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null

                    const isMarkedByMe = day && availability.some(
                        a => a.date === dateStr && a.user.id == myUserId
                    )

                    const isAllAvailable = day && availability.filter(
                        a => a.date === dateStr
                    ).length === members.length
                    return (
                        <div
                            key={index}
                            className={`p-2 rounded cursor-pointer 
                                ${isAllAvailable ? 'bg-yellow-300' : 
                                isMarkedByMe ? 'bg-green-300' : 
                                'hover:bg-gray-100'}
                            `}
                            onClick={() => handleToggleDate(day)}
                        >
                            {day || ''}
                        </div>
                    )
            })}
            </div>
        </div>
    )
}