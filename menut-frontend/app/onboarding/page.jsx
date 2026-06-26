'use client'

import { useEffect, useState } from "react"
import { useRegister } from "@/src/context/RegisterContext"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"
import { fetchAPI } from "@/src/lib/api"

export default function OnboardingPage() {
    const [registerData, setRegisterData] = useState({
        name: '',
        birthDate: '',
    })
    const [file, setFile] = useState(null)
    const isValid = registerData.name && registerData.birthDate

    const { registerData: contextData } = useRegister()
    const router = useRouter()

    useEffect(() => {
        if  (!contextData.email || !contextData.password) {
            router.push('/register')
        }
    }, [])

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
            await fetchAPI('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    email: contextData.email,
                    password: contextData.password,
                    name: registerData.name,
                    birthDate: registerData.birthDate,
                    imageUrl
                })
            })
            router.push('/login')
        } catch (error) {
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-[#e8d5f5] via-[#ffd6e7] to-[#ffefc5] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-card-border">

                {/* Step dots */}
                <div className="flex gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-[#e0d8f8]"></div>
                    <div className="w-5 h-3 rounded-full bg-primary"></div>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-text-dark">บอกเราเพิ่มเติม</h1>
                    <p className="text-text-muted text-sm mt-1">ตั้งค่าโปรไฟล์ของคุณ</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Avatar upload */}
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

                    {/* Name */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-text-muted">ชื่อที่แสดง</label>
                        <input
                            value={registerData.name}
                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                            placeholder="ชื่อของคุณ"
                            type="text"
                            className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border placeholder-[#c4b8f0] focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                    </div>

                    {/* BirthDate */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-text-muted">วันเกิด</label>
                        <input
                            value={registerData.birthDate}
                            onChange={(e) => setRegisterData({ ...registerData, birthDate: e.target.value })}
                            type="date"
                            className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!isValid}
                        className={`w-full py-3 rounded-xl font-medium text-sm transition-colors
                            ${isValid ? 'bg-primary text-white hover:bg-[#6a5eb5]' : 'bg-card-border text-text-muted cursor-not-allowed'}`}
                    >
                        สมัครสมาชิก
                    </button>

                </form>
            </div>
        </div>
    )
}