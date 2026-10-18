/**
 * Host half of the `info-records` bundle (信息记录).
 *
 * Owns the encrypted credential store, the browser RPC route used by the plugin
 * page, the model-facing `info_records` tool, and the opt-in automatic capture
 * of credentials that the user shares in chat.
 *
 * The document on disk is AES-256-GCM ciphertext; `vault.js` keeps the random
 * data key in Windows DPAPI / the macOS Keychain / the Linux Secret Service, or
 * falls back to an owner-only key file. A process running as the same OS user can
 * still ask the OS for the key, so this protects copied files, backups, other
 * users, and casual inspection — not a compromised session.
 */
import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createVault } from './vault.js'

const NS = 'info-records'
const ROUTE = '/api/info-records/rpc'
const VERSION = 2
const MAX_RECORDS = 2000

/** Live settings, used the first time the store is created. */
const DEFAULT_SETTINGS = Object.freeze({
  agentAccess: true,
  revealSecrets: true,
  // Public default: capturing secrets from chat is opt-in.
  autoLearn: false,
})

const SOURCES = new Set(['manual', 'agent', 'auto'])

/* -------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* -------------------------------------------------------------------------- */

/** Trim a value to a string of at most `max` characters. */
function text(value, max) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

/** A finite non-negative timestamp, or 0. */
function stamp(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
}

/** Lower-case comparison form for a site or username. */
function fold(value) {
  return text(value, 512).toLocaleLowerCase()
}

/** Add a scheme to a bare host when the user typed only `github.com`. */
function normalizeUrl(value) {
  const raw = text(value, 2048)
  if (raw === '') return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    return /^https?:\/\//i.test(raw) ? raw : ''
  }
  return 'https://' + raw.replace(/^\/+/, '')
}

/** Hostname of an http(s) URL, without a leading `www.`. */
function siteOfUrl(value) {
  try {
    const url = new URL(normalizeUrl(value))
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.hostname.replace(/^www\./i, '')
  } catch {
    return ''
  }
}

/** Parse tags from an array or a comma/space separated string. */
function normalizeTags(value) {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[,，;；\s]+/)
      : []
  const seen = new Set()
  const tags = []
  for (const item of items) {
    const tag = text(item, 32)
    if (tag === '') continue
    const key = fold(tag)
    if (seen.has(key)) continue
    seen.add(key)
    tags.push(tag)
    if (tags.length >= 10) break
  }
  return tags
}

/** Store location: the DSH home when the host exposes it, user home otherwise. */
function resolveStorePath(ctx) {
  let base = ''
  try {
    const homePath = ctx.get('dshHomePath')
    if (typeof homePath === 'function') {
      const candidate = homePath('info-records', 'store.json')
      if (typeof candidate === 'string' && candidate !== '') base = candidate
    }
  } catch {
    /* Optional service: fall through to the environment. */
  }
  if (base === '') {
    const home = (typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== '')
      ? process.env.DSH_HOME
      : join(homedir(), '.dsh')
    base = join(home, NS, 'store.json')
  }
  return base
}

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * One lazily loaded, serialized encrypted document.
 *
 * Reads and decrypts on first use, keeps the payload in memory, and writes
 * through the vault's atomic encryption path. All mutations go through this
 * single object, so two requests can never interleave a read-modify-write pair.
 */
