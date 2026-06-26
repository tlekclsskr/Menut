const prisma = require('../prisma/client')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const SECRET = process.env.JWT_SECRET || "mysecretkey"
const authMiddleware = require('../middleware/auth')

router.post('/register', async (req, res) => {
    const { email, password, name, birthDate, imageUrl } = req.body

    if  (!email || !password || !name || !birthDate) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" })
    }

    try {
        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
            data: {
                email, 
                password: hashPassword, 
                name, 
                birthDate: new Date(birthDate), 
                imageUrl
            }
        })
        res.status(201).json({ message: "สมัครสมาชิกสำเร็จ", userId: newUser.id })
    } catch (error) {
        return res.status(400).json({ message: "Email นี้มีอยู่แล้ว" })
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    if  (!email || !password) {
        return res.status(400).json({ message: "กรุณากรอก email และ password" })
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } })
        
        if  (!user) {
            return res.status(404).json({ message: "ไม่พบ user นี้" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if  (!isMatch) {
            return res.status(401).json({ message: "password ไม่ถูกต้อง" })
        }

        const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1d'})
        res.status(200).json({ token })
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userProfile = await prisma.user.findUnique({ 
            where: { id: req.userId },
            select: { 
                id: true,
                email: true,
                name: true,
                imageUrl: true,
                birthDate: true,
                createdAt: true
            } 
        })
        res.status(200).json(userProfile)
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

router.get('/check-email', async (req, res) => {
    const { email } = req.query

    if  (!email) {
        return res.status(400).json({ message: "กรุณาส่ง email" })
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } })
        res.status(200).json({ exists: !!user })
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

router.put('/profile', authMiddleware, async (req, res) => {
    const { name, imageUrl } = req.body

    if  (!name && !imageUrl) {
        return res.status(400).json({ message: "กรุณากรอกชื่อหรือเลือกรูปภาพ" })
    }

    try {
        const user = await prisma.user.update({ 
            where: { id: req.userId },
            data: {
                name, imageUrl
            },
            select: { 
                id: true,
                name: true,
                imageUrl: true,
            } 
         })
         res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

router.delete('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.delete({
            where: { id: req.userId }
        })
        res.status(200).json({
            message: "ลบบัญชีสำเร็จ"
        })
    } catch(error) {
        return res.status(500).json({ message: "Server Error" })
    }
})

module.exports = router