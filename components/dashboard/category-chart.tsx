"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Loader2 } from "lucide-react";

// Fallback: Cores padrão caso alguma categoria não tenha cor definida no banco
const FALLBACK_COLOR = "#94a3b8"; // Slate 400

export function CategoryChart({ transactions }: { transactions: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 1. Busca as cores das categorias salvas no banco
    const loadColors = async () => {
      try {
        const res = await fetch("/api/categories");
        const categories = await res.json();
        
        // Transforma o array em um objeto simples: { "Marketing": "#ff0000", "Vendas": "#00ff00" }
        const colorMap: Record<string, string> = {};
        categories.forEach((cat: any) => {
          colorMap[cat.name] = cat.color;
        });
        
        setCategoryColors(colorMap);
      } catch (error) {
        console.error("Erro ao carregar cores", error);
      }
    };

    loadColors();

    // 2. Garante montagem segura do componente (evita erros de hidratação/grid)
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // 3. Processa os dados cruzando com as cores
  const data = transactions
    .filter((t) => t.type === "DESPESA_EMPRESA" || t.type === "DESPESA_SOCIO")
    .reduce((acc: any[], curr) => {
      const categoryName = curr.category || "Sem Categoria"; 
      const existing = acc.find((item) => item.name === categoryName);
      
      if (existing) {
        existing.value += Number(curr.amount);
      } else {
        // AQUI ESTÁ A MÁGICA: Busca a cor no mapa ou usa o fallback
        const color = categoryColors[categoryName] || FALLBACK_COLOR;
        
        acc.push({ 
            name: categoryName, 
            value: Number(curr.amount),
            color: color // Salvamos a cor dentro do dado
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value); 

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <Card className="col-span-1 shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-medium">Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`h-[300px] w-full ${!mounted ? "flex items-center justify-center" : "block"}`}>
          {!mounted ? (
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          ) : data.length > 0 ? (
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    // Agora usamos a cor que veio do banco de dados (entry.color)
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number) => formatCurrency(value)} 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    itemStyle={{ color: "#1e293b" }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex h-full items-center justify-center text-slate-400 text-sm">
               Nenhuma despesa no período
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}