const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function fetchAPI( endpoint, options = {} ) {
    const token = localStorage.getItem('token')

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        ...options
    })

    const data = await res.json()

    if  (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
    }

    return data
}