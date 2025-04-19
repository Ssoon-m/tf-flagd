import fastify from 'fastify'
import cors from '@fastify/cors'

const server = fastify()

server.get('/ping', async (request, reply) => {
  return { data : 'pong'}
})

server.register(cors, {
  origin:['http://localhost:5173'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
})


server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})