function createStore(ctx) {
  const filePath = resolveStorePath(ctx)
  const vault = createVault({ filePath, logger: ctx.logger })
  let state = null
  let loading = null
  let writing = Promise.resolve()

  /** A fresh empty document. */
  function fresh() {
    return { version: VERSION, records: [], settings: { ...DEFAULT_SETTINGS }, updatedAt: 0 }
  }

  /** Validate a decrypted document, dropping individual malformed records. */
  function coerce(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
    const records = []
    if (Array.isArray(raw.records)) {
      for (const item of raw.records) {
        const record = coerceRecord(item, null)
        if (record !== null) records.push(record)
      }
    }
    const stored = raw.settings && typeof raw.settings === 'object' ? raw.settings : {}
    return {
      version: VERSION,
      records,
      settings: {
        agentAccess: stored.agentAccess !== false,
        revealSecrets: stored.revealSecrets !== false,
        autoLearn: stored.autoLearn === true,
      },
      updatedAt: stamp(raw.updatedAt),
    }
  }

  async function load() {
    if (state !== null) return state
    if (loading !== null) return loading
    loading = (async () => {
      const payload = await vault.read()
      const parsed = payload === null ? fresh() : coerce(payload)
      if (parsed === null) {
        throw new Error('信息记录数据结构无效；原文件未被覆盖。')
      }
      state = parsed
      return state
    })()
    try {
      return await loading
    } finally {
      loading = null
    }
  }

  async function persist() {
    // Snapshot the plain payload before the encryption step yields: a later
    // mutation must not leak into this write.
    const payload = structuredClone({
      version: VERSION,
      records: state.records,
      settings: state.settings,
      updatedAt: state.updatedAt,
    })
    const run = writing.then(() => vault.write(payload))
    writing = run.catch(() => {})
    return run
  }

  function snapshot() {
    return {
      records: state.records.map(copyRecord),
      settings: { ...state.settings },
      security: vault.security(),
      path: filePath,
      updatedAt: state.updatedAt,
      count: state.records.length,
    }
  }

  /** Insert or update one record from already-sanitized input. */
  async function saveRecord(input, source) {
    await load()
    const existingById = typeof input.id === 'string' && input.id !== ''
      ? state.records.find((record) => record.id === input.id)
      : undefined
    const site = text(input.site, 120)
    const username = text(input.username, 256)
    const existingByKey = !existingById && site !== '' && username !== ''
      ? state.records.find((record) => fold(record.site) === fold(site) && fold(record.username) === fold(username))
      : undefined
    const existing = existingById || existingByKey
    if (existing && existing.agentAllowed === false && source !== 'manual') {
      throw new Error('这条记录被用户标记为“仅手动使用”，智能体不能修改。')
    }
    const record = coerceRecord(input, existing)
    if (record === null) throw new Error('站点不能为空')

    if (existing) {
      record.id = existing.id
      record.createdAt = existing.createdAt
      record.source = existing.source === 'manual' ? 'manual' : source
      record.useCount = existing.useCount
      record.lastUsedAt = existing.lastUsedAt
      const index = state.records.findIndex((item) => item.id === existing.id)
      state.records[index] = record
    } else {
      if (state.records.length >= MAX_RECORDS) throw new Error(`记录数量已达上限（${MAX_RECORDS} 条）`)
      state.records.push(record)
    }
    const next = {
      ...state,
      records: state.records.slice(),
      settings: { ...state.settings },
    }
    state = next
    state.updatedAt = Date.now()
    await persist()
    return { record: copyRecord(record), created: !existing }
  }

  async function deleteRecord(id) {
    await load()
    const index = state.records.findIndex((record) => record.id === id)
    if (index < 0) return false
    state = { ...state, records: state.records.filter((record) => record.id !== id) }
    state.updatedAt = Date.now()
    await persist()
    return true
  }

  async function updateSettings(patch) {
    await load()
    const next = { ...state.settings }
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (typeof patch?.[key] === 'boolean') next[key] = patch[key]
    }
    state = { ...state, settings: next }
    state.updatedAt = Date.now()
    await persist()
    return { ...next }
  }

  async function touch(ids) {
    await load()
    if (!Array.isArray(ids) || ids.length === 0) return
    const set = new Set(ids)
    const now = Date.now()
    let changed = false
    state.records = state.records.map((record) => {
      if (!set.has(record.id)) return record
      changed = true
      return { ...record, lastUsedAt: now, useCount: record.useCount + 1, updatedAt: record.updatedAt }
    })
    if (!changed) return
    state.updatedAt = now
    await persist()
  }

  return { filePath, load, snapshot, saveRecord, deleteRecord, updateSettings, touch }
}

