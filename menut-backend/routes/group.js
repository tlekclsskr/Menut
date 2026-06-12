const express = require('express')
const prisma = require('../prisma/client')
const router = express.Router()
const crypto = require('crypto')

const authMiddleware = require('../middleware/auth')
const { group } = require('console')

// GET METHOD
router.get('/', async (req, res) => {
    try {
        const groups = await prisma.groupMember.findMany({
            where: { userId: req.userId },
            include: { group: true }
        })
        res.status(200).json(groups.map(m => m.group))
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

router.get('/:id', async (req, res) => {
    const id = Number(req.params.id)
    try {
        const group = await prisma.groupMember.findFirst({ 
            where: { userId: req.userId, groupId: id },
            include: { group: true }
        })

        if  (!group) {
            return res.status(404).json({ message: "ไม่พบกลุ่มนี้" })
        }

        res.status(200).json(group.group)
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

router.get('/:id/members', async (req, res) => {
    const id = Number(req.params.id)
    try {
        const members = await prisma.groupMember.findMany({
            where: { groupId: id },
            select: { 
                id: true,
                role: true,
                user: {
                    select: { id: true, name: true, imageUrl: true }
                }
            }
        })

        if  (members.length === 0) {
            return res.status(404).json({ message: "ไม่พบกลุ่มนี้" })
        }

        res.status(200).json(members)
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

// POST METHOD
router.post('/', async (req, res) => {
    const { name, imageUrl } = req.body

    if  (!name) {
        return res.status(400).json({ message: "กรุณากรอกชื่อกลุ่ม" })
    }

    try {
        const inviteCode = crypto.randomBytes(3).toString('hex')
        const newGroup = await prisma.group.create({
            data: {
                name, 
                imageUrl,
                inviteCode,
                members: {
                    create: {
                        userId: req.userId,
                        role: "admin"
                    }
                }
            },
            select: {
                id: true,
                name: true,
                imageUrl: true,
                inviteCode: true
            }            
        })
        res.status(201).json(newGroup)
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

router.post('/join', async (req, res) => {
    const { inviteCode } = req.body
    try {
        const group = await prisma.group.findUnique({
            where: { inviteCode }
        })

        if  (!group) {
            return res.status(404).json({ message: "ไม่พบกลุ่มนี้"})
        }

        const existing = await prisma.groupMember.findFirst({
            where: {
                groupId: group.id, 
                userId: req.userId
            }
        })

        if  (existing) {
            return res.status(400).json({ message: "คุณเป็นสมาชิกอยู่แล้ว" })
        }

        const joinedMember = await prisma.groupMember.create({ 
            data: {
                userId: req.userId,
                groupId: group.id,
                role: "member"
            }
        })

        res.status(200).json({ message: "เข้าร่วมกลุ่มสำเร็จ" })
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

// PUT METHOD
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id)
    const { name, imageUrl } = req.body

    if  (!name) {
        return res.status(400).json({ message: "กรุณากรอกชื่อหรือเลือกรูปภาพ" })
    }

    try {
        const isFound = await prisma.group.findUnique({ where: { id } })

        if  (!isFound) {
            return res.status(404).json({ message: "ไม่พบกลุ่มนี้" })
        }

        const member = await prisma.groupMember.findFirst({
            where: { groupId: id, userId: req.userId }
        })

        if  (!member) {
            return res.status(403).json({ message: "คุณไม่ได้อยู่ในกลุ่มนี้" })
        }

        const updateGroup = await prisma.group.update({
            where: { id },
            data: { name, imageUrl },
            select: { id: true, name: true, imageUrl: true }
        })

        res.status(200).json(updateGroup)
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

// DELETE METHOD
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id)
    try {
        const group = await prisma.group.findUnique({ where: { id } })
        if  (!group) {
            return res.status(404).json({ "message": "ไม่พบกลุ่มนี้" })
        }

        const memberRole = await prisma.groupMember.findFirst({
            where: { groupId: id, userId: req.userId }, 
            select: { role: true }
        })

        if  (memberRole.role !== 'admin') {
            return res.status(403).json({ message: "คุณไม่มีสิทธิ์ลบกลุ่มนี้" })
        }

        const deleteGroup = await prisma.group.delete({ where: { id } })
        res.status(200).json({ message: "ลบกลุ่มสำเร็จ" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server Error" })
    }
})

module.exports = router
