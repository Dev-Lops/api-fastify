import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npx knex migrate:rollback --all')
    execSync('npx knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    const response = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)

    expect(response.body).toEqual({})
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)

    const cookies = createTransactionResponse.get('Set-Cookie')

    expect(cookies).toBeDefined()
    expect(cookies!.length).toBeGreaterThan(0)

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies![0])
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toBeInstanceOf(Array)
    expect(listTransactionsResponse.body.transactions.length).toBeGreaterThan(0)

    expect(listTransactionsResponse.body.transactions[0]).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      }),
    )
  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)

    const cookies = createTransactionResponse.get('Set-Cookie')

    expect(cookies).toBeDefined()
    expect(cookies!.length).toBeGreaterThan(0)

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies![0])
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies![0])
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        id: transactionId,
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 4000,
        type: 'credit',
      })
      .expect(201)
    const cookies = createTransactionResponse.get('Set-Cookie')
    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies![0])
      .send({
        title: 'Debit transaction',
        amount: 1000,
        type: 'debit',
      })
      .expect(201)
    expect(cookies).toBeDefined()
    expect(cookies!.length).toBeGreaterThan(0)
    // 🚀 Ajustando a rota, garantindo que ela existe
    const summaryResponse = await request(app.server)
      .get('/transactions/summary') // Ajuste se necessário para apenas '/summary'
      .set('Cookie', cookies![0])
      .expect(200)
    // ✅ Removendo a validação errada de "transactions"
    expect(summaryResponse.body).toEqual({
      summary: {
        amount: 3000, // 4000 (credit) - 1000 (debit) = 3000
      },
    })
  })
})
