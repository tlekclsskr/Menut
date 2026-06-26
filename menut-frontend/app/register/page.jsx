'use client'

import { useRegister } from "@/src/context/RegisterContext"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "@/src/lib/api"

export default function RegisterPage() {
    const [registerData, setRegisterData] = useState({
        email: '',
        password: '',
        retypedPassword: ''
    })
    const [isCheck, setIsCheck] = useState(false)
    const [error, setError] = useState('')
    const isValid = registerData.email 
        && registerData.password 
        && registerData.password === registerData.retypedPassword
        && isCheck
    
    const router = useRouter()
    const { registerData: contextData, setRegisterData: setContextData } = useRegister() 

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const { exists } = await fetchAPI(`/auth/check-email?email=${registerData.email}`)
        if (exists) {
            setError('อีเมลนี้มีผู้ใช้งานแล้ว กรุณาใช้อีเมลอื่น')
            return
        }

        setContextData({
            ...contextData,
            email: registerData.email,
            password: registerData.password
        })

        router.push('/onboarding')
    }

    const btnPrimary = isValid
        ? 'bg-primary text-white hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/30'
        : 'bg-card-border text-text-muted cursor-not-allowed'

    return (
        <div className="min-h-screen bg-shell flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-card-border">
                <div className="mb-8">
                    <h1 className="text-2xl font-medium text-text-dark">สร้างบัญชีใหม่</h1>
                    <p className="text-text-muted text-sm mt-1">เริ่มนัดเจอกันได้เลย</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="register-email" className="text-sm text-text-muted">อีเมล</label>
                        <input
                            id="register-email"
                            value={registerData.email}
                            onChange={(e) => { setRegisterData({ ...registerData, email: e.target.value }); setError('') }}
                            placeholder="example@email.com"
                            type="email"
                            autoComplete="email"
                            className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="register-password" className="text-sm text-text-muted">รหัสผ่าน</label>
                        <input
                            id="register-password"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            placeholder="••••••••"
                            type="password"
                            autoComplete="new-password"
                            className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="register-password-confirm" className="text-sm text-text-muted">ยืนยันรหัสผ่าน</label>
                        <input
                            id="register-password-confirm"
                            value={registerData.retypedPassword}
                            onChange={(e) => setRegisterData({ ...registerData, retypedPassword: e.target.value })}
                            placeholder="••••••••"
                            type="password"
                            autoComplete="new-password"
                            className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            checked={isCheck}
                            onChange={(e) => setIsCheck(e.target.checked)}
                            type="checkbox"
                            className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm text-text-muted">ฉันยอมรับเงื่อนไขการใช้งาน</span>
                    </label>
                    {error && <p className="text-error text-sm text-center" role="alert">{error}</p>}
                    <button 
                        type="submit" 
                        disabled={!isValid}
                        className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${btnPrimary}`}
                    >
                        ถัดไป →
                    </button>
                </form>
                
                <p className="text-center text-xs text-text-muted mt-8">
                    มีบัญชีแล้ว?{' '}
                    <a href="/login" className="text-primary font-medium hover:underline">เข้าสู่ระบบ</a>
                </p>
            </div>
        </div>
    )
}
