"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { 
  addDays, 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  addMonths, 
  startOfYear, 
  endOfYear,
  startOfWeek,
  endOfWeek 
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  
  const handleShortcut = (shortcut: string) => {
    const today = new Date()
    let newRange: DateRange | undefined

    switch (shortcut) {
      // --- NOVOS ATALHOS ---
      case "today":
        newRange = { from: today, to: today }
        break
      case "tomorrow":
        const tomorrow = addDays(today, 1)
        newRange = { from: tomorrow, to: tomorrow }
        break
      case "thisWeek":
        newRange = { 
            // Começa domingo ou segunda dependendo do locale, ptBR geralmente é domingo
            from: startOfWeek(today, { locale: ptBR }), 
            to: endOfWeek(today, { locale: ptBR }) 
        }
        break
      case "nextMonth":
        const nextMonth = addMonths(today, 1)
        newRange = { from: startOfMonth(nextMonth), to: endOfMonth(nextMonth) }
        break
        
      // --- ATALHOS ANTIGOS ---
      case "thisMonth":
        newRange = { from: startOfMonth(today), to: endOfMonth(today) }
        break
      case "lastMonth":
        const lastMonth = subMonths(today, 1)
        newRange = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
        break
      case "last3Months":
        newRange = { from: subMonths(today, 3), to: today }
        break
      case "thisYear":
        newRange = { from: startOfYear(today), to: endOfYear(today) }
        break
    }
    setDate(newRange)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal bg-white shadow-sm",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/y", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/y", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/y", { locale: ptBR })
              )
            ) : (
              <span>Selecione o período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            {/* BARRA LATERAL COM ATALHOS */}
            <div className="border-r border-slate-100 p-2 w-[160px] flex flex-col gap-1 bg-slate-50/50 overflow-y-auto max-h-[380px]">
                
                {/* Grupo 1: Rápidos */}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mt-1">Dia a Dia</p>
                <Button variant="ghost" size="sm" className="justify-start font-normal h-8 px-2" onClick={() => handleShortcut("today")}>Hoje</Button>
                <Button variant="ghost" size="sm" className="justify-start font-normal h-8 px-2" onClick={() => handleShortcut("tomorrow")}>Amanhã</Button>
                <Button variant="ghost" size="sm" className="justify-start font-normal h-8 px-2" onClick={() => handleShortcut("thisWeek")}>Esta Semana</Button>

                <div className="h-px bg-slate-200 my-1 mx-2" />

                {/* Grupo 2: Períodos */}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mt-1">Períodos</p>
                <Button variant="ghost" size="sm" className="justify-start font-normal h-8 px-2" onClick={() => handleShortcut("thisMonth")}>Este mês</Button>
                <Button variant="ghost" size="sm" className="justify-start font-normal h-8 px-2" onClick={() => handleShortcut("nextMonth")}>Mês que vem</Button>
                <Button variant="ghost" size="sm" className="justify-start font-normal h-8 px-2" onClick={() => handleShortcut("lastMonth")}>Mês passado</Button>
                <Button variant="ghost" size="sm" className="justify-start font-normal h-8 px-2" onClick={() => handleShortcut("last3Months")}>Últimos 3 meses</Button>
                <Button variant="ghost" size="sm" className="justify-start font-normal h-8 px-2" onClick={() => handleShortcut("thisYear")}>Este ano</Button>
            </div>
            
            {/* CALENDÁRIO */}
            <div className="p-2">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    locale={ptBR}
                />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}