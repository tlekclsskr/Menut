'use client'

import { useState } from "react";
import { useRouter} from "next/navigation"
import { fetchAPI } from "@/src/lib/api";

export default function LoginPage() {
    const router = useRouter()

    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    })
    const isValid = loginData.email 
        && loginData.password

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
        <div>
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    type="email"
                    placeholder="Email"
                />
                <label>Password</label>
                <input
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    type="password"
                    placeholder="Password" 
                />
                <button type="submit" disabled={!isValid}>ล็อคอินเข้าสู่ระบบ</button>
            </form>
        </div>
    )
}