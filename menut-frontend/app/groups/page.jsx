'use client'

import { fetchAPI } from '@/src/lib/api'
import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function GroupsPage() {
    const [groupLists, setGroupLists] = useState([])
    const [inviteCode, setInviteCode] = useState('')
    const [file, setFile] = useState(null)
    const [addGroupData, setAddGroupData] = useState({
        name: ''
    })
    
    const fetchGroups = async () => {
            try {
                const groups = await fetchAPI('/groups')
                setGroupLists(groups)
            } catch (error) {
                console.log(error)
            }
        }

    const handleJoin = async (e) => {
        e.preventDefault()
        try {
            await fetchAPI('/groups/join', {
                method: 'POST',
                body: JSON.stringify({ inviteCode })
            })
            fetchGroups()
        } catch (error) {
            console.log(error)
        }
    }

    const handleCopy = (inviteCode) => {
        navigator.clipboard.writeText(inviteCode)
        alert('Copied')
    }

    const handleCreate = async (e) => {
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
            await fetchAPI('/groups', {
                method: 'POST',
                body: JSON.stringify({
                    name: addGroupData.name,
                    imageUrl
                })
            })
            fetchGroups()
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    return (
        <div>
            {groupLists.map((group) => (
                <div key={group.id}>
                    <p>{group.name}</p>
                    <button 
                        onClick={() => handleCopy(group.inviteCode)}
                        className='cursor-pointer'
                    >🔗
                    </button>
                </div>
            ))}
            <form onSubmit={handleJoin}>
                <input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Invite Code" 
                />
                <button type='submit'>Join</button>
            </form>
            <form onSubmit={handleCreate}>
                <input
                    value={addGroupData.name}
                    onChange={(e) => setAddGroupData({ ...addGroupData, name: e.target.value })}
                    type='text'
                    placeholder='Group name'
                />
                <input
                    type="file"
                    accept='image/*'
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <button type='submit'>Create Group</button>
            </form>
        </div>
    )
}