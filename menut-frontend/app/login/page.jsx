'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "@/src/lib/api"
import { useAuth } from "@/src/hooks/useAuth"
import { ButtonSpinner } from "@/src/components/ButtonSpinner"

export default function LoginPage() {

    useAuth({ redirectIfFound: true })

    const router = useRouter()
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const isValid = loginData.email && loginData.password

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const result = await fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: loginData.email,
                    password: loginData.password
                })
            })
            localStorage.setItem('token', result.token)
            router.push('/groups')
        } catch {
            setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
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
                    <h1 className="text-2xl font-medium text-text-dark">ยินดีต้อนรับกลับ</h1>
                    <p className="text-text-muted text-sm mt-1">เข้าสู่ระบบเพื่อดูกลุ่มของคุณ</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="login-email" className="text-sm text-text-muted">อีเมล</label>
                        <input
                            id="login-email"
                            value={loginData.email}
                            onChange={(e) => { setLoginData({...loginData, email: e.target.value}); setError('') }}
                            type="email"
                            autoComplete="email"
                            placeholder="example@email.com"
                            className="w-full px-4 py-3 bg-input-bg text-text-dark rounded-xl border border-card-border placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="login-password" className="text-sm text-text-muted">รหัสผ่าน</label>
                        <input
                            id="login-password"
                            value={loginData.password}
                            onChange={(e) => { setLoginData({...loginData, password: e.target.value}); setError('') }}
                            type="password"
                            autoComplete="current-password"
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
                                กำลังโหลด...
                            </div>
                        ) : 'เข้าสู่ระบบ'}
                        </button>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-card-border" />
                        <span className="text-xs text-text-muted">หรือ</span>
                        <div className="flex-1 h-px bg-card-border" />
                    </div>

                    <a
                        href="/register"
                        className="w-full py-3 rounded-xl font-medium text-sm text-center text-primary border border-border-accent bg-white hover:bg-input-bg transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                        สมัครสมาชิก
                    </a>

                    <p className="text-center text-xs text-text-muted">
                        ยังไม่มีบัญชี?{' '}
                        <a href="/register" className="text-primary font-medium hover:underline">สมัครฟรี</a>
                    </p>
                </form>
            </div>
        </div>
    )
}
