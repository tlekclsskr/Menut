const request = require('supertest')
const app = require('../index')

describe('Groups Routes', () => {

    let token

    beforeAll(async () => {
        // สร้าง user และ login ก่อน
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
        token = res.body.token
    })

    describe('POST /groups', () => {
        it('should create a group', async () => {
            const res = await request(app)
                .post('/groups')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Test Group' })
            expect(res.status).toBe(201)
            expect(res.body).toHaveProperty('id')
            expect(res.body.name).toBe('Test Group')
        })

        it('should fail without auth', async () => {
            const res = await request(app)
                .post('/groups')
                .send({ name: 'Test Group' })
            expect(res.status).toBe(401)
        })
    })

    describe('GET /groups', () => {
        it('should return groups list', async () => {
            const res = await request(app)
                .get('/groups')
                .set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(200)
            expect(Array.isArray(res.body)).toBe(true)
        })
    })
})