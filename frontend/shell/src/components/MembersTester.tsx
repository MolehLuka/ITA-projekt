import { useState } from 'react'

type ApiResult = {
  title: string
  status: number | 'network'
  body: unknown
}

const TOKEN_STORAGE_KEY = 'members_jwt_token'

export function MembersTester() {
  const [token, setToken] = useState<string>(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) ?? '',
  )
  const [result, setResult] = useState<ApiResult | null>(null)
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const [loginForm, setLoginForm] = useState({
    usernameOrEmail: '',
    password: '',
  })
  const [memberId, setMemberId] = useState('')

  const setTokenAndPersist = (nextToken: string) => {
    setToken(nextToken)
    if (nextToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }

  const requestJson = async (
    title: string,
    url: string,
    init?: RequestInit,
  ): Promise<{ response: Response; payload: unknown }> => {
    try {
      const response = await fetch(url, init)
      const raw = await response.text()
      let payload: unknown = raw
      try {
        payload = raw ? JSON.parse(raw) : null
      } catch {
        payload = raw
      }
      setResult({
        title,
        status: response.status,
        body: payload,
      })
      return { response, payload }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setResult({
        title,
        status: 'network',
        body: { message },
      })
      throw error
    }
  }

  const registerMember = async () => {
    const { response, payload } = await requestJson(
      'POST /api/members/register',
      '/api/members/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      },
    )
    if (response.ok && typeof payload === 'object' && payload) {
      const tokenValue = (payload as { token?: string }).token
      if (tokenValue) {
        setTokenAndPersist(tokenValue)
      }
    }
  }

  const loginMember = async () => {
    const payload =
      loginForm.usernameOrEmail.includes('@')
        ? { email: loginForm.usernameOrEmail, password: loginForm.password }
        : { username: loginForm.usernameOrEmail, password: loginForm.password }
    const { response, payload: responsePayload } = await requestJson(
      'POST /api/members/login',
      '/api/members/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )
    if (response.ok && typeof responsePayload === 'object' && responsePayload) {
      const tokenValue = (responsePayload as { token?: string }).token
      if (tokenValue) {
        setTokenAndPersist(tokenValue)
      }
    }
  }

  const getMe = async () => {
    await requestJson('GET /api/members/me', '/api/members/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
  }

  const getMemberById = async () => {
    await requestJson(`GET /api/members/${memberId}`, `/api/members/${memberId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
  }

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xl font-medium">Members endpoint tester</h2>

      <div className="rounded-lg border border-slate-200 p-3">
        <label className="mb-1 block text-sm font-medium">JWT token</label>
        <textarea
          value={token}
          onChange={(event) => setTokenAndPersist(event.target.value)}
          className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Token is auto-filled after register/login..."
        />
        <button
          type="button"
          onClick={() => setTokenAndPersist('')}
          className="mt-2 rounded-lg border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
        >
          Clear token
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3">
          <h3 className="mb-2 text-lg font-medium">Register</h3>
          <div className="grid grid-cols-1 gap-2">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="username"
              value={registerForm.username}
              onChange={(event) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  username: event.target.value,
                }))
              }
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="email"
              value={registerForm.email}
              onChange={(event) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
            />
            <input
              type="password"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="password"
              value={registerForm.password}
              onChange={(event) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="firstName (optional)"
              value={registerForm.firstName}
              onChange={(event) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  firstName: event.target.value,
                }))
              }
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="lastName (optional)"
              value={registerForm.lastName}
              onChange={(event) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  lastName: event.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={registerMember}
              className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
            >
              POST /members/register
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <h3 className="mb-2 text-lg font-medium">Login</h3>
          <div className="grid grid-cols-1 gap-2">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="username or email"
              value={loginForm.usernameOrEmail}
              onChange={(event) =>
                setLoginForm((prev) => ({
                  ...prev,
                  usernameOrEmail: event.target.value,
                }))
              }
            />
            <input
              type="password"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="password"
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={loginMember}
              className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
            >
              POST /members/login
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <h3 className="mb-2 text-lg font-medium">Protected reads</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={getMe}
            className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
          >
            GET /members/me
          </button>
          <input
            className="min-w-72 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="member UUID"
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
          />
          <button
            type="button"
            onClick={getMemberById}
            className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
          >
            GET /members/:id
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <h3 className="mb-2 text-lg font-medium">Last API response</h3>
        {result ? (
          <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-slate-600">
            No calls made yet in Members tester.
          </p>
        )}
      </div>
    </section>
  )
}
