import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    // Criando uma nova transação antes de listar
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    // Capturando os cookies para manter a sessão
    const cookies = createTransactionResponse.get('Set-Cookie')

    // 🔥 Verifica se os cookies foram realmente retornados
    expect(cookies).toBeDefined()
    expect(cookies!.length).toBeGreaterThan(0)

    // Fazendo a requisição para listar as transações
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies![0]) // ✅ Passando apenas o primeiro cookie
      .expect(200) // ✅ Esperando 200 em vez de 201

    // Verifica se pelo menos uma transação foi retornada
    expect(listTransactionsResponse.body.transactions).toBeInstanceOf(Array)
    expect(listTransactionsResponse.body.transactions.length).toBeGreaterThan(0)

    // Verifica se a transação criada está na lista
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      }),
    ])
  })
})
