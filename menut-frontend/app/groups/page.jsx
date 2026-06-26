'use client'

import { fetchAPI } from '@/src/lib/api'
import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/hooks/useAuth'
import { useRouter } from 'next/navigation'
import CalendarView from "@/src/components/CalendarView"
import LoadingSpinner from '@/src/components/LoadingSpinner'

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
        }
    }

    const fetchProfile = async () => {
        try {
            const data = await fetchAPI('/auth/profile')
            setProfile(data)
        } catch (error) {
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
        }
    }

    useEffect(() => {
        fetchGroups()
        fetchProfile()
    }, [])

    if (!isReady) return <LoadingSpinner />

    const avatarLetter = profile?.name?.[0]?.toUpperCase() || '?'

    const GroupList = () => (
        <div className="flex flex-col gap-2">
            {groupLists.map((group) => (
                <div
                    key={group.id}
                    className={`bg-white border rounded-2xl px-4 py-3.5 flex items-center gap-4 cursor-pointer transition-colors shadow-sm
                        ${selectedGroupId === group.id ? 'border-primary' : 'border-[#ede8f5] hover:border-[#c4b8f0]'}`}
                    onClick={() => {
                        if (window.innerWidth < 768) {
                            router.push(`/groups/${group.id}`)
                        } else {
                            setSelectedGroupId(group.id)
                        }
                    }}
                >
                    <div className="w-12 h-12 rounded-full bg-available-me flex items-center justify-center text-xl shrink-0 overflow-hidden">
                        {group.imageUrl ? (
                            <img src={group.imageUrl} className="w-full h-full object-cover" />
                        ) : '👥'}
                    </div>
                    <div className="flex-1">
                        <p className="text-base font-medium text-text-dark">{group.name}</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(group.inviteCode) }}
                        className="w-8 h-8 bg-input-bg border border-[#e0d8f8] rounded-lg flex items-center justify-center text-sm shrink-0"
                    >
                        🔗
                    </button>
                </div>
            ))}
        </div>
    )

    const DesktopActionButtons = () => (
        <div className="flex gap-2 mt-3">
            <button
                onClick={() => { setShowCreate(true); setShowJoin(false) }}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium"
            >
                สร้างกลุ่ม
            </button>
            <button
                onClick={() => { setShowJoin(true); setShowCreate(false) }}
                className="flex-1 bg-white text-primary border border-[#c4b8f0] py-2.5 rounded-xl text-sm font-medium"
            >
                เข้าร่วมกลุ่ม
            </button>
        </div>
    )

    const MobileActionButtons = () => (
        <div className="flex gap-3 mt-3">
            <button
                onClick={() => { setShowCreate(true); setShowJoin(false) }}
                className="flex-1 bg-primary text-white py-4 rounded-2xl text-base font-medium"
            >
                สร้างกลุ่ม
            </button>
            <button
                onClick={() => { setShowJoin(true); setShowCreate(false) }}
                className="flex-1 bg-white text-primary border border-[#c4b8f0] py-4 rounded-2xl text-base font-medium"
            >
                เข้าร่วมกลุ่ม
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-linear-to-br from-[#e8d5f5] via-[#ffd6e7] to-[#ffefc5]">

            {/* Modal สร้างกลุ่ม */}
            {showCreate && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowCreate(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 border border-card-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-medium text-text-dark mb-4">สร้างกลุ่มใหม่</h2>
                        <form onSubmit={handleCreate} className="flex flex-col gap-3">
                            <div className="flex flex-col items-center mb-2">
                                <label className="cursor-pointer">
                                    <div className="w-16 h-16 rounded-2xl bg-input-bg border-2 border-dashed border-[#c4b8f0] flex items-center justify-center text-2xl hover:bg-available-me transition-colors overflow-hidden">
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
                                <p className="text-xs text-text-muted mt-1">กดเพื่ออัปโหลดรูปกลุ่ม</p>
                            </div>
                            <input
                                value={addGroupData.name}
                                onChange={(e) => setAddGroupData({ ...addGroupData, name: e.target.value })}
                                placeholder="ชื่อกลุ่ม"
                                className="w-full px-4 py-3 bg-input-bg rounded-xl border border-card-border text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <div className="flex gap-2 mt-2">
                                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-white text-primary border border-[#c4b8f0] py-3 rounded-xl text-sm font-medium">ยกเลิก</button>
                                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-medium">สร้างกลุ่ม</button>
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
                        className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 border border-card-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-medium text-text-dark mb-4">เข้าร่วมกลุ่ม</h2>
                        <form onSubmit={handleJoin} className="flex flex-col gap-3">
                            <input
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Invite Code"
                                className="w-full px-4 py-3 bg-input-bg rounded-xl border border-card-border text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <div className="flex gap-2 mt-2">
                                <button type="button" onClick={() => setShowJoin(false)} className="flex-1 bg-white text-primary border border-[#c4b8f0] py-3 rounded-xl text-sm font-medium">ยกเลิก</button>
                                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-medium">เข้าร่วม</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {copied && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-dark text-white text-sm px-4 py-2 rounded-xl z-50">
                    คัดลอก Invite Code แล้ว ✓
                </div>
            )}

            {/* Mobile */}
            <div className="md:hidden flex flex-col min-h-screen">
                <div className="bg-linear-to-r from-[#e8d5f5] to-[#ffd6e7] px-5 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium text-text-dark">กลุ่มของฉัน</h1>
                        <p className="text-base text-text-muted">{groupLists.length} กลุ่ม</p>
                    </div>
                    <button onClick={() => router.push('/profile')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                        {profile?.imageUrl ? (
                            <img src={profile.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-white border border-card-border flex items-center justify-center text-sm font-medium text-primary">
                                {avatarLetter}
                            </div>
                        )}
                    </button>
                </div>
                <div className="flex-1 p-5">
                    <GroupList />
                </div>
                <div className="p-5 border-t border-white/50">
                    <MobileActionButtons />
                </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex min-h-screen">
                <div className="w-70 bg-white/30 backdrop-blur-md flex flex-col p-4 border-r border-card-border">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-sm font-medium text-text-dark">กลุ่มของฉัน</h1>
                            <p className="text-xs text-text-muted">{groupLists.length} กลุ่ม</p>
                        </div>
                        <button onClick={() => router.push('/profile')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                            {profile?.imageUrl ? (
                                <img src={profile.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white border border-card-border flex items-center justify-center text-sm font-medium text-primary">
                                    {avatarLetter}
                                </div>
                            )}
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <GroupList />
                    </div>
                    <DesktopActionButtons />
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