/**
 * At-rest encryption for the info-records vault.
 *
 * The document on disk is AES-256-GCM ciphertext. Its 32-byte data key is kept
 * out of the document wherever the OS can hold it:
 *
 * - Windows: DPAPI (CurrentUser), wrapped into the document itself.
 * - macOS: the login Keychain, through `security`.
 * - Linux: the Secret Service, through `secret-tool`.
 * - Fallback: a sibling `vault.key` file with owner-only permissions.
 *
 * Migration from the v1 plaintext document happens on first read: the payload is
 * encrypted and the plaintext file is atomically replaced. A document that
 * cannot be decrypted is never overwritten.
 *
 * Honest boundary: a process running as the same OS user (including the agent's
 * own shell) can ask the same OS facility for the key. This protects backups,
 * copied files, other users, and casual disk inspection — not a compromised
 * session or an attacker who already controls the user account.
 */
import { execFile } from 'node:child_process'
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto'
import { chmod, copyFile, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const VERSION = 2
const FORMAT = 'aes-256-gcm'
const SERVICE = 'dsh-info-records'
const KEY_BYTES = 32
const IV_BYTES = 12
const CHILD_TIMEOUT_MS = 20000

/** Error thrown when the vault exists but its key cannot be recovered. */
export class VaultKeyError extends Error {
  constructor(message, options) {
    super(message, options)
    this.name = 'VaultKeyError'
  }
}

/** Error thrown when the ciphertext exists but does not authenticate. */
export class VaultDecryptError extends Error {
  constructor(message, options) {
    super(message, options)
    this.name = 'VaultDecryptError'
  }
}

/** Remove helper-process output that may have echoed a secret. */
function scrubSecrets(text, secrets) {
  let out = String(text || '')
  for (const secret of secrets || []) {
    if (typeof secret === 'string' && secret.length >= 16) {
      out = out.split(secret).join('[redacted]')
    }
  }
  // Base64 keys are long; a generic sweep catches a wrapped or re-quoted copy.
  out = out.replace(/[A-Za-z0-9+/]{32,}={0,2}/g, '[redacted]')
  return out
}

/** Run one helper process with an optional stdin payload. */
function run(command, args, input, secrets) {
  return new Promise((resolve, reject) => {
    let settled = false
    const child = execFile(command, args, {
      windowsHide: true,
      timeout: CHILD_TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
      encoding: 'utf8',
    }, (error, stdout, stderr) => {
      if (settled) return
      settled = true
      if (error) {
        const detail = scrubSecrets(stderr || error.message, secrets).trim().slice(0, 400)
        reject(new Error(`${command} failed${detail ? ': ' + detail : ''}`))
        return
      }
      resolve(String(stdout || ''))
    })
    child.stdin?.on('error', () => {})
    if (typeof input === 'string') child.stdin?.end(input)
    else child.stdin?.end()
  })
}

/** Decode a base64 32-byte key, rejecting anything else. */
function decodeKey(text, source) {
  let key
  try {
    key = Buffer.from(String(text || '').trim(), 'base64')
  } catch {
    throw new VaultKeyError(`无法解析来自${source}的密钥`)
  }
  if (key.length !== KEY_BYTES) {
    throw new VaultKeyError(`来自${source}的密钥长度不正确`)
  }
  return key
}

/** First 8 bytes of SHA-256, used to detect a key/document mismatch. */
function fingerprint(key) {
  return createHash('sha256').update(key).digest('hex').slice(0, 16)
}

/** Stable per-vault account name, so several DSH homes do not share one key. */
function accountFor(filePath) {
  return createHash('sha256').update(filePath).digest('hex').slice(0, 24)
}

/* -------------------------------------------------------------------------- */
/* Windows DPAPI                                                              */
/* -------------------------------------------------------------------------- */

function dpapiScript(method, base64) {
  return [
    '$ErrorActionPreference = "Stop";',
    'Add-Type -AssemblyName System.Security;',
    `$b = [Convert]::FromBase64String('${base64}');`,
    `$p = [System.Security.Cryptography.ProtectedData]::${method}($b, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser);`,
    '[Convert]::ToBase64String($p)',
  ].join(' ')
}

async function dpapiProtect(key) {
  try {
    const output = await run('powershell.exe', [
      '-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-Command', dpapiScript('Protect', key.toString('base64')),
    ], undefined, [key.toString('base64')])
    const text = output.trim()
    if (text === '') throw new Error('empty output')
    return text
  } catch {
    // Never surface helper stderr here: PowerShell quotes the failing command,
    // which contains the key material.
    throw new Error('Windows DPAPI 调用失败')
  }
}

async function dpapiUnprotect(wrapped) {
  try {
    const output = await run('powershell.exe', [
      '-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-Command', dpapiScript('Unprotect', String(wrapped || '')),
    ], undefined, [String(wrapped || '')])
    return decodeKey(output, 'Windows DPAPI')
  } catch (error) {
    if (error instanceof VaultKeyError) throw error
    throw new Error('Windows DPAPI 解包失败')
  }
}

/* -------------------------------------------------------------------------- */
/* macOS Keychain                                                             */
/* -------------------------------------------------------------------------- */

async function keychainWrite(account, key) {
  try {
    await run('security', [
      'add-generic-password', '-U', '-s', SERVICE, '-a', account,
      '-w', key.toString('base64'),
    ], undefined, [key.toString('base64')])
  } catch {
    throw new Error('macOS 钥匙串写入失败')
  }
}

async function keychainRead(account) {
  try {
    const output = await run('security', [
      'find-generic-password', '-s', SERVICE, '-a', account, '-w',
    ])
    return decodeKey(output, 'macOS 钥匙串')
  } catch (error) {
    if (error instanceof VaultKeyError) throw error
    throw new Error('macOS 钥匙串读取失败')
  }
}

/* -------------------------------------------------------------------------- */
/* Linux Secret Service                                                       */
/* -------------------------------------------------------------------------- */

async function secretToolWrite(account, key) {
  try {
    await run('secret-tool', [
      'store', '--label=DSH Info Records', 'service', SERVICE, 'vault', account,
    ], key.toString('base64'), [key.toString('base64')])
  } catch {
    throw new Error('系统密钥环写入失败')
  }
}

async function secretToolRead(account) {
  try {
    const output = await run('secret-tool', [
      'lookup', 'service', SERVICE, 'vault', account,
    ])
    return decodeKey(output, '系统密钥环')
  } catch (error) {
    if (error instanceof VaultKeyError) throw error
    throw new Error('系统密钥环读取失败')
  }
}

/* -------------------------------------------------------------------------- */
/* Fallback key file                                                          */
/* -------------------------------------------------------------------------- */

async function writeKeyFile(path, key) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 })
  const temp = `${path}.tmp-${process.pid}-${Date.now()}`
  await writeFile(temp, key.toString('base64'), { encoding: 'utf8', mode: 0o600 })
  await rename(temp, path)
  if (process.platform !== 'win32') {
    try {
      await chmod(path, 0o600)
    } catch {
      /* Best effort; the mode is already requested at creation. */
    }
  }
}

