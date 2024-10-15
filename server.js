import express from 'express'
import { ruruHTML } from 'ruru/server'

import { createYoga } from 'graphql-yoga'
import { schema } from './src/graphQL/index.js'

import * as dotenv from 'dotenv'
import { setupDatabase } from './src/mongoDB/db.js'

dotenv.config()

const port = 3000
const app = express()

const yoga = createYoga({
  schema,
  context: async () => {
    const mongo = await setupDatabase()
    return {
      mongo,
    }
  },
})

app.all('/graphql', yoga)

app.get('/', (req, res) => {
  res.type('html')
  res.end(ruruHTML({ endpoint: '/graphql' }))
})

app.listen(port, () => {
  console.log('server is running.......')
  console.log(`test: http://localhost:3000/graphql`)
})
