"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { addDays, format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, addMonths, startOfWeek, endOfWeek } from "date-fns"
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

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())
  const [numberOfMonths, setNumberOfMonths] = React.useState(2)

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setNumberOfMonths(1)
      } else {
        setNumberOfMonths(2)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  const handlePresetSelect = (presetValue: { from: Date; to: Date }) => {
    setDate(presetValue)
    setCurrentMonth(presetValue.from)
  }

  const dailyPresets = [
    { label: "Hoje", getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: "Ontem", getValue: () => ({ from: addDays(new Date(), -1), to: addDays(new Date(), -1) }) },
    { label: "Esta Semana", getValue: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
  ]

  const periodPresets = [
    { label: "Este Mês", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: "Mês que vem", getValue: () => ({ from: startOfMonth(addMonths(new Date(), 1)), to: endOfMonth(addMonths(new Date(), 1)) }) },
    { label: "Mês Passado", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: "Últimos 3 meses", getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
    { label: "Este Ano", getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  ]

  return (
    <div className={cn("grid gap-2 w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-center text-left font-normal bg-white border-slate-200 shadow-sm truncate hover:bg-slate-50",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-blue-600 shrink-0" />
            <span className="truncate">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/yyyy")} -{" "}
                    {format(date.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(date.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Selecione o período</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
            className="w-[95vw] md:w-auto p-0 shadow-2xl border-slate-200 overflow-hidden bg-white" 
            align="center"
            sideOffset={4}
        >
          {/* Scroll vertical suave caso a tela seja muito pequena na altura */}
          <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto">
             
             {/* --- PAINEL DE ATALHOS --- */}
             <div className="
                flex flex-col 
                p-3 gap-2 
                border-b md:border-b-0 md:border-r border-slate-100 
                bg-slate-50/50 
                md:w-[220px] w-full shrink-0
             ">
                
                {/* BLOCO 1: DIA A DIA */}
                <div className="w-full">
                    <div className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-2 pl-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Dia a Dia
                    </div>
                    {/* Grid 2 colunas mobile, Flex desktop */}
                    <div className="grid grid-cols-2 md:flex md:flex-col gap-1">
                        {dailyPresets.map((preset) => (
                            <Button
                                key={preset.label}
                                variant="outline"
                                size="sm"
                                className="w-full justify-center md:justify-start font-medium text-xs md:text-sm h-9
                                bg-white text-slate-700 border-slate-200 shadow-sm
                                hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all px-2"
                                onClick={() => handlePresetSelect(preset.getValue())}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* BLOCO 2: PERÍODOS */}
                <div className="w-full">
                    <div className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-2 pl-1 mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Períodos
                    </div>
                    <div className="grid grid-cols-2 md:flex md:flex-col gap-1">
                        {periodPresets.map((preset) => (
                            <Button
                                key={preset.label}
                                variant="outline"
                                size="sm"
                                className="w-full justify-center md:justify-start font-medium text-xs md:text-sm h-9
                                bg-white text-slate-700 border-slate-200 shadow-sm
                                hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all px-2"
                                onClick={() => handlePresetSelect(preset.getValue())}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                </div>
             </div>
             
             {/* --- CALENDÁRIO --- */}
             <div className="relative p-0 w-full md:w-auto bg-white flex flex-col items-center">
                
                {/* BOTÕES DE NAVEGAÇÃO CUSTOMIZADOS */}
                <div className="absolute top-3 left-3 z-20">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 bg-white border border-slate-100 shadow-sm hover:bg-blue-50 text-blue-600 rounded-md"
                        onClick={handlePrevMonth}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>

                <div className="absolute top-3 right-3 z-20">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 bg-white border border-slate-100 shadow-sm hover:bg-blue-50 text-blue-600 rounded-md"
                        onClick={handleNextMonth}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={numberOfMonths}
                    locale={ptBR}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    
                    // w-full garante que o componente pai ocupe tudo
                    className="p-3 w-auto" 
                    classNames={{
                        // Container dos meses
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                        // Mês individual: w-full para esticar
                        month: "space-y-4 w-full", 
                        
                        caption: "flex justify-center pt-2 relative items-center h-10",
                        caption_label: "text-sm font-bold text-slate-800 uppercase tracking-wide",
                        
                        nav: "hidden", // Navegação nativa oculta
                        
                        // Tabela: Largura Total
                        table: "w-full border-collapse space-y-1",
                        
                        // Header dos dias da semana (Dom, Seg...)
                        // flex-1 faz cada dia ocupar espaço igual
                        head_row: "flex w-full",
                        head_cell: "text-slate-400 rounded-md flex-1 font-normal text-[0.8rem]",
                        
                        // Linha dos dias
                        row: "flex w-full mt-1 md:mt-2",
                        
                        // CÉLULA DO DIA (O ajuste principal):
                        // w-full + flex-1: faz a célula crescer e ocupar o espaço disponível na linha flex
                        cell: "h-8 md:h-9 w-full flex-1 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex items-center justify-center min-w-[2.5rem] md:min-w-[2.75rem]",
                        
                        // O botão do dia
                        day: "h-9 md:h-11 w-full min-w-[2.5rem] md:min-w-[2.9rem] p-0 font-normal aria-selected:opacity-100 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-slate-700",
                        
                        day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white shadow-md",
                        day_today: "bg-slate-100 text-slate-900 font-semibold",
                        day_outside: "text-slate-300 opacity-50",
                        day_disabled: "text-slate-300 opacity-50",
                        day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-blue-700",
                        day_hidden: "invisible",
                    }}
                />
             </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}