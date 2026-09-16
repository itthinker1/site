// 火山引擎 TTS（豆包语音 V3 双向流式 WebSocket）Netlify Function 代理
// 协议依据：官方《豆包语音_双向流式语音合成WebSocket》PDF + protocols.zip
// 浏览器无法直连（CORS 拦截 + WebSocket API 不能带鉴权头），必须经服务端转发。
// Netlify Functions 不保证 Node 22+（无全局 WebSocket），这里手写最小 WS 客户端，零依赖。
import https from 'node:https'
import crypto from 'node:crypto'

const VOLC_HOST = 'openspeech.bytedance.com'
const VOLC_PATH = '/api/v3/tts/bidirection'

// ---------- V3 二进制协议（与 prototype/demo-server.mjs 保持一致）----------

const EV = {
  StartConnection: 1,
  FinishConnection: 2,
  ConnectionStarted: 50,
  ConnectionFailed: 51,
  ConnectionFinished: 52,
  StartSession: 100,
  CancelSession: 101,
  FinishSession: 102,
  SessionStarted: 150,
  SessionCanceled: 151,
  SessionFinished: 152,
  SessionFailed: 153,
  TaskRequest: 200,
  TTSSentenceStart: 350,
  TTSSentenceEnd: 351,
  TTSResponse: 352,
}

const int32BE = v => { const b = Buffer.alloc(4); b.writeInt32BE(v); return b }
const uint32BE = v => { const b = Buffer.alloc(4); b.writeUInt32BE(v); return b }

function requestFrame(event, sessionId, payloadObj) {
  const parts = [Buffer.from([0x11, 0x14, 0x10, 0x00]), int32BE(event)]
  if (sessionId) {
    const sid = Buffer.from(sessionId, 'utf-8')
    parts.push(uint32BE(sid.length), sid)
  }
  const p = Buffer.from(JSON.stringify(payloadObj), 'utf-8')
  parts.push(uint32BE(p.length), p)
  return Buffer.concat(parts)
}

function parseFrame(buf) {
  const type = buf[1] >> 4
  const flag = buf[1] & 0x0f
  const serialization = buf[2] >> 4
  const compression = buf[2] & 0x0f
  let off = 4 * (buf[0] & 0x0f)

  const msg = { type, flag, serialization, compression }

  if ([0b0001, 0b1001, 0b1100, 0b0010, 0b1011].includes(type) && [0b0001, 0b0011].includes(flag)) {
    msg.sequence = buf.readInt32BE(off); off += 4
  } else if (type === 0b1111) {
    msg.errorCode = buf.readUInt32BE(off); off += 4
  }

  if (flag === 0b0100) {
    msg.event = buf.readInt32BE(off); off += 4
    if (![EV.StartConnection, EV.FinishConnection, EV.ConnectionStarted, EV.ConnectionFailed, EV.ConnectionFinished].includes(msg.event)) {
      const len = buf.readUInt32BE(off); off += 4
      if (len > 0) { msg.sessionId = buf.toString('utf-8', off, off + len); off += len }
    }
    if ([EV.ConnectionStarted, EV.ConnectionFailed, EV.ConnectionFinished].includes(msg.event)) {
      const len = buf.readUInt32BE(off); off += 4
      if (len > 0) { msg.connectId = buf.toString('utf-8', off, off + len); off += len }
    }
  }

  const plen = buf.readUInt32BE(off); off += 4
  msg.payload = buf.subarray(off, off + plen)
  return msg
}

// ---------- 最小 WebSocket 客户端（RFC 6455，仅支持本场景所需子集）----------

