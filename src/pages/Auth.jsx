import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../lib/api'
import { useApp } from '../main'
import { trackAdobe } from '../lib/adobeDataLayer'
import { syncCustomerToSalesforce } from '../lib/salesforce'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { setUser } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  async function submit(e) {
    e.preventDefault()
    setError('')

    try {
      const { user } = await signIn({ email, password })

      setUser(user)

      await syncCustomerToSalesforce({
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || ''
      })

      trackAdobe('login', {
        user: {
          email: user.email,
          customerId: user.id
        }
      })

      navigate(location.state?.from || '/account')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your UrbanCart journey."
    >
      <form onSubmit={submit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <div className="error">{error}</div>}

        <button className="btn dark full">
          Sign in
        </button>

        <p className="auth-switch">
          New to UrbanCart? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  )
}

export function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  })

  const [error, setError] = useState('')

  const { setUser } = useApp()
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')

    try {
      const { user, needsEmailConfirmation } = await signUp(form)

      if (user && !needsEmailConfirmation) {
        setUser(user)
      }

      trackAdobe('registration', {
        user: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          customerId: user?.id || ''
        }
      })

      navigate('/login')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your favourites, track orders and shop faster."
    >
      <form onSubmit={submit} className="auth-form">

        <div className="two">
          <label>
            First name
            <input
              value={form.firstName}
              onChange={e =>
                setForm({
                  ...form,
                  firstName: e.target.value
                })
              }
              required
            />
          </label>

          <label>
            Last name
            <input
              value={form.lastName}
              onChange={e =>
                setForm({
                  ...form,
                  lastName: e.target.value
                })
              }
              required
            />
          </label>
        </div>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={e =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
            required
          />
        </label>

        <label>
          Phone number
          <input
            type="tel"
            value={form.phone}
            onChange={e =>
              setForm({
                ...form,
                phone: e.target.value
              })
            }
            placeholder="Enter your phone number"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            minLength="6"
            value={form.password}
            onChange={e =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
            required
          />
        </label>

        {error && <div className="error">{error}</div>}

        <button className="btn dark full">
          Create account
        </button>

        <p className="auth-switch">
          Already a member? <Link to="/login">Sign in</Link>
        </p>

      </form>
    </AuthShell>
  )
}

function AuthShell({ title, subtitle, children }) {
  return (
    <section className="auth-page">
      <div className="auth-image"></div>

      <div className="auth-panel">
        <span className="eyebrow">UrbanCart MEMBERS</span>

        <h1>{title}</h1>

        <p>{subtitle}</p>

        {children}
      </div>
    </section>
  )
}
