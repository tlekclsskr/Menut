const express = require('express')
const prisma = require('../prisma/client')
const router = express.Router()

// GET METHOD
router.get('/:groupId', async (req, res) => {
    const groupId = Number(req.params.groupId)
    try {
        const member = await prisma.groupMember.findFirst({
            where: { groupId, userId: req.userId }
        })

        if  (!member) {
            return res.status(404).json({ message: "ไม่พบกลุ่มนี้" })
        }

        const availableDate = await prisma.availability.findMany({
            where: { groupId },
            select: {
                id: true,
                date: true,
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        const formatted = availableDate.map(a => ({
            ...a,
            date: a.date.toISOString().split('T')[0]
        }))

        res.status(200).json(formatted)
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

// POST METHOD
router.post('/', async (req, res) => {
    const { groupId, date } = req.body

    if  (!groupId || !date) {
        return res.status(404).json({ message: "กรุณาระบุวันที่หรือ Group ID" })
    }

    try {
        const member = await prisma.groupMember.findFirst({
            where: { groupId, userId: req.userId }
        })

        if  (!member) {
            return res.status(404).json({ message: "ไม่พบกลุ่มนี้" })
        }

        const availableDate = await prisma.availability.findFirst({
            where: { 
                groupId, 
                userId: req.userId,
                date: new Date(`${date}T00:00:00.000Z`)
            }
        })

        if  (availableDate) {
            return res.status(400).json({ message: "วันนี้มาร์คไว้แล้ว" })
        }

        const newAvailableDate = await prisma.availability.create({
            data: { 
                userId: req.userId,
                groupId, 
                date: new Date(`${date}T00:00:00.000Z`)
            }
        })

        res.status(201).json({ message: "มารควันว่างสำเร็จ" })
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

// DELETE METHOD
router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id)
    try {
        const availableDate = await prisma.availability.findUnique({ where: { id } })
        if  (!availableDate) {
            return res.status(404).json({ "message": "ไม่พบวันว่างนี้" })
        }

        if  (availableDate.userId !== req.userId) {
            return res.status(403).json({ message: "คุณไม่มีสิทธิ์ลบวันว่างนี้" })
        }

        const deleteAvailableDate = await prisma.availability.delete({ where: { id }})
        res.status(200).json({ "message": "ลบวันว่างออกแล้ว" })
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

module.exports = router