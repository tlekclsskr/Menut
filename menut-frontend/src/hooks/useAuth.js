'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchAPI } from "../lib/api"

export function useAuth({ redirectTo = '/login', redirectIfFound = false } = {}) {
    const router = useRouter()
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const verify = async () => {

            const token = localStorage.getItem('token')

            if (!token) {
                if (!redirectIfFound) router.push(redirectTo)
                else setIsReady(true)
                return
            }

            try {
                await fetchAPI('/auth/profile')
                if (redirectIfFound) {
                    router.push('/groups')
                } else {
                    setIsReady(true)
                }
            } catch {
                localStorage.removeItem('token')
                if (!redirectIfFound) router.push(redirectTo)
                else setIsReady(true)
            }
        }

        verify()
    }, [])

    return isReady
}