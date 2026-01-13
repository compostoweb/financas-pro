"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Mail, Lock, AlertCircle, Chrome } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
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
    try {
      await signIn("google", { callbackUrl })
    } catch (err) {
      toast.error("Erro ao fazer login com Google")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PieChart className="h-10 w-10 text-emerald-400" />
            <span className="text-2xl font-bold text-white">Finanças Pro</span>
          </div>
          <p className="text-slate-400">Gestão Financeira Inteligente</p>
        </div>

        {/* Card de Login */}
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Faça Login</CardTitle>
            <CardDescription className="text-slate-400">
              Entre na sua conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Erro */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Formulário de Credentials */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">ou</span>
              </div>
            </div>

            {/* Google OAuth */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
            >
              <Chrome className="mr-2 h-4 w-4" />
              {isLoading ? "Conectando..." : "Entrar com Google"}
            </Button>

            {/* Link para Registro */}
            <p className="text-center text-sm text-slate-400">
              Não tem conta?{" "}
              <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300">
                Crie uma agora
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Sua conta é segura. Usamos criptografia de ponta a ponta.
        </p>
      </div>
    </div>
  )
}
