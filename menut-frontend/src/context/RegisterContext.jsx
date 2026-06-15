'use client'

import { createContext, useContext, useState } from 'react'

const RegisterContext = createContext(null)

export function RegisterProvider({ children }) {
    const [registerData, setRegisterData] = useState({
        email: '',
        password: '',
        name: '',
        birthDate: '',
        imageUrl: ''
    })
    
    return (
        <RegisterContext.Provider value={{ registerData, setRegisterData }}>
            { children }
        </RegisterContext.Provider>
    )
}

export function useRegister() {
    return useContext(RegisterContext)
}