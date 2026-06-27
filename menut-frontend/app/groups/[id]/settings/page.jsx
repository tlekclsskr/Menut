'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "@/src/lib/api"
import { useAuth } from "@/src/hooks/useAuth"
import { use } from "react"
import { supabase } from "@/src/lib/supabase"
import { ButtonSpinner } from "@/src/components/ButtonSpinner"
import LoadingSpinner from "@/src/components/LoadingSpinner"

export default function GroupSettingPage({ params }) {
    const isReady = useAuth()
    const { id } = use(params)
    const router = useRouter()

    const [updateGroupProfile, setUpdateGroupProfile] = useState({ name: '' })
    const [file, setFile] = useState(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [inviteCode, setInviteCode] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showRegenerateModal, setShowRegenerateModal] = useState(false)
    const isChange = updateGroupProfile.name || file

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const data = await fetchAPI(`/groups/${id}`)
                setInviteCode(data.inviteCode)
            } catch {
                setError('โหลดข้อมูลกลุ่มไม่สำเร็จ')
            }
        }
        fetchGroup()
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        let imageUrl = ''

        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const { data, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file)

            if (uploadError) {
                setError('อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง')
                setIsLoading(false)
                return
            }

            imageUrl = supabase.storage
                .from('avatars')
                .getPublicUrl(data.path).data.publicUrl
        }

        try {
            await fetchAPI(`/groups/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...(updateGroupProfile.name && { name: updateGroupProfile.name }),
                    ...(imageUrl && { imageUrl })
                })
            })
            router.push('/groups')
        } catch {
            setError('อัปเดตกลุ่มไม่สำเร็จ ลองใหม่อีกครั้ง')
        } finally {
            setIsLoading(false)
        }
    }

    const removeGroup = async () => {
        setIsDeleting(true)
        try {
            await fetchAPI(`/groups/${id}`, { method: 'DELETE' })
            router.push('/groups')
        } catch {
            setError('ลบกลุ่มไม่สำเร็จ ลองใหม่อีกครั้ง')
            setShowDeleteModal(false)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleRegenerateInviteCode = async () => {
        setIsRegenerating(true)
        try {
            const data = await fetchAPI(`/groups/${id}/regenerate-invite`, { method: 'POST' })
            setInviteCode(data.inviteCode)
            setShowRegenerateModal(false)
        } catch {
            setError('สร้าง Invite Code ใหม่ไม่สำเร็จ ลองใหม่อีกครั้ง')
        } finally {
            setIsRegenerating(false)
        }
    }

    if (!isReady) return <LoadingSpinner />

    const btnPrimary = isChange && !isLoading
        ? 'bg-primary text-white hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/30'
        : 'bg-card-border text-text-muted cursor-not-allowed'

    return (
        <div className="min-h-screen bg-shell flex items-center justify-center p-4">

            {/* Modal ยืนยันลบกลุ่ม */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 border border-card-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-medium text-text-dark mb-2">ลบกลุ่มนี้ใช่ไหม?</h2>
                        <p className="text-sm text-text-muted mb-6">การกระทำนี้ไม่สามารถย้อนกลับได้ สมาชิกทั้งหมดจะถูกลบออกจากกลุ่ม</p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 rounded-xl text-sm font-medium bg-white text-primary border border-border-accent hover:bg-input-bg transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={removeGroup}
                                disabled={isDeleting}
                                className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-error hover:opacity-90 transition-colors"
                            >
                                {isDeleting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <ButtonSpinner />
                                        กำลังลบ...
                                    </div>
                                ) : 'ลบกลุ่ม'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal ยืนยัน regenerate */}
            {showRegenerateModal && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowRegenerateModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 border border-card-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-medium text-text-dark mb-2">สร้าง Invite Code ใหม่ใช่ไหม?</h2>
                        <p className="text-sm text-text-muted mb-6">Code เดิมจะใช้ไม่ได้ทันที</p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowRegenerateModal(false)}
                                className="flex-1 py-3 rounded-xl text-sm font-medium bg-white text-primary border border-border-accent hover:bg-input-bg transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={handleRegenerateInviteCode}
                                disabled={isRegenerating}
                                className="flex-1 py-3 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
                            >
                                {isRegenerating ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <ButtonSpinner />
                                        กำลังสร้าง...
                                    </div>
                                ) : 'สร้างใหม่'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-card-border">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-6 w-10 h-10 bg-input-bg border border-card-border rounded-xl flex items-center justify-center text-primary hover:bg-available-me transition-colors"
                    aria-label="กลับ"
                >
                    ←
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-medium text-text-dark">ตั้งค่ากลุ่ม</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col items-center gap-2">
                        <label className="cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-input-bg border-2 border-dashed border-border-accent flex items-center justify-center text-2xl hover:bg-available-me transition-colors overflow-hidden">
                                {file ? (
                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                ) : '📷'}
                            </div>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="hidden"
                            />
                        </label>
                        <p className="text-xs text-text-muted">กดเพื่ออัปโหลดรูปกลุ่ม</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="group-name" className="text-sm text-text-muted">ชื่อกลุ่ม</label>
                        <input
                            id="group-name"
                            value={updateGroupProfile.name}
                            onChange={(e) => setUpdateGroupProfile({...updateGroupProfile, name: e.target.value})}
                            type="text"
                            placeholder="ชื่อของกลุ่ม"
                            className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                    </div>

                    {error && (
                        <p className="text-error text-sm text-center" role="alert">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={!isChange || isLoading}
                        className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${btnPrimary}`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <ButtonSpinner />
                                {file ? 'กำลังอัปโหลด...' : 'กำลังอัปเดต...'}
                            </div>
                        ) : 'อัปเดตกลุ่ม'}
                    </button>
                </form>

                {/* Invite Code */}
                <div className="mt-6 pt-6 border-t border-card-border">
                    <p className="text-sm text-text-muted mb-2">Invite Code</p>
                    <div className="flex items-center gap-2 bg-input-bg rounded-xl px-4 py-3 border border-card-border">
                        <p className="flex-1 text-sm font-mono text-text-dark">{inviteCode || '—'}</p>
                        <button
                            type="button"
                            onClick={() => setShowRegenerateModal(true)}
                            className="text-xs text-primary font-medium hover:underline shrink-0"
                        >
                            สร้างใหม่
                        </button>
                    </div>
                </div>

                {/* ลบกลุ่ม */}
                <div className="mt-4 pt-6 border-t border-card-border">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full py-3 rounded-xl font-medium text-sm text-error border border-error-border hover:bg-error-bg transition-colors focus-visible:ring-2 focus-visible:ring-error/30"
                    >
                        ลบกลุ่ม
                    </button>
                </div>
            </div>
        </div>
    )
}
