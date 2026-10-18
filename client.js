window.__ModuleLoader__.load({
  id: 'dsh-info-records',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'info-records'
    const POLL_MS = 15000

    /* ------------------------------------------------------------------ */
    /* Locale dictionaries                                                 */
    /* ------------------------------------------------------------------ */

    const zh = {
      'title': '信息记录',
      'nav': '信息记录',
      'subtitle': '保存网站与应用的账号密码，登录时随取随用',
      'stat.count': '{n} 条记录',
      'stat.last': '最近更新 {time}',
      'action.add': '新增记录',
      'action.refresh': '刷新',
      'action.settings': '设置',
      'action.back': '返回记录',
      'action.save': '保存',
      'action.saving': '保存中…',
      'action.cancel': '取消',
      'action.edit': '编辑',
      'action.delete': '删除',
      'action.deleteConfirm': '确认删除',
      'action.copy': '复制',
      'action.copied': '已复制到剪贴板',
      'action.copyFailed': '剪贴板不可用，请手动选择复制',
      'action.open': '打开网址',
      'action.reveal': '显示密码',
      'action.hide': '隐藏密码',
      'action.retry': '重试',
      'search.placeholder': '搜索站点、用户名、网址或标签…',
      'search.clear': '清除搜索',
      'empty.title': '还没有记录',
      'empty.body': '把常用网站或应用的账号密码存在这里。之后让 DSH 帮你登录时，它会自动按站点取用。',
      'empty.action': '添加第一条记录',
      'empty.filtered': '没有匹配的记录',
      'empty.filteredHint': '换个关键词试试，或清除搜索。',
      'loading': '正在读取记录…',
      'error.title': '读取失败',
      'error.retry': '重试',
      'error.save': '保存失败',
      'error.delete': '删除失败',
      'error.settings': '设置保存失败',
      'field.site': '站点 / 应用',
      'field.siteHint': '例如 GitHub、淘宝、公司邮箱',
      'field.url': '网址',
      'field.urlHint': '可选，例如 https://github.com/login',
      'field.username': '用户名 / 账号',
      'field.usernameHint': '邮箱、手机号或登录名',
      'field.password': '密码',
      'field.passwordHint': '保存后可在记录中显示或复制',
      'field.notes': '备注',
      'field.notesHint': '可选：密保问题、备用邮箱、账号用途等',
      'field.tags': '标签',
      'field.tagsHint': '可选，用逗号分隔，例如 工作, 购物',
      'field.agentAllowed': '允许智能体使用',
      'field.agentAllowedDesc': '关闭后这条记录只能由你查看和使用，智能体无法读取或删除。',
      'field.required': '必填',
      'modal.addTitle': '新增记录',
      'modal.editTitle': '编辑记录',
      'modal.addHint': '账号密码只保存在这台电脑上。',
      'validation.site': '请填写站点或应用名称',
      'validation.credentials': '用户名和密码至少填写一项',
      'record.username': '用户名',
      'record.password': '密码',
      'record.none': '（未填写）',
      'record.updated': '更新于 {time}',
      'record.used': '已使用 {n} 次',
      'record.never': '尚未使用',
      'record.manualOnly': '仅手动',
      'source.manual': '手动',
      'source.auto': '自动收录',
      'source.agent': '智能体',
      'delete.confirm': '删除这条记录？此操作不可恢复。',
      'delete.confirmYes': '删除',
      'delete.confirmNo': '取消',
      'settings.nav': '信息记录',
      'settings.title': '信息记录设置',
      'settings.subtitle': '控制智能体如何使用这些账号密码',
      'settings.group.access': '智能体访问',
      'settings.agentAccess': '允许智能体使用记录',
      'settings.agentAccessDesc': '关闭后，DSH 无法读取任何记录，登录时需要你手动输入账号密码。',
      'settings.revealSecrets': '向智能体显示密码明文',
      'settings.revealSecretsDesc': '关闭后，智能体只能看到掩码，密码仍可在本页面查看和复制。',
      'settings.group.capture': '自动收录',
      'settings.autoLearn': '自动收录对话中的账密',
      'settings.autoLearnDesc': '默认关闭。开启后，当你在对话里写出「账号：… 密码：…」并附上网址时自动保存；关闭后智能体也不能主动新增。',
      'settings.group.storage': '存储',
      'settings.storagePath': '数据文件',
      'settings.storageCount': '记录数量',
      'settings.storageUpdated': '最近写入',
      'settings.storageSecurity': '存储加密',
      'settings.security.dpapi': 'Windows DPAPI（仅当前用户可解密）',
      'settings.security.keychain': 'macOS 钥匙串',
      'settings.security.secretTool': '系统密钥环（Secret Service）',
      'settings.security.file': '本地密钥文件（较弱）',
      'settings.security.unknown': '未知',
      'settings.security.warning': '当前使用本地密钥文件，任何以你的账户运行的程序都能读取。建议使用系统密钥保护，或开启磁盘加密。',
      'settings.storageNote': '数据以 AES-256-GCM 加密保存，不会上传。智能体读取密码时，密码会进入该会话记录；删除插件不会自动删除数据文件。',
      'settings.copyPath': '复制路径',
      'settings.enabled': '已开启',
      'settings.disabled': '已关闭',
      'settings.loading': '正在读取设置…',
      'banner.autoLearnOff': '自动收录已关闭：对话中的账号密码不会被保存。',
      'banner.enable': '去开启',
      'time.justNow': '刚刚',
      'time.minutes': '{n} 分钟前',
      'time.hours': '{n} 小时前',
      'time.days': '{n} 天前',
      'time.never': '—',
      'footer': '数据加密保存在本机 · 智能体访问、自动收录与逐条权限都可在设置中调整',
      'crash.title': '信息记录面板渲染失败',
      'crash.retry': '重新加载页面',
    }

    const en = {
      'title': 'Info Records',
      'nav': 'Info Records',
      'subtitle': 'Keep website and app credentials ready for sign-in',
      'stat.count': '{n} records',
      'stat.last': 'Updated {time}',
      'action.add': 'Add record',
      'action.refresh': 'Refresh',
      'action.settings': 'Settings',
      'action.back': 'Back to records',
      'action.save': 'Save',
      'action.saving': 'Saving…',
      'action.cancel': 'Cancel',
      'action.edit': 'Edit',
      'action.delete': 'Delete',
      'action.deleteConfirm': 'Confirm delete',
      'action.copy': 'Copy',
      'action.copied': 'Copied to clipboard',
      'action.copyFailed': 'Clipboard unavailable — select and copy manually',
      'action.open': 'Open site',
      'action.reveal': 'Show password',
      'action.hide': 'Hide password',
      'action.retry': 'Retry',
      'search.placeholder': 'Search site, username, URL, or tag…',
      'search.clear': 'Clear search',
      'empty.title': 'No records yet',
      'empty.body': 'Store the credentials of sites and apps you use. When DSH signs in for you later, it looks them up by site.',
      'empty.action': 'Add the first record',
      'empty.filtered': 'No matching records',
      'empty.filteredHint': 'Try another keyword or clear the search.',
      'loading': 'Loading records…',
      'error.title': 'Could not load records',
      'error.retry': 'Retry',
      'error.save': 'Could not save',
      'error.delete': 'Could not delete',
      'error.settings': 'Could not save settings',
      'field.site': 'Site / app',
      'field.siteHint': 'For example GitHub, Gmail, or your bank',
      'field.url': 'URL',
      'field.urlHint': 'Optional, for example https://github.com/login',
      'field.username': 'Username / account',
      'field.usernameHint': 'Email, phone number, or login name',
      'field.password': 'Password',
      'field.passwordHint': 'Shown and copied from the record after saving',
      'field.notes': 'Notes',
      'field.notesHint': 'Optional: security question, recovery email, purpose',
      'field.tags': 'Tags',
      'field.tagsHint': 'Optional, comma separated, for example work, shopping',
      'field.agentAllowed': 'Allow the agent',
      'field.agentAllowedDesc': 'When off, only you can view or use this record; the agent cannot read or delete it.',
      'field.required': 'Required',
      'modal.addTitle': 'New record',
      'modal.editTitle': 'Edit record',
      'modal.addHint': 'Credentials stay on this computer only.',
      'validation.site': 'Enter a site or app name',
      'validation.credentials': 'Enter a username or a password',
      'record.username': 'Username',
      'record.password': 'Password',
      'record.none': '(not set)',
      'record.updated': 'Updated {time}',
      'record.used': 'Used {n} times',
      'record.never': 'Not used yet',
      'record.manualOnly': 'Manual only',
      'source.manual': 'Manual',
      'source.auto': 'Auto',
      'source.agent': 'Agent',
      'delete.confirm': 'Delete this record? This cannot be undone.',
      'delete.confirmYes': 'Delete',
      'delete.confirmNo': 'Cancel',
      'settings.nav': 'Info Records',
      'settings.title': 'Info Records settings',
      'settings.subtitle': 'Control how the agent may use these credentials',
      'settings.group.access': 'Agent access',
      'settings.agentAccess': 'Let the agent use records',
      'settings.agentAccessDesc': 'When off, DSH cannot read any record and you type credentials yourself.',
      'settings.revealSecrets': 'Show passwords to the agent',
      'settings.revealSecretsDesc': 'When off, the agent sees a mask; you can still reveal and copy passwords here.',
      'settings.group.capture': 'Automatic capture',
      'settings.autoLearn': 'Capture credentials from chat',
      'settings.autoLearnDesc': 'Off by default. When on, a message with “username: … password: …” and a URL is saved automatically; when off, the agent cannot add records either.',
      'settings.group.storage': 'Storage',
      'settings.storagePath': 'Data file',
      'settings.storageCount': 'Records',
      'settings.storageUpdated': 'Last write',
      'settings.storageSecurity': 'Encryption',
      'settings.security.dpapi': 'Windows DPAPI (current user only)',
      'settings.security.keychain': 'macOS Keychain',
      'settings.security.secretTool': 'System keyring (Secret Service)',
      'settings.security.file': 'Local key file (weaker)',
      'settings.security.unknown': 'Unknown',
      'settings.security.warning': 'A local key file is in use; any process running as your user can read it. Prefer the OS key store or enable full-disk encryption.',
      'settings.storageNote': 'Data is encrypted with AES-256-GCM and never uploaded. When the agent reads a password it becomes part of that session log. Uninstalling the plugin does not delete the data file.',
      'settings.copyPath': 'Copy path',
      'settings.enabled': 'On',
      'settings.disabled': 'Off',
      'settings.loading': 'Loading settings…',
      'banner.autoLearnOff': 'Auto-capture is off: credentials in chat are not saved.',
      'banner.enable': 'Enable',
      'time.justNow': 'just now',
      'time.minutes': '{n} min ago',
      'time.hours': '{n} h ago',
      'time.days': '{n} d ago',
      'time.never': '—',
      'footer': 'Encrypted on this machine · Agent access, auto-capture, and per-record permissions are in Settings',
      'crash.title': 'The Info Records panel failed to render',
      'crash.retry': 'Reload the page',
    }

    /* ------------------------------------------------------------------ */
    /* Data store (module scope, shared by the page and settings panels)   */
    /* ------------------------------------------------------------------ */

    const state = {
      status: 'idle',
      data: null,
      error: '',
    }
    const listeners = new Set()
    let inflight = null
    let mounted = 0
    let pollTimer = null

    function notify() {
      for (const listener of Array.from(listeners)) {
        try {
          listener()
        } catch {
          /* A listener from an unmounted tree must not break the others. */
        }
      }
    }

    function patch(next) {
      Object.assign(state, next)
      notify()
    }

    async function rpc(op, payload) {
      const response = await fetch('api/info-records/rpc', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.assign({ op }, payload || {})),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      let body = null
      try {
        body = await response.json()
      } catch {
        throw new Error('服务器返回了无法解析的内容')
      }
      if (!body || body.ok !== true) {
        const message = body && body.error && body.error.message ? body.error.message : '请求失败'
        throw new Error(message)
      }
      return body.value
    }

    function dataOf(value) {
      if (!value || typeof value !== 'object') return null
      return {
        records: Array.isArray(value.records) ? value.records : [],
        settings: value.settings && typeof value.settings === 'object' ? value.settings : {},
        path: typeof value.path === 'string' ? value.path : '',
        security: value.security && typeof value.security === 'object' ? value.security : null,
        updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : 0,
        count: typeof value.count === 'number' ? value.count : 0,
      }
    }

    function refresh() {
      if (inflight !== null) return inflight
      inflight = (async () => {
        try {
          const value = await rpc('state')
          const data = dataOf(value)
          patch({ status: 'ready', data, error: '' })
        } catch (error) {
          patch({
            status: state.data ? 'ready' : 'error',
            error: error instanceof Error ? error.message : String(error),
          })
        } finally {
          inflight = null
        }
      })()
      return inflight
    }

    async function saveRecord(record) {
      const value = await rpc('save', { record })
      const data = dataOf(value)
      if (data !== null) patch({ status: 'ready', data, error: '' })
      return value
    }

    async function deleteRecord(id) {
      const value = await rpc('delete', { id })
      const data = dataOf(value)
      if (data !== null) patch({ status: 'ready', data, error: '' })
      return value
    }

    async function updateSettings(settings) {
      const value = await rpc('settings', { settings })
      const data = dataOf(value)
      if (data !== null) patch({ status: 'ready', data, error: '' })
      return value
    }

    function attach() {
      mounted += 1
      if (mounted === 1) {
        pollTimer = window.setInterval(() => {
          if (document.visibilityState === 'visible') void refresh()
        }, POLL_MS)
      }
    }

    function detach() {
      mounted = Math.max(0, mounted - 1)
      if (mounted === 0 && pollTimer !== null) {
        window.clearInterval(pollTimer)
        pollTimer = null
      }
    }

    function useStore() {
      const [, force] = React.useReducer((value) => value + 1, 0)
      React.useEffect(() => {
        const listener = () => force()
        listeners.add(listener)
        attach()
        if (state.status === 'idle') {
          patch({ status: 'loading' })
          void refresh()
        }
        return () => {
          listeners.delete(listener)
          detach()
        }
      }, [])
      React.useEffect(() => {
        const wake = () => {
          if (document.visibilityState === 'visible') void refresh()
        }
        window.addEventListener('focus', wake)
        document.addEventListener('visibilitychange', wake)
        return () => {
          window.removeEventListener('focus', wake)
          document.removeEventListener('visibilitychange', wake)
        }
      }, [])
      return state
    }

    /* ------------------------------------------------------------------ */
    /* Pure helpers                                                        */
    /* ------------------------------------------------------------------ */

    /** Translate with `{name}` interpolation, falling back to the key. */
    function makeT(dict, fallback) {
      return function translate(key, params) {
        const table = dict || {}
        let value = typeof table[key] === 'string' ? table[key] : (fallback ? fallback(key) : key)
        if (params && typeof params === 'object') {
          value = value.replace(/\{(\w+)\}/g, (match, name) => (
            params[name] === undefined || params[name] === null ? match : String(params[name])
          ))
        }
        return value
      }
    }

    function relativeTime(timestamp, t) {
      if (typeof timestamp !== 'number' || !Number.isFinite(timestamp) || timestamp <= 0) {
        return t('time.never')
      }
      const diff = Date.now() - timestamp
      if (diff < 0) return t('time.justNow')
      if (diff < 60000) return t('time.justNow')
      const minutes = Math.floor(diff / 60000)
      if (minutes < 60) return t('time.minutes', { n: minutes })
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return t('time.hours', { n: hours })
      const days = Math.floor(hours / 24)
      if (days < 7) return t('time.days', { n: days })
      try {
        return new Date(timestamp).toLocaleDateString()
      } catch {
        return '—'
      }
    }

    function hostOf(url) {
      if (typeof url !== 'string' || url === '') return ''
      try {
        const parsed = new URL(url)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
        return parsed.hostname.replace(/^www\./i, '')
      } catch {
        return ''
      }
    }

    function safeHttpUrl(url) {
      if (typeof url !== 'string' || url === '') return ''
      try {
        const parsed = new URL(url)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
        return parsed.toString()
      } catch {
        return ''
      }
    }

    function parseTags(value) {
      const seen = new Set()
      const tags = []
      for (const item of String(value || '').split(/[,，;；]+/)) {
        const tag = item.trim().slice(0, 32)
        if (tag === '' || seen.has(tag.toLocaleLowerCase())) continue
        seen.add(tag.toLocaleLowerCase())
        tags.push(tag)
        if (tags.length >= 10) break
      }
      return tags
    }

    function matchesQuery(record, query) {
      const needle = query.trim().toLocaleLowerCase()
      if (needle === '') return true
      const parts = [
        record.site,
        record.url,
        hostOf(record.url),
        record.username,
        record.notes,
        Array.isArray(record.tags) ? record.tags.join(' ') : '',
      ]
      return parts.some((value) => typeof value === 'string' && value.toLocaleLowerCase().includes(needle))
    }

    async function copyText(value) {
      try {
        await navigator.clipboard.writeText(String(value))
        return true
      } catch {
        return false
      }
    }

    /* ------------------------------------------------------------------ */
    /* Icons                                                               */
    /* ------------------------------------------------------------------ */

    function KeyIcon(props) {
      const size = props && typeof props.size === 'number' ? props.size : 18
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': 'true',
        focusable: 'false',
      },
        h('circle', { cx: 7.4, cy: 12, r: 4.1, stroke: 'currentColor', strokeWidth: 1.7 }),
        h('path', {
          d: 'M11.5 12H21M17.2 12v3.4M20.3 12v2.6',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function SearchIcon() {
      return h('svg', {
        width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('circle', { cx: 7, cy: 7, r: 4.4, stroke: 'currentColor', strokeWidth: 1.5 }),
        h('path', { d: 'm10.4 10.4 3.1 3.1', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
      )
    }

    function PlusIcon() {
      return h('svg', {
        width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('path', { d: 'M8 3.2v9.6M3.2 8h9.6', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }),
      )
    }

    function CopyIcon() {
      return h('svg', {
        width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('rect', { x: 5.4, y: 5.4, width: 8.1, height: 8.1, rx: 2, stroke: 'currentColor', strokeWidth: 1.4 }),
        h('path', {
          d: 'M10.6 5.2V4.1A1.7 1.7 0 0 0 8.9 2.4H4.1A1.7 1.7 0 0 0 2.4 4.1v4.8a1.7 1.7 0 0 0 1.7 1.7h1.1',
          stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round',
        }),
      )
    }

    function EyeIcon(props) {
      const off = props && props.off === true
      return h('svg', {
        width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('path', {
          d: off
            ? 'M2 2l12 12M6.3 6.4a2.4 2.4 0 0 0 3.3 3.3M3.4 4.8C2.5 5.5 1.8 6.4 1.4 8c.9 2.4 3.4 4.2 6.6 4.2 1 0 2-.2 2.8-.6M12 10.8c1.2-.6 2.1-1.6 2.6-2.8-.9-2.4-3.4-4.2-6.6-4.2'
            : 'M1.4 8c.9-2.4 3.4-4.2 6.6-4.2S13.7 5.6 14.6 8c-.9 2.4-3.4 4.2-6.6 4.2S2.3 10.4 1.4 8Z',
          stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
        }),
        off ? null : h('circle', { cx: 8, cy: 8, r: 2, stroke: 'currentColor', strokeWidth: 1.4 }),
      )
    }

    function EditIcon() {
      return h('svg', {
        width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('path', {
          d: 'M10.9 2.6a1.4 1.4 0 0 1 2 0l.5.5a1.4 1.4 0 0 1 0 2L6 12.5l-2.7.7.7-2.7 6.9-7.9Z',
          stroke: 'currentColor', strokeWidth: 1.4, strokeLinejoin: 'round',
        }),
      )
    }

    function TrashIcon() {
      return h('svg', {
        width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('path', {
          d: 'M2.8 4.4h10.4M6.2 4.4V3.2c0-.5.4-.9.9-.9h1.8c.5 0 .9.4.9.9v1.2M4.1 4.4l.6 8.2c0 .6.5 1 1 1h4.6c.5 0 1-.4 1-1l.6-8.2',
          stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
        }),
      )
    }

    function ExternalIcon() {
      return h('svg', {
        width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('path', {
          d: 'M9.2 2.6h4.2v4.2M13.1 2.9 7.7 8.3M6.2 3.4H3.6c-.7 0-1.2.5-1.2 1.2v7.8c0 .7.5 1.2 1.2 1.2h7.8c.7 0 1.2-.5 1.2-1.2V9.8',
          stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
        }),
      )
    }

    function GearIcon() {
      return h('svg', {
        width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('circle', { cx: 8, cy: 8, r: 2.1, stroke: 'currentColor', strokeWidth: 1.4 }),
        h('path', {
          d: 'M8 1.8v1.5M8 12.7v1.5M1.8 8h1.5M12.7 8h1.5M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1',
          stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round',
        }),
      )
    }

    function RefreshIcon() {
      return h('svg', {
        width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('path', { d: 'M13.2 6.1A5.5 5.5 0 1 0 13.5 10', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
        h('path', { d: 'M13.5 2.9v3.6H9.9', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    function CloseIcon() {
      return h('svg', {
        width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('path', { d: 'm3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
      )
    }

    function CheckIcon() {
      return h('svg', {
        width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('path', { d: 'm3.2 8.4 3.2 3.2 6.4-7', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    function ShieldIcon() {
      return h('svg', {
        width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('path', {
          d: 'M12 2.8 4.8 5.6v6c0 4.5 3 7.6 7.2 9.6 4.2-2 7.2-5.1 7.2-9.6v-6L12 2.8Z',
          stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round',
        }),
        h('circle', { cx: 12, cy: 10.4, r: 1.7, stroke: 'currentColor', strokeWidth: 1.5 }),
        h('path', { d: 'M12 12.1v3', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
      )
    }

    function PanelIcon(props) {
      const size = props && typeof props.size === 'number' ? props.size : 18
      return h('span', {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
        },
      }, h(KeyIcon, { size }))
    }

    /* ------------------------------------------------------------------ */
    /* Styles                                                              */
    /* ------------------------------------------------------------------ */

    const CSS = `
.ifr-root {
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  overflow: auto;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font-size: 13px;
  line-height: 1.45;
}
.ifr-root *, .ifr-root *::before, .ifr-root *::after { box-sizing: border-box; }
.ifr-page {
  width: 100%;
  max-width: 920px;
  min-height: 100%;
  margin: 0 auto;
  padding: 22px 24px 40px;
  display: flex;
  flex-direction: column;
}
.ifr-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.ifr-heading { min-width: 0; }
.ifr-title {
  margin: 0;
  font-size: 20px;
  line-height: 28px;
  font-weight: 650;
  letter-spacing: -0.01em;
}
.ifr-subtitle {
  margin-top: 3px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}
.ifr-header-actions { display: flex; align-items: center; gap: 8px; flex: none; }
.ifr-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 30px;
  padding: 0 11px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.ifr-button:hover:not(:disabled) {
  border-color: var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
}
.ifr-button:active:not(:disabled) { transform: translateY(1px); }
.ifr-button:disabled { opacity: 0.55; cursor: default; }
.ifr-button:focus-visible, .ifr-icon-button:focus-visible, .ifr-link:focus-visible,
.ifr-switch:focus-visible, .ifr-input:focus-visible, .ifr-textarea:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.ifr-primary {
  border-color: transparent;
  background: var(--dsw-alias-label-primary);
  color: var(--dsw-alias-bg-base);
}
.ifr-primary:hover:not(:disabled) {
  border-color: transparent;
  background: var(--dsw-alias-label-primary);
  opacity: 0.88;
}
.ifr-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.ifr-icon-button:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
}
.ifr-icon-button:disabled { opacity: 0.5; cursor: default; }
.ifr-icon-button.is-active {
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
}
.ifr-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  margin-top: 14px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
}
.ifr-stats strong { color: var(--dsw-alias-label-primary); font-weight: 600; font-variant-numeric: tabular-nums; }
.ifr-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 12px;
}
.ifr-search {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  min-width: 0;
}
.ifr-search-icon {
  position: absolute;
  left: 10px;
  color: var(--dsw-alias-label-secondary);
  pointer-events: none;
}
.ifr-input {
  width: 100%;
  height: 32px;
  padding: 0 30px 0 30px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  outline: none;
}
.ifr-input::placeholder { color: var(--dsw-alias-label-secondary); }
.ifr-input:focus { border-color: var(--dsw-alias-brand-primary); }
.ifr-input[type='search']::-webkit-search-cancel-button,
.ifr-input[type='search']::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}
.ifr-search-clear {
  position: absolute;
  right: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.ifr-search-clear:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.ifr-list { display: flex; flex-direction: column; gap: 10px; }
.ifr-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
}
.ifr-card:hover { border-color: var(--dsw-alias-border-l2); }
.ifr-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
}
.ifr-card-main { flex: 1 1 auto; min-width: 0; }
.ifr-card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  min-width: 0;
}
.ifr-site {
  font-size: 14px;
  line-height: 20px;
  font-weight: 620;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ifr-source {
  flex: none;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
  line-height: 17px;
}
.ifr-source.is-auto {
  color: var(--dsw-alias-state-success-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 13%, transparent);
}
.ifr-source.is-agent {
  color: var(--dsw-alias-brand-primary);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, transparent);
}
.ifr-source.is-manual {
  color: var(--dsw-alias-state-warn-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 14%, transparent);
}
.ifr-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ifr-link:hover { color: var(--dsw-alias-brand-primary); text-decoration: underline; }
.ifr-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
  margin-top: 8px;
}
.ifr-field { display: flex; align-items: center; gap: 7px; min-width: 0; }
.ifr-field-label {
  flex: none;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
}
.ifr-field-value {
  min-width: 0;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.ifr-field-value.is-secret { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0.08em; }
.ifr-field-value.is-long { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0; }
.ifr-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.ifr-mini:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.ifr-notes {
  margin-top: 8px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ifr-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  margin-top: 8px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
}
.ifr-tag {
  padding: 0 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 999px;
  font-size: 10px;
  line-height: 16px;
}
.ifr-card-actions {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 2px;
}
.ifr-danger { color: var(--dsw-alias-state-error-primary); }
.ifr-confirm {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  max-width: min(320px, calc(100% - 24px));
  padding: 7px 9px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, transparent);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 10px 28px color-mix(in srgb, #000 20%, transparent);
  font-size: 11px;
}
.ifr-confirm-text { color: var(--dsw-alias-label-secondary); }
.ifr-confirm-yes {
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--dsw-alias-state-error-primary);
  border-radius: 6px;
  background: var(--dsw-alias-state-error-primary);
  color: var(--dsw-alias-bg-base);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.ifr-confirm-no {
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.ifr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 260px;
  padding: 32px 24px;
  border: 1px dashed var(--dsw-alias-border-l2);
  border-radius: 14px;
  background: var(--dsw-alias-bg-layer-1);
  text-align: center;
}
.ifr-empty-icon { color: var(--dsw-alias-label-secondary); opacity: 0.8; }
.ifr-empty-title { font-size: 14px; font-weight: 600; }
.ifr-empty-body { max-width: 420px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px; }
.ifr-empty-action { margin-top: 4px; }
.ifr-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 200px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}
.ifr-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.6px solid color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent);
  border-top-color: var(--dsw-alias-label-primary);
  animation: ifr-spin 0.8s linear infinite;
}
.ifr-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 18px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);
  color: var(--dsw-alias-state-error-primary);
  font-size: 12px;
}
.ifr-footer {
  margin-top: auto;
  padding-top: 26px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
  line-height: 15px;
}
.ifr-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0 0;
  padding: 7px 10px 7px 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
}
.ifr-banner-icon { flex: none; display: inline-flex; color: var(--dsw-alias-label-secondary); }
.ifr-banner-icon svg { width: 14px; height: 14px; }
.ifr-banner-text { flex: 1 1 auto; min-width: 0; }
.ifr-banner .ifr-button { height: 26px; flex: none; }
.ifr-settings { display: flex; flex-direction: column; gap: 18px; }
.ifr-section {
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  overflow: hidden;
}
.ifr-section-title {
  padding: 11px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.ifr-setting {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 13px 16px;
}
.ifr-setting + .ifr-setting { border-top: 1px solid var(--dsw-alias-border-l1); }
.ifr-setting-text { min-width: 0; }
.ifr-setting-name { font-size: 12.5px; font-weight: 550; }
.ifr-setting-desc {
  margin-top: 2px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
  max-width: 520px;
}
.ifr-switch {
  position: relative;
  flex: none;
  width: 36px;
  height: 21px;
  margin-top: 1px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.ifr-switch.is-on {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-brand-primary);
}
.ifr-switch:disabled { opacity: 0.55; cursor: default; }
.ifr-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--dsw-alias-bg-base);
  box-shadow: 0 1px 2px color-mix(in srgb, #000 24%, transparent);
  transition: transform 0.15s ease;
}
.ifr-switch.is-on .ifr-switch-thumb { transform: translateX(15px); }
.ifr-storage { display: flex; flex-direction: column; gap: 0; }
.ifr-storage-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18px;
  padding: 10px 16px;
  font-size: 11px;
}
.ifr-storage-row + .ifr-storage-row { border-top: 1px solid var(--dsw-alias-border-l1); }
.ifr-storage-label { flex: none; color: var(--dsw-alias-label-secondary); }
.ifr-storage-value {
  min-width: 0;
  text-align: right;
  overflow-wrap: anywhere;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10.5px;
}
.ifr-storage-note {
  padding: 10px 16px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  line-height: 16px;
}
.ifr-storage-note.ifr-warn {
  color: var(--dsw-alias-state-warn-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 7%, transparent);
}
.ifr-settings-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ifr-settings-title { font-size: 15px; font-weight: 620; }
.ifr-toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  z-index: 80;
  transform: translateX(-50%);
  padding: 7px 14px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 8px 24px color-mix(in srgb, #000 18%, transparent);
  font-size: 12px;
  pointer-events: none;
}
.ifr-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.44);
}
.ifr-modal {
  width: min(560px, 100%);
  max-height: min(86vh, 720px);
  overflow: auto;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 14px;
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 24px 64px color-mix(in srgb, #000 32%, transparent);
}
.ifr-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 4px;
}
.ifr-modal-title { margin: 0; font-size: 15px; font-weight: 620; }
.ifr-modal-hint { margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 11px; }
.ifr-form { display: flex; flex-direction: column; gap: 12px; padding: 12px 18px 18px; }
.ifr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ifr-label { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.ifr-label-text { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.ifr-label-text .ifr-req { color: var(--dsw-alias-state-error-primary); margin-left: 2px; }
.ifr-control {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  outline: none;
}
.ifr-control::placeholder { color: var(--dsw-alias-label-secondary); }
.ifr-control:focus { border-color: var(--dsw-alias-brand-primary); }
.ifr-textarea { height: auto; min-height: 62px; padding: 8px 10px; resize: vertical; line-height: 17px; }
.ifr-secret-wrap { position: relative; display: flex; align-items: center; }
.ifr-secret-wrap .ifr-control { padding-right: 36px; }
.ifr-secret-toggle {
  position: absolute;
  right: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.ifr-secret-toggle:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.ifr-form-error {
  padding: 8px 10px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);
  color: var(--dsw-alias-state-error-primary);
  font-size: 11px;
}
.ifr-form-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 2px; }
.ifr-dialog-setting {
  padding: 11px 0 0;
  border-top: 1px dashed var(--dsw-alias-border-l1);
}
.ifr-nav-icon { display: inline-flex; align-items: center; justify-content: center; color: var(--dsw-alias-label-secondary); }
.ifr-nav-icon.is-active { color: var(--dsw-alias-label-primary); }
.ifr-crash { padding: 24px; color: var(--dsw-alias-state-error-primary); font-size: 12px; }
.ifr-crash button { margin-top: 10px; }
@keyframes ifr-spin { to { transform: rotate(360deg); } }
@media (max-width: 720px) {
  .ifr-page { padding: 16px 14px 32px; }
  .ifr-header { flex-direction: column; align-items: stretch; gap: 10px; }
  .ifr-header-actions { justify-content: flex-end; }
  .ifr-grid { grid-template-columns: 1fr; }
  .ifr-card { gap: 10px; padding: 12px; }
  .ifr-card-actions { flex-direction: row; }
  .ifr-setting { gap: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .ifr-switch, .ifr-switch-thumb { transition: none; }
  .ifr-spinner { animation: none; }
}
`;

    /* ------------------------------------------------------------------ */
    /* Small components                                                    */
    /* ------------------------------------------------------------------ */

    function Switch(props) {
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': props.checked ? 'true' : 'false',
        'aria-label': props.label || undefined,
        className: 'ifr-switch' + (props.checked ? ' is-on' : ''),
        disabled: props.disabled === true,
        onClick: () => {
          if (props.disabled === true) return
          props.onChange(!props.checked)
        },
      }, h('span', { className: 'ifr-switch-thumb' }))
    }

    function IconButton(props) {
      return h('button', {
        type: 'button',
        className: 'ifr-icon-button' + (props.active ? ' is-active' : ''),
        title: props.title,
        'aria-label': props.title,
        disabled: props.disabled === true,
        onClick: props.onClick,
      }, props.children)
    }

    function Toast(props) {
      if (!props.text) return null
      return h('div', { className: 'ifr-toast', role: 'status', 'aria-live': 'polite' }, props.text)
    }

    function useToast() {
      const [text, setText] = React.useState('')
      const timer = React.useRef(null)
      const show = React.useCallback((message) => {
        setText(message)
        if (timer.current !== null) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setText(''), 2200)
      }, [])
      React.useEffect(() => () => {
        if (timer.current !== null) window.clearTimeout(timer.current)
      }, [])
      return [text, show]
    }

    /* ------------------------------------------------------------------ */
    /* Record card                                                         */
    /* ------------------------------------------------------------------ */

    function RecordCard(props) {
      const t = props.t
      const record = props.record
      const [revealed, setRevealed] = React.useState(false)
      const [confirming, setConfirming] = React.useState(false)
      const [deleting, setDeleting] = React.useState(false)
      const [copied, setCopied] = React.useState('')
      const copyTimer = React.useRef(null)

      React.useEffect(() => {
        setConfirming(false)
      }, [record.id])

      React.useEffect(() => () => {
        if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
      }, [])

      const host = hostOf(record.url)
      const href = safeHttpUrl(record.url)
      const password = typeof record.password === 'string' ? record.password : ''
      const shownPassword = password === ''
        ? t('record.none')
        : revealed ? password : '••••••••'
      const sourceLabel = t('source.' + (record.source || 'manual'))
      const usedLabel = record.useCount > 0
        ? t('record.used', { n: record.useCount })
        : t('record.never')

      const copy = async (label, value) => {
        const ok = await copyText(value)
        if (ok) {
          setCopied(label)
          props.onToast(t('action.copied'))
          if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
          copyTimer.current = window.setTimeout(() => setCopied(''), 1200)
        } else {
          props.onToast(t('action.copyFailed'))
        }
      }

      const remove = async () => {
        setDeleting(true)
        try {
          await props.onDelete(record.id)
          props.onToast(t('action.delete'))
        } catch (error) {
          props.onToast(t('error.delete') + '：' + (error instanceof Error ? error.message : String(error)))
        } finally {
          setDeleting(false)
          setConfirming(false)
        }
      }

      return h('div', { className: 'ifr-card' },
        h('div', { className: 'ifr-card-icon' }, h(KeyIcon, { size: 18 })),
        h('div', { className: 'ifr-card-main' },
          h('div', { className: 'ifr-card-head' },
            h('span', { className: 'ifr-site', title: record.site }, record.site || '—'),
            h('span', { className: 'ifr-source' + (record.source === 'auto' ? ' is-auto' : record.source === 'agent' ? ' is-agent' : '') }, sourceLabel),
            record.agentAllowed === false
              ? h('span', { className: 'ifr-source is-manual', title: t('field.agentAllowedDesc') }, t('record.manualOnly'))
              : null,
            href !== ''
              ? h('a', {
                  className: 'ifr-link',
                  href,
                  target: '_blank',
                  rel: 'noreferrer noopener',
                  title: t('action.open'),
                }, h(ExternalIcon), host || t('action.open'))
              : null,
          ),
          h('div', { className: 'ifr-fields' },
            h('div', { className: 'ifr-field' },
              h('span', { className: 'ifr-field-label' }, t('record.username')),
              h('span', {
                className: 'ifr-field-value',
                title: record.username || '',
              }, record.username || t('record.none')),
              record.username
                ? h('button', {
                    type: 'button',
                    className: 'ifr-mini',
                    title: t('action.copy'),
                    'aria-label': t('action.copy'),
                    onClick: () => copy('username', record.username),
                  }, copied === 'username' ? h(CheckIcon) : h(CopyIcon))
                : null,
            ),
            h('div', { className: 'ifr-field' },
              h('span', { className: 'ifr-field-label' }, t('record.password')),
              h('span', {
                className: 'ifr-field-value' + (revealed ? ' is-long' : ' is-secret'),
                title: revealed ? password : '',
              }, shownPassword),
              password
                ? h('button', {
                    type: 'button',
                    className: 'ifr-mini',
                    title: revealed ? t('action.hide') : t('action.reveal'),
                    'aria-label': revealed ? t('action.hide') : t('action.reveal'),
                    'aria-pressed': revealed ? 'true' : 'false',
                    onClick: () => setRevealed((value) => !value),
                  }, h(EyeIcon, { off: revealed }))
                : null,
              password
                ? h('button', {
                    type: 'button',
                    className: 'ifr-mini',
                    title: t('action.copy'),
                    'aria-label': t('action.copy'),
                    onClick: () => copy('password', password),
                  }, copied === 'password' ? h(CheckIcon) : h(CopyIcon))
                : null,
            ),
          ),
          record.notes ? h('div', { className: 'ifr-notes', title: record.notes }, record.notes) : null,
          h('div', { className: 'ifr-meta' },
            Array.isArray(record.tags)
              ? record.tags.map((tag) => h('span', { className: 'ifr-tag', key: tag }, tag))
              : null,
            h('span', null, t('record.updated', { time: relativeTime(record.updatedAt, t) })),
            h('span', null, usedLabel),
          ),
        ),
        h('div', { className: 'ifr-card-actions' },
          confirming
            ? h('div', { className: 'ifr-confirm' },
                h('span', { className: 'ifr-confirm-text' }, t('delete.confirm')),
                h('button', {
                  type: 'button',
                  className: 'ifr-confirm-yes',
                  disabled: deleting,
                  onClick: remove,
                }, t('delete.confirmYes')),
                h('button', {
                  type: 'button',
                  className: 'ifr-confirm-no',
                  disabled: deleting,
                  onClick: () => setConfirming(false),
                }, t('delete.confirmNo')),
              )
            : [
                h('button', {
                  type: 'button',
                  className: 'ifr-mini',
                  key: 'edit',
                  title: t('action.edit'),
                  'aria-label': t('action.edit'),
                  onClick: () => props.onEdit(record),
                }, h(EditIcon)),
                h('button', {
                  type: 'button',
                  className: 'ifr-mini ifr-danger',
                  key: 'delete',
                  title: t('action.delete'),
                  'aria-label': t('action.delete'),
                  onClick: () => setConfirming(true),
                }, h(TrashIcon)),
              ],
        ),
      )
    }

    /* ------------------------------------------------------------------ */
    /* Record dialog                                                       */
    /* ------------------------------------------------------------------ */

    function RecordDialog(props) {
      const t = props.t
      const record = props.record
      const editing = record !== null && record !== undefined
      const [form, setForm] = React.useState(() => ({
        site: editing ? record.site || '' : '',
        url: editing ? record.url || '' : '',
        username: editing ? record.username || '' : '',
        password: editing ? record.password || '' : '',
        notes: editing ? record.notes || '' : '',
        tags: editing && Array.isArray(record.tags) ? record.tags.join(', ') : '',
        agentAllowed: editing ? record.agentAllowed !== false : true,
      }))
      const [showPassword, setShowPassword] = React.useState(!editing)
      const [error, setError] = React.useState('')
      const [saving, setSaving] = React.useState(false)
      const firstRef = React.useRef(null)
      const dialogRef = React.useRef(null)

      React.useEffect(() => {
        if (firstRef.current && typeof firstRef.current.focus === 'function') firstRef.current.focus()
        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            props.onClose()
            return
          }
          if (event.key !== 'Tab' || dialogRef.current === null) return
          const focusable = dialogRef.current.querySelectorAll(
            'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href]'
          )
          if (focusable.length === 0) return
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [props.onClose])

      const update = (key, value) => setForm((current) => Object.assign({}, current, { [key]: value }))

      const submit = async (event) => {
        event.preventDefault()
        if (saving) return
        const site = form.site.trim()
        if (site === '') {
          setError(t('validation.site'))
          firstRef.current?.focus()
          return
        }
        if (form.username.trim() === '' && form.password === '') {
          setError(t('validation.credentials'))
          return
        }
        setSaving(true)
        setError('')
        try {
          await props.onSave({
            id: editing ? record.id : undefined,
            site,
            url: form.url.trim(),
            username: form.username.trim(),
            password: form.password,
            notes: form.notes.trim(),
            tags: parseTags(form.tags),
            agentAllowed: form.agentAllowed !== false,
          })
          props.onClose()
        } catch (failure) {
          setError(t('error.save') + '：' + (failure instanceof Error ? failure.message : String(failure)))
        } finally {
          setSaving(false)
        }
      }

      return h('div', {
        className: 'ifr-modal-backdrop',
        onMouseDown: (event) => {
          if (event.target === event.currentTarget) props.onClose()
        },
      }, h('div', {
        className: 'ifr-modal',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'ifr-dialog-title',
        ref: dialogRef,
      },
        h('div', { className: 'ifr-modal-head' },
          h('div', null,
            h('h2', { className: 'ifr-modal-title', id: 'ifr-dialog-title' }, editing ? t('modal.editTitle') : t('modal.addTitle')),
            h('div', { className: 'ifr-modal-hint' }, t('modal.addHint')),
          ),
          h('button', {
            type: 'button',
            className: 'ifr-icon-button',
            title: t('action.cancel'),
            'aria-label': t('action.cancel'),
            onClick: props.onClose,
          }, h(CloseIcon)),
        ),
        h('form', { className: 'ifr-form', onSubmit: submit },
          h('div', { className: 'ifr-grid' },
            h('label', { className: 'ifr-label' },
              h('span', { className: 'ifr-label-text' }, t('field.site'), h('span', { className: 'ifr-req' }, '*')),
              h('input', {
                className: 'ifr-control',
                value: form.site,
                ref: firstRef,
                placeholder: t('field.siteHint'),
                onChange: (event) => update('site', event.target.value),
                maxLength: 120,
              }),
            ),
            h('label', { className: 'ifr-label' },
              h('span', { className: 'ifr-label-text' }, t('field.url')),
              h('input', {
                className: 'ifr-control',
                value: form.url,
                placeholder: 'https://',
                onChange: (event) => update('url', event.target.value),
                maxLength: 2048,
                inputMode: 'url',
              }),
            ),
          ),
          h('label', { className: 'ifr-label' },
            h('span', { className: 'ifr-label-text' }, t('field.username')),
            h('input', {
              className: 'ifr-control',
              value: form.username,
              placeholder: t('field.usernameHint'),
              onChange: (event) => update('username', event.target.value),
              maxLength: 256,
              autoComplete: 'off',
              spellCheck: 'false',
            }),
          ),
          h('label', { className: 'ifr-label' },
            h('span', { className: 'ifr-label-text' }, t('field.password')),
            h('div', { className: 'ifr-secret-wrap' },
              h('input', {
                className: 'ifr-control',
                type: showPassword ? 'text' : 'password',
                value: form.password,
                placeholder: t('field.passwordHint'),
                onChange: (event) => update('password', event.target.value),
                maxLength: 512,
                autoComplete: 'new-password',
                spellCheck: 'false',
              }),
              h('button', {
                type: 'button',
                className: 'ifr-secret-toggle',
                title: showPassword ? t('action.hide') : t('action.reveal'),
                'aria-label': showPassword ? t('action.hide') : t('action.reveal'),
                'aria-pressed': showPassword ? 'true' : 'false',
                onClick: () => setShowPassword((value) => !value),
              }, h(EyeIcon, { off: !showPassword })),
            ),
          ),
          h('label', { className: 'ifr-label' },
            h('span', { className: 'ifr-label-text' }, t('field.notes')),
            h('textarea', {
              className: 'ifr-control ifr-textarea',
              value: form.notes,
              placeholder: t('field.notesHint'),
              onChange: (event) => update('notes', event.target.value),
              maxLength: 2000,
            }),
          ),
          h('label', { className: 'ifr-label' },
            h('span', { className: 'ifr-label-text' }, t('field.tags')),
            h('input', {
              className: 'ifr-control',
              value: form.tags,
              placeholder: t('field.tagsHint'),
              onChange: (event) => update('tags', event.target.value),
              maxLength: 240,
            }),
          ),
          h('div', { className: 'ifr-setting ifr-dialog-setting' },
            h('div', { className: 'ifr-setting-text' },
              h('div', { className: 'ifr-setting-name' }, t('field.agentAllowed')),
              h('div', { className: 'ifr-setting-desc' }, t('field.agentAllowedDesc')),
            ),
            h(Switch, {
              checked: form.agentAllowed !== false,
              label: t('field.agentAllowed'),
              onChange: (next) => update('agentAllowed', next),
            }),
          ),
          error !== '' ? h('div', { className: 'ifr-form-error', role: 'alert' }, error) : null,
          h('div', { className: 'ifr-form-actions' },
            h('button', {
              type: 'button',
              className: 'ifr-button',
              onClick: props.onClose,
              disabled: saving,
            }, t('action.cancel')),
            h('button', {
              type: 'submit',
              className: 'ifr-button ifr-primary',
              disabled: saving,
            }, saving ? t('action.saving') : t('action.save')),
          ),
        ),
      ))
    }

    /* ------------------------------------------------------------------ */
    /* Settings panel                                                      */
    /* ------------------------------------------------------------------ */

    function SettingsPanel(props) {
      const t = props.t
      const store = useStore()
      const [busy, setBusy] = React.useState('')
      const [toast, showToast] = useToast()
      const data = store.data
      const settings = data && data.settings ? data.settings : {}
      const security = data && data.security ? data.security : null
      const protection = security && typeof security.protection === 'string' ? security.protection : 'unknown'
      const protectionKey = {
        dpapi: 'settings.security.dpapi',
        keychain: 'settings.security.keychain',
        'secret-tool': 'settings.security.secretTool',
        file: 'settings.security.file',
      }[protection] || 'settings.security.unknown'

      const toggle = async (key) => {
        if (busy !== '') return
        const next = !settings[key]
        setBusy(key)
        try {
          await updateSettings({ [key]: next })
        } catch (error) {
          showToast(t('error.settings') + '：' + (error instanceof Error ? error.message : String(error)))
        } finally {
          setBusy('')
        }
      }

      const copyPath = async () => {
        if (!data || !data.path) return
        const ok = await copyText(data.path)
        showToast(ok ? t('action.copied') : t('action.copyFailed'))
      }

      if (store.status === 'loading' && data === null) {
        return h('div', { className: 'ifr-loading' }, h('span', { className: 'ifr-spinner' }), t('settings.loading'))
      }

      if (store.status === 'error' && data === null) {
        return h('div', { className: 'ifr-error', role: 'alert' },
          h('div', null, t('error.title') + '：' + store.error),
          h('button', { type: 'button', className: 'ifr-button', onClick: () => { patch({ status: 'loading' }); void refresh() } }, t('error.retry')),
        )
      }

      return h('div', { className: 'ifr-settings' },
        h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
        h('div', { className: 'ifr-section' },
          h('div', { className: 'ifr-section-title' }, t('settings.group.access')),
          h('div', { className: 'ifr-setting' },
            h('div', { className: 'ifr-setting-text' },
              h('div', { className: 'ifr-setting-name' }, t('settings.agentAccess')),
              h('div', { className: 'ifr-setting-desc' }, t('settings.agentAccessDesc')),
            ),
            h(Switch, {
              checked: settings.agentAccess !== false,
              label: t('settings.agentAccess'),
              disabled: busy !== '',
              onChange: () => toggle('agentAccess'),
            }),
          ),
          h('div', { className: 'ifr-setting' },
            h('div', { className: 'ifr-setting-text' },
              h('div', { className: 'ifr-setting-name' }, t('settings.revealSecrets')),
              h('div', { className: 'ifr-setting-desc' }, t('settings.revealSecretsDesc')),
            ),
            h(Switch, {
              checked: settings.revealSecrets !== false,
              label: t('settings.revealSecrets'),
              disabled: busy !== '' || settings.agentAccess === false,
              onChange: () => toggle('revealSecrets'),
            }),
          ),
        ),
        h('div', { className: 'ifr-section' },
          h('div', { className: 'ifr-section-title' }, t('settings.group.capture')),
          h('div', { className: 'ifr-setting' },
            h('div', { className: 'ifr-setting-text' },
              h('div', { className: 'ifr-setting-name' }, t('settings.autoLearn')),
              h('div', { className: 'ifr-setting-desc' }, t('settings.autoLearnDesc')),
            ),
            h(Switch, {
              checked: settings.autoLearn !== false,
              label: t('settings.autoLearn'),
              disabled: busy !== '',
              onChange: () => toggle('autoLearn'),
            }),
          ),
        ),
        h('div', { className: 'ifr-section' },
          h('div', { className: 'ifr-section-title' }, t('settings.group.storage')),
          h('div', { className: 'ifr-storage' },
            h('div', { className: 'ifr-storage-row' },
              h('span', { className: 'ifr-storage-label' }, t('settings.storageCount')),
              h('span', { className: 'ifr-storage-value' }, String(data ? data.count : 0)),
            ),
            h('div', { className: 'ifr-storage-row' },
              h('span', { className: 'ifr-storage-label' }, t('settings.storageUpdated')),
              h('span', { className: 'ifr-storage-value' }, relativeTime(data ? data.updatedAt : 0, t)),
            ),
            h('div', { className: 'ifr-storage-row' },
              h('span', { className: 'ifr-storage-label' }, t('settings.storageSecurity')),
              h('span', { className: 'ifr-storage-value' }, t(protectionKey)),
            ),
            h('div', { className: 'ifr-storage-row' },
              h('span', { className: 'ifr-storage-label' }, t('settings.storagePath')),
              h('span', { className: 'ifr-storage-value' }, data && data.path ? data.path : '—'),
              data && data.path
                ? h('button', {
                    type: 'button',
                    className: 'ifr-mini',
                    title: t('settings.copyPath'),
                    'aria-label': t('settings.copyPath'),
                    onClick: copyPath,
                  }, h(CopyIcon))
                : null,
            ),
            protection === 'file'
              ? h('div', { className: 'ifr-storage-note ifr-warn' }, t('settings.security.warning'))
              : null,
            h('div', { className: 'ifr-storage-note' }, t('settings.storageNote')),
          ),
        ),
        h(Toast, { text: toast }),
      )
    }

    function SettingsPage(props) {
      const t = props.t
      return h('div', { className: 'ifr-root' },
        h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
        h('div', { className: 'ifr-page' },
          h('div', { className: 'ifr-header' },
            h('div', { className: 'ifr-heading' },
              h('h1', { className: 'ifr-title' }, t('settings.title')),
              h('div', { className: 'ifr-subtitle' }, t('settings.subtitle')),
            ),
          ),
          h('div', { style: { height: '16px' } }),
          h(SettingsPanel, { t }),
          h('div', { className: 'ifr-footer' }, t('footer')),
        ),
      )
    }

    /* ------------------------------------------------------------------ */
    /* Main page                                                           */
    /* ------------------------------------------------------------------ */

    function RecordsPage(props) {
      const t = props.t
      const store = useStore()
      const [view, setView] = React.useState('records')
      const [query, setQuery] = React.useState('')
      const [dialog, setDialog] = React.useState(null)
      const [toast, showToast] = useToast()
      const closeDialog = React.useCallback(() => setDialog(null), [])

      const data = store.data
      const records = data && Array.isArray(data.records) ? data.records : []
      const filtered = React.useMemo(() => {
        const list = records.filter((record) => matchesQuery(record, query))
        list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        return list
      }, [records, query])

      const onSave = async (record) => {
        await saveRecord(record)
        showToast(t('action.save'))
      }

      const onDelete = async (id) => {
        await deleteRecord(id)
      }

      const header = h('div', { className: 'ifr-header' },
        h('div', { className: 'ifr-heading' },
          h('h1', { className: 'ifr-title' }, view === 'settings' ? t('settings.title') : t('title')),
          h('div', { className: 'ifr-subtitle' }, view === 'settings' ? t('settings.subtitle') : t('subtitle')),
        ),
        h('div', { className: 'ifr-header-actions' },
          view === 'records'
            ? h(React.Fragment, null,
                h(IconButton, {
                  title: t('action.refresh'),
                  onClick: () => { void refresh() },
                  disabled: store.status === 'loading',
                }, h(RefreshIcon)),
                h(IconButton, {
                  title: t('action.settings'),
                  active: false,
                  onClick: () => setView('settings'),
                }, h(GearIcon)),
                h('button', {
                  type: 'button',
                  className: 'ifr-button ifr-primary',
                  onClick: () => setDialog({ record: null }),
                }, h(PlusIcon), t('action.add')),
              )
            : h('button', {
                type: 'button',
                className: 'ifr-button',
                onClick: () => setView('records'),
              }, t('action.back')),
        ),
      )

      let body = null
      if (view === 'settings') {
        body = h(SettingsPanel, { t })
      } else if (store.status === 'loading' && data === null) {
        body = h('div', { className: 'ifr-loading' }, h('span', { className: 'ifr-spinner' }), t('loading'))
      } else if (store.status === 'error' && data === null) {
        body = h('div', { className: 'ifr-error', role: 'alert' },
          h('div', null, t('error.title') + '：' + store.error),
          h('button', {
            type: 'button',
            className: 'ifr-button',
            onClick: () => { patch({ status: 'loading' }); void refresh() },
          }, t('error.retry')),
        )
      } else {
        body = h(React.Fragment, null,
          h('div', { className: 'ifr-stats' },
            h('span', null, t('stat.count', { n: records.length })),
            h('span', null, t('stat.last', { time: relativeTime(data ? data.updatedAt : 0, t) })),
          ),
          h('div', { className: 'ifr-toolbar' },
            h('div', { className: 'ifr-search' },
              h('span', { className: 'ifr-search-icon' }, h(SearchIcon)),
              h('input', {
                className: 'ifr-input',
                type: 'search',
                value: query,
                placeholder: t('search.placeholder'),
                'aria-label': t('search.placeholder'),
                onChange: (event) => setQuery(event.target.value),
              }),
              query !== ''
                ? h('button', {
                    type: 'button',
                    className: 'ifr-search-clear',
                    title: t('search.clear'),
                    'aria-label': t('search.clear'),
                    onClick: () => setQuery(''),
                  }, h(CloseIcon))
                : null,
            ),
          ),
          data && data.settings && data.settings.autoLearn !== true
            ? h('div', { className: 'ifr-banner' },
                h('span', { className: 'ifr-banner-icon' }, h(ShieldIcon)),
                h('span', { className: 'ifr-banner-text' }, t('banner.autoLearnOff')),
                h('button', {
                  type: 'button',
                  className: 'ifr-button',
                  onClick: () => setView('settings'),
                }, t('banner.enable')),
              )
            : null,
          records.length === 0
            ? h('div', { className: 'ifr-empty' },
                h('div', { className: 'ifr-empty-icon' }, h(ShieldIcon)),
                h('div', { className: 'ifr-empty-title' }, t('empty.title')),
                h('div', { className: 'ifr-empty-body' }, t('empty.body')),
                h('button', {
                  type: 'button',
                  className: 'ifr-button ifr-primary ifr-empty-action',
                  onClick: () => setDialog({ record: null }),
                }, h(PlusIcon), t('empty.action')),
              )
            : filtered.length === 0
              ? h('div', { className: 'ifr-empty' },
                  h('div', { className: 'ifr-empty-icon' }, h(SearchIcon)),
                  h('div', { className: 'ifr-empty-title' }, t('empty.filtered')),
                  h('div', { className: 'ifr-empty-body' }, t('empty.filteredHint')),
                )
              : h('div', { className: 'ifr-list' },
                  filtered.map((record) => h(RecordCard, {
                    key: record.id,
                    record,
                    t,
                    onEdit: (target) => setDialog({ record: target }),
                    onDelete,
                    onToast: showToast,
                  })),
                ),
        )
      }

      return h('div', { className: 'ifr-root' },
        h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
        h('div', { className: 'ifr-page' },
          header,
          body,
          h('div', { className: 'ifr-footer' }, t('footer')),
        ),
        dialog !== null
          ? h(RecordDialog, {
              t,
              record: dialog.record,
              onClose: closeDialog,
              onSave,
            })
          : null,
        h(Toast, { text: toast }),
      )
    }

    /* ------------------------------------------------------------------ */
    /* Crash boundary                                                      */
    /* ------------------------------------------------------------------ */

    class Boundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null }
      }

      static getDerivedStateFromError(error) {
        return { error }
      }

      componentDidCatch(error, info) {
        if (typeof console !== 'undefined' && typeof console.error === 'function') {
          console.error('info-records: render failed', error, info)
        }
      }

      render() {
        const t = typeof this.props.t === 'function' ? this.props.t : (key) => key
        if (this.state.error) {
          return h('div', { className: 'ifr-root' },
            h('div', { className: 'ifr-crash' },
              h('div', null, t('crash.title')),
              h('div', null, String(this.state.error && this.state.error.message || this.state.error)),
              h('button', {
                type: 'button',
                className: 'ifr-button',
                onClick: () => window.location.reload(),
              }, t('crash.retry')),
            ),
          )
        }
        return this.props.children
      }
    }

    function Guarded(props) {
      return h(Boundary, { t: props.t }, h(props.component, props))
    }

    /* ------------------------------------------------------------------ */
    /* Client plugin                                                       */
    /* ------------------------------------------------------------------ */

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'info-records: dictionaries')
      const bound = ctx.locale.bind(NS)
      const t = typeof bound === 'function' ? bound : makeT(zh)

      const resolveT = (props) => {
        if (props && typeof props.t === 'function') return props.t
        return t
      }

      // Sidebar entry: a fresh id with order 40 lands directly below the shipped
      // Skill Center (skill-explorer, order 30); clicking it selects the `main`
      // panel registered under the same key.
      ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: NS,
        order: 40,
        locale: NS,
        label: () => t('title'),
      }, (props) => h(PanelIcon, { size: props && props.size, active: props && props.active }))), 'info-records: sidebar entry')

      ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: NS,
        locale: NS,
      }, (props) => h(Guarded, Object.assign({}, props, {
        component: RecordsPage,
        t: resolveT(props),
      })))), 'info-records: main panel')

      // The same toggles are reachable from the Settings panel, so users who
      // look for "plugin settings" there do not have to find the nav entry.
      ctx.effect(() => ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: NS,
        order: 60,
        locale: NS,
        label: () => t('settings.nav'),
      }, (props) => h(Guarded, Object.assign({}, props, {
        component: SettingsPage,
        t: resolveT(props),
      })))), 'info-records: settings section')
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    }
  },
})
