'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "@/src/lib/api"

export default function LoginPage() {
    const router = useRouter()
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    })
    const isValid = loginData.email && loginData.password

    const handleSubmit = async (e) => {
        e.preventDefault()
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
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e8d5f5] via-[#ffd6e7] to-[#ffefc5] flex items-center justify-center p-4">
            
            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#e2d9f3]">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-medium text-[#4a3f6b]">ยินดีต้อนรับกลับ</h1>
                    <p className="text-[#9b8ec4] text-sm mt-1">เข้าสู่ระบบเพื่อดูกลุ่มของคุณ</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#9b8ec4]">อีเมล</label>
                        <input
                            value={loginData.email}
                            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                            type="email"
                            placeholder="example@email.com"
                            className="w-full px-4 py-3 bg-[#f5f2ff] text-[#4a3f6b] rounded-xl border border-[#e2d9f3] placeholder-[#c4b8f0] focus:outline-none focus:ring-2 focus:ring-[#7c6fcd]/30 text-sm"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#9b8ec4]">รหัสผ่าน</label>
                        <input
                            value={loginData.password}
                            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-[#f5f2ff] text-[#4a3f6b] rounded-xl border border-[#e2d9f3] placeholder-[#c4b8f0] focus:outline-none focus:ring-2 focus:ring-[#7c6fcd]/30 text-sm"
                        />
                    </div>

                    {/* Forgot password */}
                    <div className="flex justify-end -mt-2">
                        <a href="#" className="text-xs text-[#7c6fcd]">ลืมรหัสผ่าน?</a>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!isValid}
                        className={`w-full py-3 rounded-xl font-medium text-sm transition-colors
                            ${isValid ? 'bg-[#7c6fcd] text-white hover:bg-[#6a5eb5]' : 'bg-[#e2d9f3] text-[#9b8ec4] cursor-not-allowed'}`}
                    >
                        เข้าสู่ระบบ
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-[#e2d9f3]"></div>
                        <span className="text-xs text-[#9b8ec4]">หรือ</span>
                        <div className="flex-1 h-px bg-[#e2d9f3]"></div>
                    </div>

                    {/* Register */}
                    <a href="/register" className="w-full py-3 rounded-xl font-medium text-sm text-center text-[#7c6fcd] border border-[#c4b8f0] bg-white hover:bg-[#f5f2ff] transition-colors">
                        สมัครสมาชิก
                    </a>

                    <p className="text-center text-xs text-[#9b8ec4]">
                        ยังไม่มีบัญชี?{' '}
                        <a href="/register" className="text-[#7c6fcd] font-medium">สมัครฟรี</a>
                    </p>

                </form>
            </div>
        </div>
    )
}