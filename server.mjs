import { createServer } from 'node:http'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.join(root, 'data')
const dataFile = path.join(dataDirectory, 'requests.json')
const distDirectory = path.join(root, 'dist')
const isDevelopment = process.argv.includes('--dev')
const host = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT || 4173)

let writeQueue = Promise.resolve()

function sendJson(response, status, value) {
  const body = JSON.stringify(value)
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  })
  response.end(body)
}

async function ensureDataFile() {
  await fs.mkdir(dataDirectory, { recursive: true })
  try {
    await fs.access(dataFile)
  } catch {
    await fs.writeFile(dataFile, '[]\n', 'utf8')
  }
}

async function readRequests() {
  await ensureDataFile()
  try {
    const parsed = JSON.parse(await fs.readFile(dataFile, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRequests(requests) {
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    await ensureDataFile()
    await fs.writeFile(dataFile, `${JSON.stringify(requests, null, 2)}\n`, 'utf8')
  })
  return writeQueue
}

function isRequestData(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.id === 'string' &&
      typeof value.recipientName === 'string' &&
      typeof value.intro === 'string' &&
      Array.isArray(value.dates) &&
      Array.isArray(value.times) &&
      Array.isArray(value.activities) &&
      Array.isArray(value.foods) &&
      typeof value.cancellationWarning === 'boolean',
  )
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    let size = 0
    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      size += Buffer.byteLength(chunk)
      if (size > 1024 * 1024) {
        reject(new Error('Request body is too large'))
        request.destroy()
        return
      }
      body += chunk
    })
    request.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Request body must be valid JSON'))
      }
    })
    request.on('error', reject)
  })
}

function networkAddress() {
  for (const interfaces of Object.values(os.networkInterfaces())) {
    const address = interfaces?.find((entry) => entry.family === 'IPv4' && !entry.internal)
    if (address) return address.address
  }
  return 'localhost'
}

async function handleApi(request, response, url) {
  if (url.pathname === '/api/info' && request.method === 'GET') {
    sendJson(response, 200, { networkOrigin: `http://${networkAddress()}:${port}` })
    return true
  }

  const match = url.pathname.match(/^\/api\/requests\/([^/]+)$/)
  if (!match) return false

  const id = decodeURIComponent(match[1])
  const requests = await readRequests()

  if (request.method === 'GET') {
    const value = requests.find((item) => item.id === id)
    if (!value) sendJson(response, 404, { error: 'Request not found' })
    else sendJson(response, 200, value)
    return true
  }

  if (request.method === 'PUT') {
    let value
    try {
      value = await readBody(request)
    } catch (error) {
      sendJson(response, 400, { error: error.message })
      return true
    }
    if (!isRequestData(value) || value.id !== id) {
      sendJson(response, 400, { error: 'Invalid request data' })
      return true
    }
    const next = [...requests.filter((item) => item.id !== id), value]
    await writeRequests(next)
    sendJson(response, 200, value)
    return true
  }

  sendJson(response, 405, { error: 'Method not allowed' })
  return true
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

async function serveStatic(response, pathname) {
  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1)
  let filePath = path.resolve(distDirectory, relativePath)
  if (!filePath.startsWith(`${distDirectory}${path.sep}`)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  try {
    const stats = await fs.stat(filePath)
    if (!stats.isFile()) throw new Error('Not a file')
  } catch {
    filePath = path.join(distDirectory, 'index.html')
  }

  try {
    const body = await fs.readFile(filePath)
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Content-Length': body.length,
    })
    response.end(body)
  } catch {
    response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Run npm run build before starting the production server.')
  }
}

await ensureDataFile()

let vite
if (isDevelopment) {
  const { createServer: createViteServer } = await import('vite')
  vite = await createViteServer({
    appType: 'spa',
    server: { middlewareMode: true },
  })
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
    if (url.pathname.startsWith('/api/')) {
      const handled = await handleApi(request, response, url)
      if (!handled) sendJson(response, 404, { error: 'Not found' })
      return
    }

    if (isDevelopment) {
      vite.middlewares(request, response, () => {
        if (!response.writableEnded) response.end()
      })
      return
    }

    await serveStatic(response, url.pathname)
  } catch (error) {
    if (!response.headersSent) sendJson(response, 500, { error: 'Internal server error' })
    else response.end()
    console.error(error)
  }
})

server.listen(port, host, () => {
  console.log(`Local:   http://localhost:${port}`)
  console.log(`Network: http://${networkAddress()}:${port}`)
  console.log(`Data:    ${dataFile}`)
})
