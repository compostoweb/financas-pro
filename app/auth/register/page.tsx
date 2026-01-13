"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const validatePassword = (password: string) => {
    // Requisitos: 8+ caracteres, 1 maiúscula, 1 número, 1 caractere especial
    const hasMinLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    return {
      valid: hasMinLength && hasUpperCase && hasNumber && hasSpecialChar,
      strength: [hasMinLength, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      // Validações
      if (!formData.name.trim()) {
        setError("Nome é obrigatório")
        return
      }

      if (!formData.email.trim()) {
        setError("Email é obrigatório")
        return
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Email inválido")
        return
      }

      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.valid) {
        setError("Senha deve ter: 8+ caracteres, 1 maiúscula, 1 número, 1 caractere especial")
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não conferem")
        return
      }

      // Registrar usuário
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao criar conta")
        toast.error(data.error || "Erro ao criar conta")
        return
      }

      setSuccess(true)
      toast.success("Conta criada com sucesso! Fazendo login...")

      // Auto login após registro bem-sucedido
      setTimeout(async () => {
        await signIn("credentials", {
          email: formData.email.toLowerCase(),
          password: formData.password,
          redirect: true,
          callbackUrl: "/",
        })
      }, 1500)
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.")
      toast.error("Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordValidation = validatePassword(formData.password)
  const passwordStrengthColor = 
    passwordValidation.strength <= 1 ? "bg-red-500" :
    passwordValidation.strength <= 2 ? "bg-yellow-500" :
    passwordValidation.strength <= 3 ? "bg-blue-500" :
    "bg-emerald-500"

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

        {/* Card de Registro */}
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Crie sua Conta</CardTitle>
            <CardDescription className="text-slate-400">
              Comece a gerenciar suas finanças agora
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

            {/* Sucesso */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-sm text-emerald-500">Conta criada! Redirecionando...</p>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Seu Nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isLoading || success}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading || success}
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
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading || success}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>
                {formData.password && (
                  <div className="text-xs text-slate-400">
                    <div className="flex gap-1 mt-2">
                      <div className={`h-1 flex-1 rounded ${passwordStrengthColor} opacity-30`}></div>
                      <div className={`h-1 flex-1 rounded ${passwordValidation.strength >= 2 ? passwordStrengthColor : 'bg-slate-600'} opacity-30`}></div>
                      <div className={`h-1 flex-1 rounded ${passwordValidation.strength >= 3 ? passwordStrengthColor : 'bg-slate-600'} opacity-30`}></div>
                      <div className={`h-1 flex-1 rounded ${passwordValidation.strength >= 4 ? passwordStrengthColor : 'bg-slate-600'} opacity-30`}></div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className={/^.{8,}$/.test(formData.password) ? "text-emerald-400" : "text-slate-500"}>
                        ✓ 8+ caracteres
                      </p>
                      <p className={/[A-Z]/.test(formData.password) ? "text-emerald-400" : "text-slate-500"}>
                        ✓ 1 maiúscula
                      </p>
                      <p className={/[0-9]/.test(formData.password) ? "text-emerald-400" : "text-slate-500"}>
                        ✓ 1 número
                      </p>
                      <p className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "text-emerald-400" : "text-slate-500"}>
                        ✓ 1 caractere especial
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isLoading || success}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || success}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {isLoading ? "Criando conta..." : success ? "Redirecionando..." : "Criar Conta"}
              </Button>
            </form>

            {/* Link para Login */}
            <p className="text-center text-sm text-slate-400">
              Já tem conta?{" "}
              <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300">
                Faça login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
