'use client'

import { useRegister } from "@/src/context/RegisterContext"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
    const [registerData, setRegisterData] = useState({
        email: '',
        password: '',
        retypedPassword: ''
    })
    const [isCheck, setIsCheck] = useState(false)
    const isValid = registerData.email 
        && registerData.password 
        && registerData.password === registerData.retypedPassword
        && isCheck
    
    const router = useRouter()
    const { registerData: contextData, setRegisterData: setContextData } = useRegister() 

    const handleSubmit = (e) => {
        e.preventDefault()

        setContextData({
            ...contextData,
            email: registerData.email,
            password: registerData.password
        })

        router.push('/onboarding')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e8d5f5] via-[#ffd6e7] to-[#ffefc5] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#e2d9f3]">

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#4a3f6b]">สร้างบัญชีใหม่</h1>
                    <p className="text-[#9b8ec4] text-sm mt-1">เริ่มนัดเจอกันได้เลย</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#9b8ec4]">อีเมล</label>
                        <input
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            placeholder="example@email.com"
                            type="email"
                            className="w-full px-4 py-3 bg-[#f5f2ff] text-[#4a3f6b] rounded-xl border-[#e2d9f3] placeholder-[#c4b8f0] focus:outline-none focus:ring-2 focus:ring-[#7c6fcd]/30 text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#9b8ec4]">รหัสผ่าน</label>
                        <input
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            placeholder="••••••••"
                            type="password"
                            className="w-full px-4 py-3 bg-[#f5f2ff] text-[#4a3f6b] rounded-xl border-[#e2d9f3] placeholder-[#c4b8f0] focus:outline-none focus:ring-2 focus:ring-[#7c6fcd]/30 text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#9b8ec4]">ยืนยันรหัสผ่าน</label>
                        <input
                            value={registerData.retypedPassword}
                            onChange={(e) => setRegisterData({ ...registerData, retypedPassword: e.target.value })}
                            placeholder="••••••••"
                            type="password"
                            className="w-full px-4 py-3 bg-[#f5f2ff] text-[#4a3f6b] rounded-xl border-[#e2d9f3] placeholder-[#c4b8f0] focus:outline-none focus:ring-2 focus:ring-[#7c6fcd]/30 text-sm"
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            checked={isCheck}
                            onChange={(e) =>  setIsCheck(e.target.checked)}
                            type="checkbox"
                            className="w-4 h-4 accent-[#7c6fcd]"
                        />
                        <span className="text-sm text-[#9b8ec4]">ฉันยอมรับเงื่อนไขการใช้งาน</span>
                    </label>
                    <button 
                        type='submit' 
                        disabled={!isValid}
                        className={`w-full py-3 rounded-xl font-medium text-sm transition-colors
                           ${isValid ? 'bg-[#7c6fcd] text-white hover:bg-[#6a5eb5]' : 'bg-[#e2d9f3] text-[#9b8ec4] cursor-not-allowed'}`}
                    >
                        สร้างบัญชี
                    </button>
                </form>
                
                <p className="text-center text-xs text-[#9b8ec4] mt-8">
                    มีบัญชีแล้ว?{' '}
                    <a href="/login" className="text-[#7c6fcd] font-medium">เข้าสู่ระบบ</a>
                </p>
            </div>
        </div>
    )
}   