async function wsConnect(headers, host = VOLC_HOST, path = VOLC_PATH) {
  return new Promise((resolve, reject) => {
    const key = crypto.randomBytes(16).toString('base64')
    const req = https.request({
      host,
      path,
      method: 'GET',
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'websocket',
        'Sec-WebSocket-Key': key,
        'Sec-WebSocket-Version': 13,
        // 不协商 permessage-deflate，服务端不会压缩，解析零依赖
        ...headers,
      },
    })
    req.setTimeout(10000, () => { req.destroy(new Error('WS 握手超时')) })
    req.on('upgrade', (res, socket) => resolve(socket))
    req.on('response', res => {
      res.resume()
      reject(new Error(`WS 握手被拒 HTTP ${res.statusCode}（多为鉴权失败）`))
    })
    req.on('error', reject)
    req.end()
  })
}

// 客户端帧必须 mask（RFC 6455 §5.3）
function wsSend(socket, payload) {
  const mask = crypto.randomBytes(4)
  const len = payload.length
  let header
  if (len < 126) {
    header = Buffer.alloc(2); header[1] = 0x80 | len
  } else if (len < 65536) {
    header = Buffer.alloc(4); header[1] = 0x80 | 126; header.writeUInt16BE(len, 2)
  } else {
    header = Buffer.alloc(10); header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(len), 2)
  }
  header[0] = 0x82 // FIN + binary frame
  const masked = Buffer.from(payload)
  for (let i = 0; i < masked.length; i++) masked[i] ^= mask[i & 3]
  socket.write(Buffer.concat([header, mask, masked]))
}

// 增量解析服务端帧（不 mask），完整消息回调 onMessage
function makeParser(onMessage, onClose, socket) {
  let buf = Buffer.alloc(0)
  return chunk => {
    buf = Buffer.concat([buf, chunk])
    while (true) {
      if (buf.length < 2) return
      const opcode = buf[0] & 0x0f
      let len = buf[1] & 0x7f
      let off = 2
      if (len === 126) {
        if (buf.length < 4) return
        len = buf.readUInt16BE(2); off = 4
      } else if (len === 127) {
        if (buf.length < 10) return
        len = Number(buf.readBigUInt64BE(2)); off = 10
      }
      const masked = buf[1] & 0x80
      let maskKey = null
      if (masked) {
        if (buf.length < off + 4) return
        maskKey = buf.subarray(off, off + 4); off += 4
      }
      if (buf.length < off + len) return
      let payload = buf.subarray(off, off + len)
      if (maskKey) {
        const out = Buffer.from(payload)
        for (let i = 0; i < out.length; i++) out[i] ^= maskKey[i & 3]
        payload = out
      }
      buf = buf.subarray(off + len)
      if (opcode === 0x8) { onClose(); return }            // close
      if (opcode === 0x9) { wsSendPong(socket, payload); continue } // ping → pong
      if (opcode === 0x1 || opcode === 0x2) onMessage(payload)
    }
  }
}

function wsSendPong(socket, payload) {
  if (!socket || socket.destroyed) return
  const mask = crypto.randomBytes(4)
  const header = Buffer.alloc(2)
  header[0] = 0x8A // FIN + pong
  header[1] = 0x80 | payload.length
  const masked = Buffer.from(payload)
  for (let i = 0; i < masked.length; i++) masked[i] ^= mask[i & 3]
  socket.write(Buffer.concat([header, mask, masked]))
}

// ---------- 合成流程（与 demo-server 一致）----------

