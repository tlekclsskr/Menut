'use client'

import { useEffect, useState } from "react"
import { useRegister } from "@/src/context/RegisterContext"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"
import { fetchAPI } from "@/src/lib/api"
import { ButtonSpinner } from "@/src/components/ButtonSpinner"

export default function OnboardingPage() {
    const [registerData, setRegisterData] = useState({
        name: '',
        birthDate: '',
    })
    const [file, setFile] = useState(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const isValid = registerData.name && registerData.birthDate

    const { registerData: contextData } = useRegister()
    const router = useRouter()

    useEffect(() => {
        if (!contextData.email || !contextData.password) {
            router.push('/register')
        }
    }, [contextData.email, contextData.password, router])

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
        } catch {
            setError('สมัครสมาชิกไม่สำเร็จ ลองใหม่อีกครั้ง')
        } finally {
            setIsLoading(false)
        }
    }

    const btnPrimary = isValid && !isLoading
        ? 'bg-primary text-white hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/30'
        : 'bg-card-border text-text-muted cursor-not-allowed'

    return (
        <div className="min-h-screen bg-shell flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#2a2445] rounded-3xl p-8 border border-card-border">
                <div className="flex gap-2 mb-6" aria-label="ขั้นตอนที่ 2 จาก 2">
                    <div className="w-3 h-3 rounded-full bg-card-border" aria-hidden="true" />
                    <div className="w-5 h-3 rounded-full bg-primary" aria-hidden="true" />
                </div>

                <div className="mb-8">
                    <h1 className="text-2xl font-medium text-text-dark">บอกเราเพิ่มเติม</h1>
                    <p className="text-text-muted text-sm mt-1">ตั้งค่าโปรไฟล์ของคุณ</p>
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
                        <label htmlFor="onboarding-name" className="text-sm text-text-muted">ชื่อที่แสดง</label>
                        <input
                            id="onboarding-name"
                            value={registerData.name}
                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                            placeholder="ชื่อของคุณ"
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="onboarding-birthdate" className="text-sm text-text-muted">วันเกิด</label>
                        <input
                            id="onboarding-birthdate"
                            value={registerData.birthDate}
                            onChange={(e) => setRegisterData({ ...registerData, birthDate: e.target.value })}
                            type="date"
                            required
                            className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                    </div>

                    {error && (
                        <p className="text-error text-sm text-center" role="alert">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={!isValid || isLoading}
                        className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${btnPrimary}`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <ButtonSpinner />
                                {file ? 'กำลังอัปโหลด...' : 'กำลังสมัคร...'}
                            </div>
                        ) : 'สมัครสมาชิก'}
                    </button>
                </form>
            </div>
        </div>
    )
}
