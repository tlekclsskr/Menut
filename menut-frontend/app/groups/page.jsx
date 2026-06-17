'use client'

import { fetchAPI } from '@/src/lib/api'
import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/hooks/useAuth'
import { useRouter } from 'next/navigation'
import CalendarView from "@/src/components/CalendarView"

export default function GroupsPage() {

    const isReady = useAuth()
    const router = useRouter()

    const [groupLists, setGroupLists] = useState([])
    const [inviteCode, setInviteCode] = useState('')
    const [file, setFile] = useState(null)
    const [addGroupData, setAddGroupData] = useState({ name: '' })
    const [showCreate, setShowCreate] = useState(false)
    const [showJoin, setShowJoin] = useState(false)
    const [profile, setProfile] = useState(null)
    const [copied, setCopied] = useState(false)
    const [selectedGroupId, setSelectedGroupId] = useState(null)

    const fetchGroups = async () => {
        try {
            const groups = await fetchAPI('/groups')
            setGroupLists(groups)
        } catch (error) {
            console.log(error)
        }
    }

    const fetchProfile = async () => {
        try {
            const data = await fetchAPI('/auth/profile')
            setProfile(data)
        } catch (error) {
            console.log(error)
        }
    }

    const handleJoin = async (e) => {
        e.preventDefault()
        try {
            await fetchAPI('/groups/join', {
                method: 'POST',
                body: JSON.stringify({ inviteCode })
            })
            setInviteCode('')
            setShowJoin(false)
            fetchGroups()
        } catch (error) {
            console.log(error)
        }
    }

    const handleCopy = (inviteCode) => {
        navigator.clipboard.writeText(inviteCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleCreate = async (e) => {
        e.preventDefault()

        let imageUrl = ''

        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, file)

            if (error) {
                console.log(error)
                return
            }

            imageUrl = supabase.storage
                .from('avatars')
                .getPublicUrl(data.path).data.publicUrl
        }

        try {
            await fetchAPI('/groups', {
                method: 'POST',
                body: JSON.stringify({
                    name: addGroupData.name,
                    imageUrl
                })
            })
            setAddGroupData({ name: '' })
            setFile(null)
            setShowCreate(false)
            fetchGroups()
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchGroups()
        fetchProfile()
    }, [])

    if (!isReady) return <div>Loading...</div>

    const avatarLetter = profile?.name?.[0]?.toUpperCase() || '?'

    const GroupList = () => (
        <div className="flex flex-col gap-2">
            {groupLists.map((group) => (
                <div
                    key={group.id}
                    className={`bg-white border rounded-2xl px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors shadow-sm
                        ${selectedGroupId === group.id ? 'border-[#7c6fcd]' : 'border-[#ede8f5] hover:border-[#c4b8f0]'}`}
                    onClick={() => {
                        if (window.innerWidth < 768) {
                            router.push(`/groups/${group.id}`)
                        } else {
                            setSelectedGroupId(group.id)
                        }
                    }}
                >
                    <div className="w-9 h-9 rounded-xl bg-[#eeedfe] flex items-center justify-center text-base shrink-0 overflow-hidden">
                        {group.imageUrl ? (
                            <img src={group.imageUrl} className="w-full h-full object-cover" />
                        ) : '👥'}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-[#4a3f6b]">{group.name}</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(group.inviteCode) }}
                        className="w-7 h-7 bg-[#f5f2ff] border border-[#e0d8f8] rounded-lg flex items-center justify-center text-xs shrink-0"
                    >
                        🔗
                    </button>
                </div>
            ))}
        </div>
    )

    const ActionButtons = () => (
        <div className="flex gap-2 mt-3">
            <button
                onClick={() => { setShowCreate(true); setShowJoin(false) }}
                className="flex-1 bg-[#7c6fcd] text-white py-2.5 rounded-xl text-sm font-medium"
            >
                สร้างกลุ่ม
            </button>
            <button
                onClick={() => { setShowJoin(true); setShowCreate(false) }}
                className="flex-1 bg-white text-[#7c6fcd] border border-[#c4b8f0] py-2.5 rounded-xl text-sm font-medium"
            >
                เข้าร่วมกลุ่ม
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e8d5f5] via-[#ffd6e7] to-[#ffefc5]">

            {/* Modal สร้างกลุ่ม */}
            {showCreate && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowCreate(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 border border-[#e2d9f3]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-medium text-[#4a3f6b] mb-4">สร้างกลุ่มใหม่</h2>
                        <form onSubmit={handleCreate} className="flex flex-col gap-3">
                            <div className="flex flex-col items-center mb-2">
                                <label className="cursor-pointer">
                                    <div className="w-16 h-16 rounded-2xl bg-[#f5f2ff] border-2 border-dashed border-[#c4b8f0] flex items-center justify-center text-2xl hover:bg-[#eeedfe] transition-colors overflow-hidden">
                                        {file ? (
                                            <img src={URL.createObjectURL(file)} alt="group" className="w-full h-full object-cover" />
                                        ) : '🖼️'}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-[#9b8ec4] mt-1">กดเพื่ออัปโหลดรูปกลุ่ม</p>
                            </div>
                            <input
                                value={addGroupData.name}
                                onChange={(e) => setAddGroupData({ ...addGroupData, name: e.target.value })}
                                placeholder="ชื่อกลุ่ม"
                                className="w-full px-4 py-3 bg-[#f5f2ff] rounded-xl border border-[#e2d9f3] text-sm text-[#4a3f6b] focus:outline-none focus:ring-2 focus:ring-[#7c6fcd]/30"
                            />
                            <div className="flex gap-2 mt-2">
                                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-white text-[#7c6fcd] border border-[#c4b8f0] py-3 rounded-xl text-sm font-medium">ยกเลิก</button>
                                <button type="submit" className="flex-1 bg-[#7c6fcd] text-white py-3 rounded-xl text-sm font-medium">สร้างกลุ่ม</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal เข้าร่วมกลุ่ม */}
            {showJoin && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowJoin(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 border border-[#e2d9f3]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-medium text-[#4a3f6b] mb-4">เข้าร่วมกลุ่ม</h2>
                        <form onSubmit={handleJoin} className="flex flex-col gap-3">
                            <input
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Invite Code"
                                className="w-full px-4 py-3 bg-[#f5f2ff] rounded-xl border border-[#e2d9f3] text-sm text-[#4a3f6b] focus:outline-none focus:ring-2 focus:ring-[#7c6fcd]/30"
                            />
                            <div className="flex gap-2 mt-2">
                                <button type="button" onClick={() => setShowJoin(false)} className="flex-1 bg-white text-[#7c6fcd] border border-[#c4b8f0] py-3 rounded-xl text-sm font-medium">ยกเลิก</button>
                                <button type="submit" className="flex-1 bg-[#7c6fcd] text-white py-3 rounded-xl text-sm font-medium">เข้าร่วม</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {copied && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#4a3f6b] text-white text-sm px-4 py-2 rounded-xl z-50">
                    คัดลอก Invite Code แล้ว ✓
                </div>
            )}

            {/* Mobile */}
            <div className="md:hidden flex flex-col min-h-screen">
                <div className="bg-gradient-to-r from-[#e8d5f5] to-[#ffd6e7] px-4 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-base font-medium text-[#4a3f6b]">กลุ่มของฉัน</h1>
                        <p className="text-xs text-[#9b8ec4]">{groupLists.length} กลุ่ม</p>
                    </div>
                    <button onClick={() => router.push('/profile')} className="w-8 h-8 rounded-full bg-white border border-[#e2d9f3] flex items-center justify-center text-xs font-medium text-[#7c6fcd]">
                        {avatarLetter}
                    </button>
                </div>
                <div className="flex-1 p-4">
                    <GroupList />
                </div>
                <div className="p-4 border-t border-white/50">
                    <ActionButtons />
                </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex min-h-screen">
                <div className="w-[280px] bg-white/30 backdrop-blur-md flex flex-col p-4 border-r border-[#e2d9f3]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-sm font-medium text-[#4a3f6b]">กลุ่มของฉัน</h1>
                            <p className="text-xs text-[#9b8ec4]">{groupLists.length} กลุ่ม</p>
                        </div>
                        <button onClick={() => router.push('/profile')} className="w-8 h-8 rounded-full bg-white border border-[#e2d9f3] flex items-center justify-center text-xs font-medium text-[#7c6fcd]">
                            {avatarLetter}
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <GroupList />
                    </div>
                    <ActionButtons />
                </div>

                {/* Main area */}
                <div className="flex-1 flex items-center justify-center">
                    {selectedGroupId ? (
                        <div className="w-full h-full overflow-y-auto">
                            <CalendarView groupId={selectedGroupId} />
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-3xl mb-2">👆</p>
                            <p className="text-sm text-[#c4b8f0]">เลือกกลุ่มเพื่อดูปฏิทิน</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}