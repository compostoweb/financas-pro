import { Session } from "next-auth"
import { useSession } from "next-auth/react"

export interface ExtendedSession extends Session {
  user: Session["user"] & {
    id: string
  }
}

export function useAuth() {
  const { data: session, status, update } = useSession()

  return {
    session: session as ExtendedSession | null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
    user: (session as ExtendedSession)?.user || null,
    update,
  }
}
