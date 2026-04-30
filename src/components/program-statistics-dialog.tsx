'use client'

import type { AnnualProgram } from '@/lib/types'
import { MONTHS } from '@/lib/types'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'

interface ProgramStatisticsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    program: AnnualProgram
}

const statusColor = (percent: number) => {
    if (percent >= 90) return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30'
    if (percent >= 70) return 'bg-lime-500/20 text-lime-700 border-lime-500/30'
    if (percent >= 50) return 'bg-amber-500/20 text-amber-700 border-amber-500/30'
    if (percent >= 30) return 'bg-orange-500/20 text-orange-700 border-orange-500/30'
    return 'bg-red-500/20 text-red-700 border-red-500/30'
}

const heatColor = (percent: number) => {
    if (percent >= 90) return '#16a34a'
    if (percent >= 70) return '#65a30d'
    if (percent >= 50) return '#ca8a04'
    if (percent >= 30) return '#ea580c'
    return '#dc2626'
}

export function ProgramStatisticsDialog({
    open,
    onOpenChange,
    program,
}: ProgramStatisticsDialogProps) {
    const allActivities = program.objetivosGenerales.flatMap((go) =>
        go.objetivosEspecificos.flatMap((so) => so.actividades)
    )

    const allSubprograms = allActivities.flatMap((activity) => activity.subprogramas)
    const monthSlotsProgramados = allSubprograms.reduce((sum, sub) => sum + sub.meses.length, 0)
    const monthSlotsEjecutados = allSubprograms.reduce(
        (sum, sub) => sum + sub.meses.filter((m) => sub.mesEstados[String(m)]?.estado === 'E').length,
        0
    )
    const generalPercent =
        monthSlotsProgramados > 0 ? Math.round((monthSlotsEjecutados / monthSlotsProgramados) * 100) : 0

    const monthStats = MONTHS.map((month) => {
        const subsInMonth = allSubprograms.filter((sub) => sub.meses.includes(month.value))
        const monthProgrammed = subsInMonth.length
        const monthExecuted = subsInMonth.filter(
            (sub) => sub.mesEstados[String(month.value)]?.estado === 'E'
        ).length
        const percent = monthProgrammed > 0 ? Math.round((monthExecuted / monthProgrammed) * 100) : 0
        return { ...month, executed: monthExecuted, programmed: monthProgrammed, percent }
    })

    const indicatorStats = program.objetivosGenerales.flatMap((go) =>
        go.objetivosEspecificos.map((so) => {
            const subprograms = so.actividades.flatMap((activity) => activity.subprogramas)
            const total = subprograms.reduce((sum, sub) => sum + sub.meses.length, 0)
            const done = subprograms.reduce(
                (sum, sub) =>
                    sum + sub.meses.filter((m) => sub.mesEstados[String(m)]?.estado === 'E').length,
                0
            )
            const percent =
                total > 0
                    ? Math.round((done / total) * 100)
                    : so.actividades.length > 0
                        ? Math.round(
                            (so.actividades.filter((a) => a.estado === 'Realizada').length /
                                so.actividades.length) *
                            100
                        )
                        : 0
            return {
                id: so.id,
                indicador: so.indicador,
                percent,
                done,
                total,
            }
        })
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Estadísticas del Programa Anual</DialogTitle>
                    <DialogDescription>
                        Cumplimiento mensual, indicador general y avance por indicador específico.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="p-4">
                        <h3 className="mb-3 text-sm font-semibold">Cumplimiento por mes (Barras verticales)</h3>
                        <div className="grid grid-cols-12 gap-2">
                            {monthStats.map((month) => (
                                <div key={month.value} className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] text-muted-foreground">{month.percent}%</span>
                                    <div className="relative flex h-40 w-full items-end rounded bg-muted/40 p-1">
                                        <div
                                            className="w-full rounded bg-primary transition-all"
                                            style={{ height: `${month.percent}%` }}
                                            title={`${month.fullName}: ${month.percent}% (${month.executed}/${month.programmed})`}
                                        />
                                    </div>
                                    <span className="text-xs font-medium">{month.label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h3 className="mb-3 text-sm font-semibold">Indicador general (Heatmap gráfico)</h3>
                        <div className={`rounded-lg border p-4 ${statusColor(generalPercent)}`}>
                            <p className="text-xs uppercase tracking-wide">Programadas vs Ejecutadas</p>
                            <p className="mt-2 text-3xl font-bold">{generalPercent}%</p>
                            <p className="text-sm">
                                Ejecutados (meses): {monthSlotsEjecutados} / Programados (meses): {monthSlotsProgramados}
                            </p>
                            <div className="mt-3 grid grid-cols-10 gap-1">
                                {Array.from({ length: 10 }).map((_, idx) => {
                                    const cellValue = (idx + 1) * 10
                                    const active = generalPercent >= cellValue
                                    return (
                                        <div
                                            key={idx}
                                            className="h-6 rounded border"
                                            style={{
                                                backgroundColor: active ? heatColor(generalPercent) : 'transparent',
                                                opacity: active ? 0.9 : 0.2,
                                            }}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="p-4">
                    <h3 className="mb-3 text-sm font-semibold">Indicadores específicos (Heatmap gráfico)</h3>
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {indicatorStats.map((indicator) => (
                            <div key={indicator.id} className={`rounded-md border p-3 ${statusColor(indicator.percent)}`}>
                                <p className="line-clamp-2 text-sm font-medium">{indicator.indicador}</p>
                                <p className="mt-1 text-xl font-bold">{indicator.percent}%</p>
                                <p className="text-xs">
                                    Ejecutadas: {indicator.done} / Programadas: {indicator.total}
                                </p>
                                <div className="mt-2 grid grid-cols-10 gap-1">
                                    {Array.from({ length: 10 }).map((_, idx) => {
                                        const cellValue = (idx + 1) * 10
                                        const active = indicator.percent >= cellValue
                                        return (
                                            <div
                                                key={idx}
                                                className="h-4 rounded border"
                                                style={{
                                                    backgroundColor: active ? heatColor(indicator.percent) : 'transparent',
                                                    opacity: active ? 0.9 : 0.2,
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </DialogContent>
        </Dialog>
    )
}
