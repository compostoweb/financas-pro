"use client"

import { Suspense } from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Mail, Lock, AlertCircle, Chrome } from "lucide-react"
import { toast } from "sonner"

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
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
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
            <Chrome className="w-5 h-5 mr-2" />
            Entrar com Google
          </Button>

          {/* Link para Registro */}
          <p className="text-center text-sm text-slate-400">
            Não tem uma conta?{" "}
            <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Criar conta
            </Link>
          </p>
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
