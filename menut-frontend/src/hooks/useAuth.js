'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuth() {
    const router = useRouter()
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if  (!token) {
            router.push('/login')
        } else {
            setIsReady(true)
        }
    }, [])

    return isReady
}