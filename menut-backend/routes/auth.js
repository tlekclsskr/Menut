const prisma = require('../prisma/client')
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { Resend } = require('resend')
const { v4:uuidv4 } = require('uuid')

const resend = new Resend(process.env.RESEND_API_KEY)
const SECRET = process.env.JWT_SECRET || "mysecretkey"

const authMiddleware = require('../middleware/auth')

const router = express.Router()

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
            return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" })
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

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body
    try {
        const user = await prisma.user.findUnique({ where: { email } })

        if  (!user) {
            return res.status(200).json({ message: 'หากมีบัญชีนี้อยู่ ระบบจะส่งอีเมลให้' })
        }

        const token = uuidv4()
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

        await prisma.passwordReset.create({
            data: { userId: user.id, token, expiresAt }
        })

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

        await resend.emails.send({
            from: 'Menut <onboarding@resend.dev>',
            to: email,
            subject: 'รีเซ็ตรหัสผ่าน Menut',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin:0;padding:0;background-color:#fdf6ff;font-family:'Helvetica Neue',Arial,sans-serif;">
                    <div style="max-width:480px;margin:40px auto;padding:20px;">
                        
                        <!-- Logo -->
                        <div style="text-align:center;margin-bottom:32px;">
                            <h1 style="color:#7c6fcd;font-size:28px;font-weight:700;margin:0;letter-spacing:-0.5px;">Menut</h1>
                            <p style="color:#9b8ec4;font-size:12px;margin:4px 0 0;">MEET-UP POSSIBLE</p>
                        </div>

                        <!-- Card -->
                        <div style="background:#ffffff;border-radius:24px;padding:40px;border:1px solid #e2d9f3;box-shadow:0 4px 24px rgba(124,111,205,0.08);">
                            <h2 style="color:#4a3f6b;font-size:20px;font-weight:600;margin:0 0 8px;">รีเซ็ตรหัสผ่าน</h2>
                            <p style="color:#9b8ec4;font-size:14px;margin:0 0 24px;">สวัสดี <strong style="color:#4a3f6b;">${user.name}</strong>!</p>
                            
                            <p style="color:#6b5f8a;font-size:14px;line-height:1.6;margin:0 0 32px;">
                                เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี Menut ของคุณ กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
                            </p>

                            <!-- Button -->
                            <div style="text-align:center;margin-bottom:32px;">
                                <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#7c6fcd,#a78bfa);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:14px;font-size:15px;font-weight:600;letter-spacing:0.2px;">
                                    รีเซ็ตรหัสผ่าน →
                                </a>
                            </div>

                            <!-- Expiry notice -->
                            <div style="background:#f5f2ff;border-radius:12px;padding:12px 16px;margin-bottom:24px;">
                                <p style="color:#7c6fcd;font-size:13px;margin:0;text-align:center;">
                                    ⏱ ลิงก์นี้จะหมดอายุใน <strong>30 นาที</strong>
                                </p>
                            </div>

                            <p style="color:#c4b8f0;font-size:12px;margin:0;text-align:center;line-height:1.6;">
                                หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้<br/>บัญชีของคุณจะยังคงปลอดภัย
                            </p>
                        </div>

                        <!-- Footer -->
                        <p style="text-align:center;color:#c4b8f0;font-size:12px;margin-top:24px;">
                            © 2026 Menut · Web application สำหรับคน "มีนัด"
                        </p>
                    </div>
                </body>
                </html>
            `
        })

        res.status(200).json({ message: 'หากมีบัญชีนี้อยู่ ระบบจะส่งอีเมลให้' })
    } catch (error) {
        res.status(500).json({ message: 'Server Error' })
    }
})

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body
    try {
        const resetRecord = await prisma.passwordReset.findUnique({ where: { token } })

        if  (!resetRecord || resetRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: 'ลิงค์หมดอายุหรือไม่ถูกต้อง' })
        }

        const hashed = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { id: resetRecord.userId },
            data: { password: hashed }
        })

        await prisma.passwordReset.delete({ where: { token } })

        res.status(200).json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ' })

    } catch (error) {
        res.status(500).json({ message: 'Server Error' })
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