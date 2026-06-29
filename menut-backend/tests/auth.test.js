const request = require('supertest')
const app = require('../index')

describe('Auth Routes', () => {

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    email: `test_${Date.now()}@test.com`,
                    password: 'password123',
                    name: 'Test User',
                    birthDate: '2000-01-01'
                })
            expect(res.status).toBe(201)
            expect(res.body).toHaveProperty('userId')
        })

        it('should fail if email already exists', async () => {
            const email = `test_${Date.now()}@test.com`
            await request(app).post('/auth/register').send({
                email,
                password: 'password123',
                name: 'Test User',
                birthDate: '2000-01-01'
            })
            const res = await request(app).post('/auth/register').send({
                email,
                password: 'password123',
                name: 'Test User',
                birthDate: '2000-01-01'
            })
            expect(res.status).toBe(400)
        })
    })

    describe('POST /auth/login', () => {
        it('should login successfully', async () => {
            const email = `test_${Date.now()}@test.com`
            await request(app).post('/auth/register').send({
                email,
                password: 'password123',
                name: 'Test User',
                birthDate: '2000-01-01'
            })
            const res = await request(app).post('/auth/login').send({
                email,
                password: 'password123'
            })
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('token')
        })

        it('should fail with wrong password', async () => {
            const res = await request(app).post('/auth/login').send({
                email: 'notexist@test.com',
                password: 'wrongpassword'
            })
            expect(res.status).toBe(401)
        })
    })
})