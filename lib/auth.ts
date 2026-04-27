import { SessionOptions } from 'iron-session'

export const sessionOptions: SessionOptions = {
  cookieName: 'parsco_session',
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  },
}

export interface SessionData {
  authenticated?: boolean
}
