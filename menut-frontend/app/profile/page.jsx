'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "@/src/lib/api"
import { supabase } from "@/src/lib/supabase"
import { useAuth } from "@/src/hooks/useAuth"
import { ButtonSpinner } from "@/src/components/ButtonSpinner"
import LoadingSpinner from "@/src/components/LoadingSpinner"

export default function ProfilePage() {

    const isReady = useAuth()

    const [updateProfile, setUpdateProfile] = useState({ name: '' })
    const [file, setFile] = useState(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const isChange = updateProfile.name || file

    const router = useRouter()

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
            await fetchAPI('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    ...(updateProfile.name && { name: updateProfile.name }),
                    ...(imageUrl && { imageUrl })
                })
            })
            router.push('/groups')
        } catch {
            setError('อัปเดตโปรไฟล์ไม่สำเร็จ ลองใหม่อีกครั้ง')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isReady) return <LoadingSpinner />

    const btnPrimary = isChange && !isLoading
        ? 'bg-primary text-white hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/30'
        : 'bg-card-border text-text-muted cursor-not-allowed'

    return (
        <div className="min-h-screen bg-shell flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#2a2445] rounded-3xl p-8 border border-card-border">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-6 w-10 h-10 bg-input-bg border border-card-border rounded-xl flex items-center justify-center text-primary hover:bg-available-me transition-colors"
                    aria-label="กลับ"
                >
                    ←
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-medium text-text-dark">โปรไฟล์ของฉัน</h1>
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
                        <p className="text-xs text-text-muted">กดเพื่ออัปโหลดรูปโปรไฟล์</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="profile-name" className="text-sm text-text-muted">ชื่อที่แสดง</label>
                        <input
                            id="profile-name"
                            value={updateProfile.name}
                            onChange={(e) => setUpdateProfile({...updateProfile, name: e.target.value})}
                            type="text"
                            placeholder="ชื่อของคุณ"
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
                        ) : 'อัปเดตโปรไฟล์'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-card-border">
                    <button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem('token')
                            router.push('/login')
                        }}
                        className="w-full py-3 rounded-xl font-medium text-sm text-error border border-error-border hover:bg-error-bg transition-colors focus-visible:ring-2 focus-visible:ring-error/30"
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </div>
        </div>
    )
}
