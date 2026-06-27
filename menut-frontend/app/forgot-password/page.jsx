'use client'

import { useState } from "react";
import { fetchAPI } from "@/src/lib/api";
import { ButtonSpinner } from "@/src/components/ButtonSpinner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const isValid = email.trim() !== ''

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await fetchAPI('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            })
            setIsSuccess(true)
        } catch(error) {
            console.log(error)
        }
        setIsLoading(false)
    }

    const btnPrimary = isValid && !isLoading
    ? 'bg-primary text-white hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/30'
    : 'bg-card-border text-text-muted cursor-not-allowed'

    return (
        <div className="min-h-screen bg-shell flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-card-border">
                
                <div className="mb-8">
                    <h1 className="text-2xl font-medium text-text-dark">ลืมรหัสผ่าน</h1>
                    <p className="text-text-muted text-sm mt-1">เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณ</p>
                </div>

                {isSuccess ? (
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-6 text-center">
                        <p className="text-2xl mb-2">📬</p>
                        <p className="text-sm font-medium text-[#166534]">ส่งอีเมลแล้ว!</p>
                        <p className="text-xs text-[#4ade80] mt-1">กรุณาเช็ค inbox ของคุณ</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="forgot-email" className="text-sm text-text-muted">อีเมล</label>
                            <input
                                id="forgot-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="example@email.com"
                                className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!isValid || isLoading}
                            className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${btnPrimary}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <ButtonSpinner />
                                    กำลังส่ง...
                                </div>
                            ) : 'ดำเนินการต่อ'}
                        </button>
                        <a href="/login" className="text-center text-xs text-text-muted hover:underline">
                            กลับไปหน้าเข้าสู่ระบบ
                        </a>
                    </form>
                )}
            </div>
        </div>
    )
}