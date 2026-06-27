'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "@/src/lib/api"
import { useAuth } from "@/src/hooks/useAuth"
import { use } from "react"
import { supabase } from "@/src/lib/supabase"
import LoadingSpinner from "@/src/components/LoadingSpinner"

export default function GroupSettingPage({ params }) {
    const isReady = useAuth()
    const { id } = use(params)
    const router = useRouter()

    const [updateGroupProfile, setUpdateGroupProfile] = useState({ name: '' })
    const [file, setFile] = useState(null)
    const [error, setError] = useState('')
    const isChange = updateGroupProfile.name || file

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        let imageUrl = ''

        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const { data, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file)

            if (uploadError) {
                setError('อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง')
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
        }
    }

    const removeGroup = async () => {
        if (!window.confirm('ต้องการลบกลุ่มนี้ใช่ไหม? การกระทำนี้ไม่สามารถย้อนกลับได้')) return
        try {
            await fetchAPI(`/groups/${id}`, { method: 'DELETE' })
            router.push('/groups')
        } catch {
            setError('ลบกลุ่มไม่สำเร็จ ลองใหม่อีกครั้ง')
        }
    }

    if (!isReady) return <LoadingSpinner />

    const btnPrimary = isChange
        ? 'bg-primary text-white hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/30'
        : 'bg-card-border text-text-muted cursor-not-allowed'

    return (
        <div className="min-h-screen bg-shell flex items-center justify-center p-4">
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
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
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
                        disabled={!isChange}
                        className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${btnPrimary}`}
                    >
                        อัปเดตกลุ่ม
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-card-border">
                    <button
                        type="button"
                        onClick={removeGroup}
                        className="w-full py-3 rounded-xl font-medium text-sm text-error border border-error-border hover:bg-error-bg transition-colors focus-visible:ring-2 focus-visible:ring-error/30"
                    >
                        ลบกลุ่ม
                    </button>
                </div>
            </div>
        </div>
    )
}