async function synthesize({ apiKey, appId, accessKey, resourceId = 'seed-tts-2.0', speaker, text, speechRate = 0, explicitLanguage = '' }) {
  if (!speaker || !text) throw new Error('缺少 speaker / text')
  if (!apiKey && !(appId && accessKey)) throw new Error('缺少凭据')

  const headers = { 'X-Api-Resource-Id': resourceId }
  if (apiKey) {
    headers['X-Api-Key'] = apiKey
  } else {
    headers['X-Api-App-Key'] = appId
    headers['X-Api-App-Id'] = appId
    headers['X-Api-Access-Key'] = accessKey
  }

  const socket = await wsConnect(headers)
  const sessionId = crypto.randomUUID().replace(/-/g, '')

  const audioChunks = []
  const t0 = Date.now()
  let firstChunkMs = null
  let settled = false

  const finish = (fn, arg) => {
    if (settled) return
    settled = true
    clearTimeout(timer)
    try { socket.destroy() } catch { /* ignore */ }
    fn(arg)
  }
  const timer = setTimeout(() => finish(rejectRef, new Error('合成超时（20s）')), 20000)
  let rejectRef = null

  const sessionMeta = () => {
    const req = {
      speaker,
      audio_params: { format: 'mp3', sample_rate: 24000, bit_rate: 64000 },
    }
    if (speechRate) req.audio_params.speech_rate = speechRate
    const additions = {}
    if (explicitLanguage) additions.explicit_language = explicitLanguage
    if (Object.keys(additions).length) req.additions = JSON.stringify(additions)
    return {
      user: { uid: 'tts-demo' },
      event: EV.StartSession,
      namespace: 'BidirectionalTTS',
      req_params: req,
    }
  }

  const handle = msg => {
    if (msg.type === 0b1111) {
      return finish(rejectRef, new Error(`协议错误 code=${msg.errorCode}: ${msg.payload.toString('utf-8')}`))
    }
    if ((msg.type === 0b1011 || msg.event === EV.TTSResponse) && msg.payload?.length) {
      audioChunks.push(msg.payload)
      if (firstChunkMs === null) firstChunkMs = Date.now() - t0
      return
    }
    switch (msg.event) {
      case EV.ConnectionStarted:
        wsSend(socket, requestFrame(EV.StartSession, sessionId, sessionMeta()))
        return
      case EV.SessionStarted:
        wsSend(socket, requestFrame(EV.TaskRequest, sessionId, {
          user: { uid: 'tts-demo' },
          event: EV.TaskRequest,
          namespace: 'BidirectionalTTS',
          req_params: { text },
        }))
        wsSend(socket, requestFrame(EV.FinishSession, sessionId, {}))
        return
      case EV.SessionFinished: {
        let code = 20000000, message = 'ok'
        try {
          const j = JSON.parse(msg.payload.toString('utf-8'))
          code = j.status_code ?? code
          message = j.message ?? message
        } catch { /* payload 可能为空 */ }
        if (code !== 20000000) {
          return finish(rejectRef, new Error(`火山返回 ${code}: ${message}`))
        }
        if (!audioChunks.length) {
          return finish(rejectRef, new Error('会话结束但未收到音频（检查音色 ID 与 Resource ID 是否匹配）'))
        }
        wsSend(socket, requestFrame(EV.FinishConnection, null, {}))
        return finish(resolveRef, {
          audio: Buffer.concat(audioChunks).toString('base64'),
          firstChunkMs,
          totalMs: Date.now() - t0,
        })
      }
      case EV.ConnectionFailed:
      case EV.SessionFailed: {
        let m = ''
        try { m = JSON.parse(msg.payload.toString('utf-8')).message } catch { /* ignore */ }
        return finish(rejectRef, new Error(`火山${msg.event === EV.ConnectionFailed ? '建连' : '会话'}失败: ${m}`))
      }
      default:
        return
    }
  }

  let resolveRef = null
  return new Promise((resolve, reject) => {
    resolveRef = resolve
    rejectRef = reject

    const parser = makeParser(
      payload => handle(parseFrame(payload)),
      () => finish(reject, new Error('连接被关闭（合成未完成）')),
      socket,
    )
    socket.on('data', parser)
    socket.on('error', err => finish(reject, new Error(`连接错误: ${err.message}`)))
    socket.on('close', () => finish(reject, new Error('连接被关闭（合成未完成）')))

    wsSend(socket, requestFrame(EV.StartConnection, null, {}))
  })
}

// ---------- Netlify Function 入口 ----------

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method not allowed' }) }
  }
  try {
    const p = JSON.parse(event.body || '{}')
    const out = await synthesize(p)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(out),
    }
  } catch (e) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message }),
    }
  }
}

// 供本地测试导出（Netlify 只认 handler，多余导出无副作用）
export { wsConnect, wsSend, makeParser, synthesize }