async function readKeyFile(path) {
  let info = null
  try {
    info = await stat(path)
  } catch {
    throw new VaultKeyError(`密钥文件不存在：${path}`)
  }
  if (process.platform !== 'win32' && (info.mode & 0o077) !== 0) {
    try {
      await chmod(path, 0o600)
    } catch {
      /* The warning below is the fallback. */
    }
  }
  const text = await readFile(path, 'utf8')
  return decodeKey(text, '本地密钥文件')
}

/* -------------------------------------------------------------------------- */
/* Vault                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Create the codec for one store file.
 *
 * @param {object} options
 * @param {string} options.filePath Absolute store path.
 * @param {{warn?: (message: string) => void}} [options.logger]
 */
export function createVault({ filePath, logger }) {
  const dir = dirname(filePath)
  const keyPath = join(dir, 'vault.key')
  const account = accountFor(filePath)
  let cached = null // { key, protection, wrappedKey }
  let lastDoc = null

  const warn = (message) => {
    try {
      logger?.warn?.(`info-records: ${message}`)
    } catch {
      /* Logging must never break storage. */
    }
  }

  async function newKey() {
    const key = randomBytes(KEY_BYTES)
    if (process.platform === 'win32') {
      try {
        const wrappedKey = await dpapiProtect(key)
        return { key, protection: 'dpapi', wrappedKey }
      } catch (error) {
        warn(`DPAPI 不可用，回退到本地密钥文件：${error instanceof Error ? error.message : String(error)}`)
      }
    } else if (process.platform === 'darwin') {
      try {
        await keychainWrite(account, key)
        return { key, protection: 'keychain' }
      } catch (error) {
        warn(`钥匙串不可用，回退到本地密钥文件：${error instanceof Error ? error.message : String(error)}`)
      }
    } else if (process.platform === 'linux') {
      try {
        await secretToolWrite(account, key)
        return { key, protection: 'secret-tool' }
      } catch (error) {
        warn(`系统密钥环不可用，回退到本地密钥文件：${error instanceof Error ? error.message : String(error)}`)
      }
    }
    await writeKeyFile(keyPath, key)
    return { key, protection: 'file' }
  }

  async function readExistingKey(doc) {
    if (doc.protection === 'dpapi') {
      if (typeof doc.wrappedKey !== 'string' || doc.wrappedKey === '') {
        throw new VaultKeyError('存储使用了 Windows DPAPI，但缺少包裹密钥')
      }
      try {
        return { key: await dpapiUnprotect(doc.wrappedKey), protection: 'dpapi', wrappedKey: doc.wrappedKey }
      } catch (error) {
        throw new VaultKeyError(`无法通过 Windows DPAPI 恢复密钥（文件可能来自另一台电脑或另一个 Windows 用户）：${error instanceof Error ? error.message : String(error)}`, { cause: error })
      }
    }
    if (doc.protection === 'keychain') {
      try {
        return { key: await keychainRead(account), protection: 'keychain' }
      } catch (error) {
        throw new VaultKeyError('无法从 macOS 钥匙串恢复密钥', { cause: error })
      }
    }
    if (doc.protection === 'secret-tool') {
      try {
        return { key: await secretToolRead(account), protection: 'secret-tool' }
      } catch (error) {
        throw new VaultKeyError('无法从系统密钥环恢复密钥', { cause: error })
      }
    }
    if (doc.protection === 'file') {
      return { key: await readKeyFile(keyPath), protection: 'file' }
    }
    throw new VaultKeyError(`未知的密钥保护方式：${String(doc.protection)}`)
  }

  async function ensureKey(existingDoc) {
    if (cached !== null) return cached
    cached = existingDoc === null || existingDoc === undefined
      ? await newKey()
      : await readExistingKey(existingDoc)
    return cached
  }

  function encrypt(key, payload) {
    const iv = randomBytes(IV_BYTES)
    const cipher = createCipheriv(FORMAT, key, iv)
    const plain = Buffer.from(JSON.stringify(payload), 'utf8')
    const data = Buffer.concat([cipher.update(plain), cipher.final()])
    return {
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      data: data.toString('base64'),
    }
  }

  function decrypt(doc, key) {
    try {
      const decipher = createDecipheriv(FORMAT, key, Buffer.from(String(doc.iv), 'base64'))
      decipher.setAuthTag(Buffer.from(String(doc.tag), 'base64'))
      const plain = Buffer.concat([
        decipher.update(Buffer.from(String(doc.data), 'base64')),
        decipher.final(),
      ])
      return JSON.parse(plain.toString('utf8'))
    } catch (error) {
      throw new VaultDecryptError('无法解密信息记录：密钥不匹配或文件已损坏。原文件未被修改。', { cause: error })
    }
  }

  async function writeDocument(payload) {
    const info = await ensureKey(null)
    const encrypted = encrypt(info.key, payload)
    const doc = {
      version: VERSION,
      format: FORMAT,
      protection: info.protection,
      ...(info.protection === 'dpapi' ? { wrappedKey: info.wrappedKey } : {}),
      keyId: fingerprint(info.key),
      ...encrypted,
      updatedAt: Date.now(),
    }
    await mkdir(dir, { recursive: true, mode: 0o700 })
    const temp = `${filePath}.tmp-${process.pid}-${Date.now()}`
    await writeFile(temp, JSON.stringify(doc, null, 2), { encoding: 'utf8', mode: 0o600 })
    await rename(temp, filePath)
    if (process.platform !== 'win32') {
      try {
        await chmod(dir, 0o700)
        await chmod(filePath, 0o600)
      } catch {
        /* Best effort on filesystems without POSIX modes. */
      }
    }
    lastDoc = doc
  }

  async function backupCorrupt() {
    try {
      await copyFile(filePath, `${filePath}.corrupt-${Date.now()}`)
    } catch {
      /* A failed backup must not hide the original error. */
    }
  }

  /**
   * Read and decrypt the payload, migrating a v1 plaintext document.
   *
   * @returns {Promise<object | null>} the payload, or null when no store exists.
   */
  async function read() {
    let raw
    try {
      raw = await readFile(filePath, 'utf8')
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        await ensureKey(null)
        return null
      }
      throw new Error(`无法读取信息记录文件 ${filePath}：${error instanceof Error ? error.message : String(error)}`)
    }

    let doc
    try {
      doc = JSON.parse(raw)
    } catch (error) {
      await backupCorrupt()
      throw new Error('信息记录文件不是有效的 JSON；已保留副本，原文件未被覆盖。', { cause: error })
    }
    if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
      await backupCorrupt()
      throw new Error('信息记录文件结构无效；已保留副本，原文件未被覆盖。')
    }

    // v1: a plaintext payload at the root. Encrypt in place, then use it.
    if (doc.version === 1 || (doc.format === undefined && Array.isArray(doc.records))) {
      const payload = {
        version: VERSION,
        records: Array.isArray(doc.records) ? doc.records : [],
        settings: doc.settings && typeof doc.settings === 'object' ? doc.settings : {},
        updatedAt: typeof doc.updatedAt === 'number' ? doc.updatedAt : Date.now(),
      }
      await ensureKey(null)
      await writeDocument(payload)
      return payload
    }

    if (doc.version !== VERSION || doc.format !== FORMAT) {
      await backupCorrupt()
      throw new Error(`不支持的信息记录文件版本：${String(doc.version)} / ${String(doc.format)}`)
    }

    const info = await ensureKey(doc)
    if (typeof doc.keyId === 'string' && doc.keyId !== fingerprint(info.key)) {
      throw new VaultKeyError('信息记录的密钥指纹不匹配；原文件未被修改。')
    }
    const payload = decrypt(doc, info.key)
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.records)) {
      throw new VaultDecryptError('解密后的信息记录结构无效；原文件未被修改。')
    }
    lastDoc = doc
    return payload
  }

  /** Encrypt and atomically replace the document. */
  async function write(payload) {
    await writeDocument(payload)
  }

  /** Public, non-secret description for the settings page. */
  function security() {
    return {
      encrypted: true,
      protection: cached === null ? 'unknown' : cached.protection,
      version: VERSION,
      algorithm: FORMAT,
    }
  }

  return {
    filePath,
    keyPath,
    read,
    write,
    security,
    get lastDocument() {
      return lastDoc
    },
  }
}
