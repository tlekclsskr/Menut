const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || "mysecretkey"

module.exports = function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]

    if  (!token) {
        return res.status(401).json({ message: "กรุณา login ก่อน" })
    }

    try {
        const decode = jwt.verify(token, SECRET)
        req.userId = decode.userId
        next()
    } catch (error) {
        return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" })
    }
}