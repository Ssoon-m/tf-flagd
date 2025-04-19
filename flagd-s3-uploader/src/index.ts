import fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

dotenv.config()

const server = fastify({ logger: true })

server.register(cors, {
  origin: [process.env.FRONTEND_ORIGIN || 'http://localhost:5173'],
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
})

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
const BUCKET = process.env.S3_BUCKET!

server.get('/ping', async (request, reply) => {
  console.log("env",process.env.AWS_ACCESS_KEY_ID);
  console.log("env",process.env.AWS_SECRET_ACCESS_KEY);
  console.log("env",process.env.S3_REGION);
  console.log("env",process.env.S3_BUCKET);
  return reply.status(200).send({ message: 'Pong' })
})

server.get('/flagd/feature-flags', async (req, reply) => {
  const res = await s3.send(new GetObjectCommand({
    Bucket: BUCKET,
    Key: 'demo.flagd.json'
  }))
  const body = await new Response(res.Body as any).text()
  return reply.send(JSON.parse(body))
})

server.post('/flagd/feature-flags', async (request, reply) => {
  const { payload } = request.body as {  payload: string }

  if (!payload) {
    return reply.status(400).send({ error: 'Missing payload' })
  }

  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: 'demo.flagd.json',
      Body: payload,
      ContentType: 'application/json',
    }))
    return reply.status(200).send({ message: 'Upload successful' })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Upload to S3 failed' })
  }
})

// 서버 시작
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 8080
    await server.listen({ port, host: '0.0.0.0' })
    server.log.info(`Server listening on http://localhost:${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
