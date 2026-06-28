'use client'

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { fetchAPI } from "@/src/lib/api";
import { ButtonSpinner } from "@/src/components/ButtonSpinner";

const ResetPasswordContent = () => {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const router = useRouter()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    const isValid = password && confirmPassword && password === confirmPassword

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try{
            await fetchAPI('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, password })
            })
            setIsSuccess(true)
            setTimeout(() => router.push('/login'), 2000)
        } catch (error) {
            console.log(error)
            setError('ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงค์ใหม่')
        } finally {
            setIsLoading(false)
        }
    }

    const btnPrimary = isValid && !isLoading
        ? 'bg-primary text-white hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/30'
        : 'bg-card-border text-text-muted cursor-not-allowed'

    return (
        <div className="min-h-screen bg-shell flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-card-border">
                <div className="mb-8">
                    <h1 className="text-2xl font-medium text-text-dark">ตั้งรหัสผ่านใหม่</h1>
                    <p className="text-text-muted text-sm mt-1">กรอกรหัสผ่านใหม่ของคุณ</p>
                </div>

                {isSuccess ? (
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-6 text-center">
                        <p className="text-2xl mb-2">✅</p>
                        <p className="text-sm font-medium text-[#166534]">รีเซ็ตรหัสผ่านสำเร็จ!</p>
                        <p className="text-xs text-[#4ade80] mt-1">กำลังพาไปหน้าเข้าสู่ระบบ...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-text-muted">รหัสผ่านใหม่</label>
                            <input
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError('') }}
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-text-muted">ยืนยันรหัสผ่านใหม่</label>
                            <input
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
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
                                    กำลังรีเซ็ต...
                                </div>
                            ) : 'รีเซ็ตรหัสผ่าน'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordContent />
        </Suspense>
    )
}