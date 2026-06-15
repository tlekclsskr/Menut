'use client'

import { useState } from "react"

import { useRegister } from "@/src/context/RegisterContext"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"
import { fetchAPI } from "@/src/lib/api"

export default function OnboardingPage() {
    const [registerData, setRegisterData] = useState({
        name: '',
        birthDate: '',
        imageUrl: ''
    })
    const [file, setFile] = useState(null)
    const isValid = registerData.name && registerData.birthDate

    const { registerData: contextData } = useRegister()
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()

        let imageUrl = ''

        if  (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, file)

            if  (error) {
                console.log(error)
                return
            }

            imageUrl = supabase.storage
                .from('avatars')
                .getPublicUrl(data.path).data.publicUrl

        }
        
        try {
            const result = await fetchAPI('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    email: contextData.email,
                    password: contextData.password,
                    name: registerData.name,
                    birthDate: registerData.birthDate,
                    imageUrl
                })
            })
            router.push('/login')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <input
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="name"
                    type="text" 
                />
                <input
                    value={registerData.birthDate}
                    onChange={(e) => setRegisterData({ ...registerData, birthDate: e.target.value })}
                    type="date" 
                />
                <button type="submit" disabled={!isValid}>สร้าง Profile</button>
            </form>
        </div>
    )
}