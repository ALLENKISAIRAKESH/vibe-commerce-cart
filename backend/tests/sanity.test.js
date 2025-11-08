import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { getDb } from '../db.js'
import fetch from 'node-fetch'

let app
beforeAll(async () => {
  // lazy import app by starting server file in test mode isn't necessary; tests will use endpoints directly via server.js
  await getDb()
})

describe('Sanity', () => {
  it('db opens', async () => {
    const db = await getDb()
    const cnt = await db.get('SELECT COUNT(*) as c FROM products')
    expect(cnt.c).toBeGreaterThanOrEqual(0)
  })
})
