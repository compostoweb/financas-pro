"use client"

import { Suspense } from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Mail, Lock, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFFFFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#FFFFFF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FFFFFF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#FFFFFF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!email || !password) {
        setError("Email e senha são obrigatórios")
        return
      }

      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      })

      if (!result?.ok) {
        setError(result?.error || "Email ou senha inválidos")
        toast.error(result?.error || "Falha ao fazer login")
        return
      }

      toast.success("Login realizado com sucesso!")
      router.push(callbackUrl)
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.")
      toast.error("Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await signIn("google", {
      callbackUrl: callbackUrl,
    })
  }

  return (
    <div className="min-h-screen w-screen flex flex-col items-center pt-[50px] md:pt-0 md:justify-center justify-start bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <PieChart className="w-10 h-10 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Financeiro</h1>
      </div>

      {/* Card Principal */}
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 shadow-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-white text-2xl">Bem-vindo</CardTitle>
          <CardDescription className="text-slate-400">
            Faça login para acessar seu painel financeiro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mensagem de Erro */}
          {error && (
            <div className="flex items-gap-2 rounded-lg bg-red-900/20 border border-red-800 p-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Botão Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>


          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">ou</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full text-white font-medium"
            style={{
              backgroundColor: "#4285F4",
              borderColor: "#4285F4"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#357ae8"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4285F4"}
          >
            <GoogleIcon />
            Entrar com Google
          </Button>



          {/* Link para Registro */}
{/*          <p className="text-center text-sm text-slate-400">
            Não tem uma conta?{" "}
            <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Criar conta
            </Link>
          </p> 
*/}
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Sistema de Gestão Financeira • v1.0
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-screen bg-slate-900" />}>
      <LoginContent />
    </Suspense>
  )
}