/** Validate one record; `existing` supplies immutable bookkeeping fields. */
function coerceRecord(input, existing) {
  if (!input || typeof input !== 'object') return null
  const url = normalizeUrl(input.url)
  const site = text(input.site, 120) || siteOfUrl(url)
  if (site === '') return null
  const username = text(input.username, 256)
  const password = text(input.password, 512)
  if (username === '' && password === '') return null
  const now = Date.now()
  return {
    id: text(input.id, 64) || existing?.id || randomUUID(),
    site,
    url,
    username,
    password,
    notes: text(input.notes, 2000),
    tags: normalizeTags(input.tags),
    source: existing?.source || (SOURCES.has(input.source) ? input.source : 'manual'),
    agentAllowed: typeof input.agentAllowed === 'boolean'
      ? input.agentAllowed
      : existing
        ? existing.agentAllowed !== false
        : true,
    createdAt: existing?.createdAt || stamp(input.createdAt) || now,
    updatedAt: now,
    lastUsedAt: existing ? existing.lastUsedAt : null,
    useCount: existing ? existing.useCount : 0,
  }
}

/** A defensive copy, so callers cannot mutate the in-memory store. */
function copyRecord(record) {
  return {
    id: record.id,
    site: record.site,
    url: record.url,
    username: record.username,
    password: record.password,
    notes: record.notes,
    tags: record.tags.slice(),
    source: record.source,
    agentAllowed: record.agentAllowed !== false,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastUsedAt: record.lastUsedAt,
    useCount: record.useCount,
  }
}

/* -------------------------------------------------------------------------- */
/* RPC route                                                                  */
/* -------------------------------------------------------------------------- */

function ok(value) {
  return Response.json({ ok: true, value }, { headers: { 'cache-control': 'no-store' } })
}

function fail(code, message) {
  return Response.json(
    { ok: false, error: { code, message } },
    { headers: { 'cache-control': 'no-store' } },
  )
}

/** Public record shape for the browser (secrets included: the page may reveal them). */
function forBrowser(record) {
  return copyRecord(record)
}

async function handleRpc(store, request) {
  let body = null
  try {
    body = await request.json()
  } catch {
    return fail('bad-request', '请求体不是有效的 JSON')
  }
  if (!body || typeof body !== 'object' || typeof body.op !== 'string') {
    return fail('bad-request', '缺少 op')
  }

  try {
    await store.load()
    switch (body.op) {
      case 'state':
        return ok(store.snapshot())

      case 'save': {
        const input = body.record && typeof body.record === 'object' ? body.record : {}
        const result = await store.saveRecord(input, 'manual')
        const snapshot = store.snapshot()
        return ok({ ...snapshot, record: result.record, created: result.created })
      }

      case 'delete': {
        const id = text(body.id, 64)
        if (id === '') return fail('bad-request', '缺少记录 id')
        const removed = await store.deleteRecord(id)
        if (!removed) return fail('not-found', '记录不存在或已被删除')
        return ok(store.snapshot())
      }

      case 'settings': {
        const settings = await store.updateSettings(body.settings)
        return ok({ ...store.snapshot(), settings })
      }

      case 'touch': {
        await store.touch(Array.isArray(body.ids) ? body.ids : [])
        return ok(store.snapshot())
      }

      default:
        return fail('bad-request', `未知操作：${body.op}`)
    }
  } catch (error) {
    return fail('internal', error instanceof Error ? error.message : String(error))
  }
}

/* -------------------------------------------------------------------------- */
/* Model-facing tool                                                          */
/* -------------------------------------------------------------------------- */

