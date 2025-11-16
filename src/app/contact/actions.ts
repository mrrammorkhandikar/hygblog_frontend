'use server'

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'http://localhost:8080'
  : 'http://localhost:8080';

export type ContactState = {
  ok: boolean
  message: string
}

export async function sendContact(_prevState: ContactState | undefined, formData: FormData): Promise<ContactState> {
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const subject = String(formData.get('subject') || '').trim()
  const message = String(formData.get('message') || '').trim()
  const unique_user_id = formData.get('unique_user_id')

  if (!name || !email || !message) {
    return { ok: false, message: 'Please fill in all required fields.' }
  }
  // Very simple email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: 'Please provide a valid email address.' }
  }

  try {
    // Prepare payload for backend
    const payload: any = {
      name,
      email,
      message
    }

    if (subject) {
      payload.subject = subject
    }

    if (unique_user_id) {
      payload.unique_user_id = unique_user_id
    }

    // Call backend API
    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()

    return { ok: true, message: 'Thank you! Your message has been sent successfully.' }
  } catch (error: any) {
    console.error('Contact submission error:', error)
    return { ok: false, message: error.message || 'Failed to send message. Please try again.' }
  }
}
