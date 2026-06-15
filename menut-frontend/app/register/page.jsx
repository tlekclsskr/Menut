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
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="Email"
                    type="email"
                />
                <input
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Password"
                    type="password"
                />
                <input
                    value={registerData.retypedPassword}
                    onChange={(e) => setRegisterData({ ...registerData, retypedPassword: e.target.value })}
                    placeholder="Re-type Password"
                    type="password"
                />
                <label>
                    <input
                        checked={isCheck}
                        onChange={(e) =>  setIsCheck(e.target.checked)}
                        type="checkbox"
                    />ฉันยอมรับเงื่อนไขการใช้งาน
                </label>
                <button type='submit' disabled={!isValid}>สร้างบัญชี
                </button>
            </form>
        </div>
    )
}   