/** The short form used by list/search results (never includes a password). */
function brief(record) {
  return {
    id: record.id,
    site: record.site,
    url: record.url,
    username: record.username,
    tags: record.tags.slice(),
    notes: record.agentAllowed === false ? '' : record.notes,
    source: record.source,
    agentAllowed: record.agentAllowed !== false,
    updatedAt: record.updatedAt,
    lastUsedAt: record.lastUsedAt,
    useCount: record.useCount,
  }
}

/** Match a record against a site/url/query string. */
function matches(record, query) {
  const needle = fold(query)
  if (needle === '') return false
  const haystack = [
    record.site,
    record.url,
    siteOfUrl(record.url),
    record.username,
    record.notes,
    ...record.tags,
  ].map(fold)
  return haystack.some((value) => value !== '' && (value.includes(needle) || needle.includes(value)))
}

/** Render a timestamp for the model-facing text projection. */
function iso(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '—'
  try {
    return new Date(value).toISOString()
  } catch {
    return '—'
  }
}

function createTool(store) {
  return {
    name: 'info_records',
    description:
      'Read and maintain the user\'s saved website/app credentials (site, URL, username, password, notes, tags), '
      + 'stored by the "信息记录" (Info Records) plugin in this DSH profile. '
      + 'Call action="get" with site or url BEFORE signing in to a site on the user\'s behalf, then use the returned username/password in the browser or computer tool. '
      + 'Call action="list" to see what is stored and action="search" to find a record by site, username, or tag (list/search never return passwords). '
      + 'When the user shares credentials for a site, call action="save" so they are remembered (this needs the auto-learn setting on); '
      + 'when the user asks to forget a credential, call action="delete". '
      + 'Use action="used" only when you actually filled a password into a login form and the automatic mark is missing. '
      + 'A record can be marked "manual only" by the user; such a record is invisible to get/delete and must be entered by the user personally. '
      + 'Never print a password in your reply unless the user explicitly asks for it, and never send credentials to any tool other than the login form they belong to. '
      + 'If the user turned off agent access, every action fails and you should ask them to enable it in the 信息记录 panel.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'get', 'search', 'save', 'delete', 'used'],
          description: 'Operation to perform.',
        },
        query: {
          type: 'string',
          description: 'Free-text site, URL, username, or tag to look for (search).',
        },
        id: {
          type: 'string',
          description: 'Exact record id (get, delete, used).',
        },
        site: {
          type: 'string',
          description: 'Site or app name, such as GitHub or 淘宝. Accepted by get, save, and delete.',
        },
        url: {
          type: 'string',
          description: 'Login page URL. Accepted by get (to match) and save (to store).',
        },
        username: {
          type: 'string',
          description: 'Account name, email, or phone number (save).',
        },
        password: {
          type: 'string',
          description: 'Password or passcode (save).',
        },
        notes: {
          type: 'string',
          description: 'Optional note such as a security question or recovery email (save).',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional labels, such as 工作 or 购物 (save).',
        },
      },
      required: ['action'],
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          action: { type: 'string' },
          count: { type: 'number' },
          revealSecrets: { type: 'boolean' },
          records: {
            type: 'array',
            items: { type: 'object', additionalProperties: true, properties: {} },
          },
          created: { type: 'boolean' },
          message: { type: 'string' },
        },
      },
      render(args, value) {
        const data = value && typeof value === 'object' ? value : {}
        const action = typeof data.action === 'string' ? data.action : args?.action ?? 'info_records'
        const records = Array.isArray(data.records) ? data.records : []
        if (action === 'list' || action === 'search') {
          if (records.length === 0) {
            return [{ type: 'text', text: action === 'search' ? '没有匹配的记录。' : '信息记录里还没有任何记录。' }]
          }
          const lines = records.map((record) => {
            const tags = Array.isArray(record.tags) && record.tags.length > 0 ? ` [${record.tags.join(', ')}]` : ''
            const manual = record.agentAllowed === false ? ' · 仅手动' : ''
            return `- ${record.site}${record.url ? ` (${record.url})` : ''} · 用户名：${record.username || '（无）'}${tags}${manual} · id: ${record.id}`
          })
          const header = action === 'search'
            ? `找到 ${records.length} 条记录（密码未返回；需要登录请用 action="get"）：`
            : `共 ${records.length} 条记录（密码未返回；需要登录请用 action="get"）：`
          return [{ type: 'text', text: `${header}\n${lines.join('\n')}` }]
        }
        if (action === 'get') {
          if (records.length === 0) {
            return [{ type: 'text', text: '没有找到这条记录。可以先用 action="list" 查看已有记录，或让用户提供账号密码并用 action="save" 保存。' }]
          }
          const lines = records.map((record) => {
            const parts = [`站点：${record.site}`]
            if (record.url) parts.push(`网址：${record.url}`)
            parts.push(`用户名：${record.username || '（无）'}`)
            parts.push(`密码：${record.password || '（无）'}`)
            if (record.notes) parts.push(`备注：${record.notes}`)
            parts.push(`更新时间：${iso(record.updatedAt)}`)
            return `- ${parts.join(' · ')}`
          })
          const hidden = data.revealSecrets === false
            ? '\n（用户在“信息记录”设置中关闭了“向智能体显示密码明文”，因此密码以掩码返回；请让用户手动输入密码。）'
            : ''
          return [{ type: 'text', text: `找到 ${records.length} 条记录：\n${lines.join('\n')}${hidden}` }]
        }
        if (action === 'save') {
          const record = records[0]
          if (!record) return [{ type: 'text', text: '保存失败：没有可用的记录数据。' }]
          return [{ type: 'text', text: `${data.created === false ? '已更新' : '已保存'}记录：${record.site} · 用户名：${record.username || '（无）'}（id: ${record.id}）` }]
        }
        if (action === 'delete') {
          return [{ type: 'text', text: `已删除 ${typeof data.count === 'number' ? data.count : 0} 条记录。` }]
        }
        if (action === 'used') {
          return [{ type: 'text', text: '已记录本次使用。' }]
        }
        return [{ type: 'text', text: typeof data.message === 'string' ? data.message : '操作完成。' }]
      },
    },
    async execute(args, exec) {
      exec.signal?.throwIfAborted?.()
      const state = await store.load()
      if (!state.settings.agentAccess) {
        throw new Error('信息记录：用户已关闭智能体访问。请让用户在“信息记录”面板的设置中开启“允许智能体使用记录”。')
      }
      const action = typeof args?.action === 'string' ? args.action : ''
      const detail = args && typeof args === 'object' ? args : {}

      if (action === 'list') {
        const records = state.records
          .slice()
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map(brief)
        return { action, count: records.length, records }
      }

      if (action === 'search') {
        const query = text(detail.query, 256)
        if (query === '') throw new Error('search 需要提供 query（站点、URL、用户名或标签）。')
        const records = state.records.filter((record) => matches(record, query)).map(brief)
        return { action, query, count: records.length, records }
      }

      if (action === 'get') {
        const id = text(detail.id, 64)
        const site = text(detail.site, 256)
        const url = text(detail.url, 2048)
        const query = site || url
        if (id === '' && query === '') throw new Error('get 需要提供 id、site 或 url。')
        let found = []
        if (id !== '') found = state.records.filter((record) => record.id === id)
        if (found.length === 0 && query !== '') {
          found = state.records.filter((record) => matches(record, query))
        }
        if (found.length > 0 && found.every((record) => record.agentAllowed === false)) {
          throw new Error('这条记录被用户标记为“仅手动使用”，智能体不能读取或使用；请让用户自己输入账号密码。')
        }
        found = found.filter((record) => record.agentAllowed !== false)
        const reveal = state.settings.revealSecrets
        const records = found.map((record) => ({
          ...brief(record),
          password: reveal ? record.password : record.password === '' ? '' : '••••••••',
        }))
        if (records.length > 0) {
          await store.touch(records.map((record) => record.id))
        }
        return { action, count: records.length, revealSecrets: reveal, records }
      }

      if (action === 'save') {
        if (!state.settings.autoLearn) {
          throw new Error('信息记录：用户已关闭“自动收录”。请让用户在“信息记录”面板的设置中开启，或让用户手动添加这条记录。')
        }
        const password = text(detail.password, 512)
        const username = text(detail.username, 256)
        if (password === '' && username === '') {
          throw new Error('save 至少需要 username 或 password。')
        }
        const result = await store.saveRecord({
          site: detail.site,
          url: detail.url,
          username,
          password,
          notes: detail.notes,
          tags: detail.tags,
          source: 'agent',
        }, 'agent')
        return {
          action,
          count: 1,
          created: result.created,
          records: [brief(result.record)],
        }
      }

      if (action === 'delete') {
        const id = text(detail.id, 64)
        const site = text(detail.site, 256)
        const query = site || text(detail.url, 2048)
        if (id === '' && query === '') throw new Error('delete 需要提供 id 或 site。')
        let targets = id !== ''
          ? state.records.filter((record) => record.id === id)
          : state.records.filter((record) => matches(record, query))
        if (targets.length > 0 && targets.every((record) => record.agentAllowed === false)) {
          throw new Error('这条记录被用户标记为“仅手动使用”，智能体不能删除；请让用户自己处理。')
        }
        targets = targets.filter((record) => record.agentAllowed !== false)
        // A site name deletes only an unambiguous match; anything wider needs an id.
        if (id === '' && targets.length > 1) {
          throw new Error(`匹配到 ${targets.length} 条记录，请用 id 指定要删除的那一条：${targets.map((record) => record.id).join(', ')}`)
        }
        for (const target of targets) {
          await store.deleteRecord(target.id)
        }
        return { action, count: targets.length, records: targets.map(brief) }
      }

      if (action === 'used') {
        const id = text(detail.id, 64)
        if (id === '') throw new Error('used 需要提供 id。')
        const target = state.records.find((record) => record.id === id)
        if (target && target.agentAllowed === false) {
          throw new Error('这条记录被用户标记为“仅手动使用”，智能体不能操作。')
        }
        await store.touch([id])
        return { action, count: 1, records: [] }
      }

      throw new Error(`未知 action：${action || '（空）'}。可用：list、get、search、save、delete、used。`)
    },
  }
}

