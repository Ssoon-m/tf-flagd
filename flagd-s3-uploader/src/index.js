"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_s3_1 = require("@aws-sdk/client-s3");
dotenv_1.default.config();
const server = (0, fastify_1.default)({ logger: true });
server.register(cors_1.default, {
    origin: [process.env.FRONTEND_ORIGIN || 'http://localhost:5173'],
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
});
const s3 = new client_s3_1.S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const BUCKET = process.env.S3_BUCKET;
server.get('/ping', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("env", process.env.AWS_ACCESS_KEY_ID);
    console.log("env", process.env.AWS_SECRET_ACCESS_KEY);
    console.log("env", process.env.S3_REGION);
    console.log("env", process.env.S3_BUCKET);
    return reply.status(200).send({ message: 'Pong' });
}));
server.get('/flagd/feature-flags', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield s3.send(new client_s3_1.GetObjectCommand({
        Bucket: BUCKET,
        Key: 'demo.flagd.json'
    }));
    const body = yield new Response(res.Body).text();
    return reply.send(JSON.parse(body));
}));
server.post('/flagd/feature-flags', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { payload } = request.body;
    if (!payload) {
        return reply.status(400).send({ error: 'Missing payload' });
    }
    try {
        yield s3.send(new client_s3_1.PutObjectCommand({
            Bucket: BUCKET,
            Key: 'demo.flagd.json',
            Body: payload,
            ContentType: 'application/json',
        }));
        return reply.status(200).send({ message: 'Upload successful' });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'Upload to S3 failed' });
    }
}));
// 서버 시작
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const port = Number(process.env.PORT) || 8080;
        yield server.listen({ port, host: '0.0.0.0' });
        server.log.info(`Server listening on http://localhost:${port}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
});
start();
