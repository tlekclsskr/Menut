'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuth({ redirectTo = '/login', redirectIfFound = false } = {}) {
    const router = useRouter()
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')

        if  (!token && !redirectIfFound) {
            router.push(redirectTo)
        } else if (token && redirectIfFound) {
            router.push('/groups')
        } else {
            setIsReady(true)
        }
    }, [])

    return isReady
}