/* -------------------------------------------------------------------------- */
/* Automatic capture                                                          */
/* -------------------------------------------------------------------------- */

const USER_FIELD = /(?:账号|帐号|用户名|登录名|账户|邮箱|手机号|user(?:\s*name)?|login|account|email|phone)\s*(?:是|为|[:：=])\s*([^\s，,；;。、|]{2,80})/gi
const PASS_FIELD = /(?:密码|口令|pass(?:word)?|pwd|passcode)\s*(?:是|为|[:：=])\s*([^\s，,；;。、|]{1,128})/gi
const SITE_FIELD = /(?:网站|站点|应用|平台|系统|site|app|website)\s*(?:是|为|[:：=])\s*([^\s，,；;。、|]{1,40})/i
const URL_FIELD = /https?:\/\/[^\s<>"'）)，。；;]+/i

/** Placeholder words that mean "the input box", not a credential. */
const PLACEHOLDER = new Set([
  '输入框', '框', '字段', '页面', '登录', '登入', '界面', '按钮', '这里', '什么', '多少',
  'input', 'field', 'box', 'page', 'login', 'form', 'password', 'username', 'account',
])

/** Collect every text block of one user message. */
function messageText(message) {
  if (!message || typeof message !== 'object') return ''
  const content = message.content
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  const parts = []
  for (const block of content) {
    if (typeof block === 'string') parts.push(block)
    else if (block && typeof block === 'object' && block.type === 'text' && typeof block.text === 'string') {
      parts.push(block.text)
    }
  }
  return parts.join('\n')
}

/** Pull label/value pairs out of free text. */
function collect(pattern, input) {
  const values = []
  pattern.lastIndex = 0
  let match
  while ((match = pattern.exec(input)) !== null) {
    const value = text(match[1], 128).replace(/[。；;，,、]+$/u, '')
    if (value === '' || PLACEHOLDER.has(value.toLocaleLowerCase())) continue
    values.push(value)
    if (values.length >= 3) break
  }
  return values
}

/**
 * Extract up to three `{site,url,username,password}` candidates from a message.
 *
 * Only messages that carry both a labelled account and a labelled password are
 * considered; a sentence that merely mentions a login page never captures.
 */
function extractCredentials(input) {
  if (typeof input !== 'string' || input.length === 0 || input.length > 20000) return []
  const users = collect(USER_FIELD, input)
  const passwords = collect(PASS_FIELD, input)
  if (users.length === 0 || passwords.length === 0) return []
  const urlMatch = URL_FIELD.exec(input)
  const url = urlMatch === null ? '' : normalizeUrl(urlMatch[0])
  const siteMatch = SITE_FIELD.exec(input)
  const site = siteOfUrl(url) || (siteMatch === null ? '' : text(siteMatch[1], 40)) || '未命名站点'
  const results = []
  const total = Math.min(users.length, passwords.length, 3)
  for (let index = 0; index < total; index += 1) {
    const username = users[index]
    const password = passwords[index]
    if (username === '' || password === '' || fold(username) === fold(password)) continue
    results.push({
      site,
      url,
      username,
      password,
      notes: '自动从对话中收录',
      tags: [],
      source: 'auto',
    })
  }
  return results
}

function registerAutoLearn(ctx, store) {
  const seen = new Set()
  ctx.effect(() => ctx.on('agent/inbox/inserted', (payload) => {
    try {
      const message = payload?.message
      if (!message || message.role !== 'user') return
      const id = typeof message.id === 'string' ? message.id : ''
      if (id !== '') {
        if (seen.has(id)) return
        seen.add(id)
        if (seen.size > 500) seen.clear()
      }
      const body = messageText(message)
      if (body === '') return
      const found = extractCredentials(body)
      if (found.length === 0) return
      void (async () => {
        try {
          const state = await store.load()
          if (!state.settings.autoLearn) return
          for (const candidate of found) {
            await store.saveRecord(candidate, 'auto')
          }
        } catch (error) {
          ctx.logger?.warn?.(`info-records: auto capture failed: ${String(error)}`)
        }
      })()
    } catch (error) {
      ctx.logger?.warn?.(`info-records: auto capture failed: ${String(error)}`)
    }
  }), 'info-records: auto capture')
}

/* -------------------------------------------------------------------------- */
/* Plugin                                                                     */
/* -------------------------------------------------------------------------- */

export function apply(ctx) {
  const store = createStore(ctx)

  // The page talks to the Host over one same-origin POST route. Connection owns
  // browser authentication, so the handler never sees an anonymous caller.
  ctx.inject(['connection'], (scope) => {
    const connection = scope.get('connection')
    if (!connection || !connection.fetch || typeof connection.fetch.register !== 'function') return undefined
    const dispose = connection.fetch.register({
      path: ROUTE,
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: (request) => handleRpc(store, request),
    })
    return () => {
      try {
        void dispose()
      } catch {
        /* Already disposed with the connection scope. */
      }
    }
  })

  // The model-facing tool is optional: profiles without a tool registry keep the
  // management page working.
  ctx.inject(['tools'], (scope) => {
    const tools = scope.get('tools')
    if (!tools || typeof tools.register !== 'function') return undefined
    try {
      return tools.register(createTool(store))
    } catch (error) {
      ctx.logger?.warn?.(`info-records: cannot register info_records: ${String(error)}`)
      return undefined
    }
  })

  registerAutoLearn(ctx, store)
}
