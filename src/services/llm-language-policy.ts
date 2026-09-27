const POLICY_MARKER = '[Vela Language Policy]'

type LLMMessage = { role: string; content: string }

function normalizeLocale(locale?: string): string {
  return (locale || '').trim().toLowerCase()
}

function getChineseScriptPolicy(locale?: string): string | null {
  const lang = normalizeLocale(locale)
  if (!lang) return null

  if (lang === 'zh-tw' || lang === 'zh-hk' || lang === 'zh-mo' || lang.startsWith('zh-hant')) {
    return `${POLICY_MARKER} If the response contains Chinese, you must use Traditional Chinese characters (zh-TW). Never use Simplified Chinese characters.`
  }

  if (lang === 'zh-cn' || lang === 'zh-sg' || lang.startsWith('zh-hans')) {
    return `${POLICY_MARKER} If the response contains Chinese, you must use Simplified Chinese characters (zh-CN). Never use Traditional Chinese characters.`
  }

  return null
}

export function applyLanguagePolicyToMessages<T extends LLMMessage>(messages: T[], locale?: string): T[] {
  const policy = getChineseScriptPolicy(locale)
  if (!policy) return messages

  if (messages.some(m => m.role === 'system' && m.content.includes(POLICY_MARKER))) {
    return messages
  }

  const systemIndex = messages.findIndex(m => m.role === 'system')
  if (systemIndex >= 0) {
    const next = [...messages]
    const current = next[systemIndex]
    next[systemIndex] = {
      ...current,
      content: `${current.content.trim()}\n\n${policy}`,
    } as T
    return next
  }

  return [{ role: 'system', content: policy } as T, ...messages]
}