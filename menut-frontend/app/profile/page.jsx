'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "@/src/lib/api"
import { supabase } from "@/src/lib/supabase"
import { useAuth } from "@/src/hooks/useAuth"

export default function ProfilePage() {

    useAuth()

    const [updateProfile, setUpdateProfile] = useState({ name: '' })
    const [file, setFile] = useState(null)
    const isChange = updateProfile.name || file

    const router = useRouter()

    const handleSubmit = async (e) => {
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
            await fetchAPI('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    ...(updateProfile.name && { name: updateProfile.name }),
                    ...(imageUrl && { imageUrl })
                })
            })
            router.push('/groups')
        } catch (error) {
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-[#e8d5f5] via-[#ffd6e7] to-[#ffefc5] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-card-border">
                <button onClick={() => router.back()} className="mb-6 w-9 h-9 bg-input-bg border border-card-border rounded-xl flex items-center justify-center text-primary">
                    ←
                </button>

                { /* Header */ }
                <div className="mb-8">
                    <h1 className="text-2xl font-medium text-text-dark">โปรไฟล์ของฉัน</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col items-center gap-2">
                        <label className="cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-input-bg border-2 border-dashed border-[#c4b8f0] flex items-center justify-center text-2xl hover:bg-available-me transition-colors overflow-hidden">
                                {file ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : '📷'}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="hidden"
                            />
                        </label>
                        <p className="text-xs text-text-muted">กดเพื่ออัปโหลดรูปโปรไฟล์</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-text-muted">ชื่อที่แสดง</label>
                        <input
                            value={updateProfile.name}
                            onChange={(e) => setUpdateProfile({...updateProfile, name: e.target.value})}
                            type="text"
                            placeholder="ชื่อของคุณ"
                            className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border placeholder-[#c4b8f0] focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!isChange}
                        className={`w-full py-3 rounded-xl font-medium text-sm transition-colors
                            ${isChange ? 'bg-primary text-white hover:bg-[#6a5eb5]' : 'bg-card-border text-text-muted cursor-not-allowed'}`}
                    >
                        อัพเดตโปรไฟล์
                    </button>
                </form>
                <button
                    type="button"
                    onClick={() => {
                        localStorage.removeItem('token')
                        router.push('/login')
                    }}
                    className="w-full py-3 rounded-xl font-medium text-sm text-red-400 border border-red-200 mt-20 hover:bg-red-50 transition-colors"
                >
                    ออกจากระบบ
                </button>
            </div>
        </div>
    )
}