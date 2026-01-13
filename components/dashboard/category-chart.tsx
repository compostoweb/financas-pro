"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Loader2, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

const FALLBACK_COLOR = "#94a3b8"; 

// Adicionamos a prop onCategoryClick
interface CategoryChartProps {
  transactions: any[];
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

export function CategoryChart({ transactions, onCategoryClick, selectedCategory }: CategoryChartProps) {
  const [mounted, setMounted] = useState(false);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadColors = async () => {
      try {
        const res = await fetch("/api/categories");
        const categories = await res.json();
        
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
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const data = transactions
    .filter((t) => t.type === "DESPESA_EMPRESA" || t.type === "DESPESA_SOCIO")
    .reduce((acc: any[], curr) => {
      const categoryName = curr.category || "Sem Categoria"; 
      const existing = acc.find((item) => item.name === categoryName);
      
      if (existing) {
        existing.value += Number(curr.amount);
      } else {
        const color = categoryColors[categoryName] || FALLBACK_COLOR;
        acc.push({ 
            name: categoryName, 
            value: Number(curr.amount),
            color: color 
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value); 

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <Card className="col-span-1 shadow-sm border border-slate-200 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Despesas por Categoria</CardTitle>
        {selectedCategory && (
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-slate-500" 
                onClick={() => onCategoryClick && onCategoryClick("")} // Limpar filtro
            >
                <FilterX className="mr-1 h-3 w-3" />
                Limpar Filtro
            </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <div className={`h-full w-full ${!mounted ? "flex items-center justify-center" : "block"}`}>
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
                  // AQUI ESTÁ O DRILL-DOWN:
                  onClick={(data) => {
                      if (onCategoryClick) onCategoryClick(data.name);
                  }}
                  className="cursor-pointer outline-none"
                >
                  {data.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke={entry.color} 
                        // Destaca visualmente a fatia selecionada (opacidade nos outros)
                        opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 1}
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''} 
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