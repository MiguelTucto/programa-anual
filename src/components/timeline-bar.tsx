import { cn } from '@/lib/utils'
import { MONTHS } from '@/lib/types'
import type { ActivityStatus } from '@/lib/types'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface TimelineBarProps {
    selectedMonths: number[]
    status: ActivityStatus
    compact?: boolean
}

export function TimelineBar({ selectedMonths, status, compact = false }: TimelineBarProps) {
    const isCompleted = status === 'Realizada'

    return (
        <TooltipProvider>
            <div className={cn('flex gap-0.5', compact ? 'gap-px' : 'gap-0.5')}>
                {MONTHS.map((month) => {
                    const isSelected = selectedMonths.includes(month.value)

                    return (
                        <Tooltip key={month.value}>
                            <TooltipTrigger asChild>
                                <div
                                    className={cn(
                                        'flex items-center justify-center rounded text-[10px] font-medium transition-colors',
                                        compact ? 'w-5 h-5' : 'w-6 h-6',
                                        isSelected
                                            ? isCompleted
                                                ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                                                : 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                                            : 'bg-muted/50 text-muted-foreground border border-transparent'
                                    )}
                                >
                                    {month.label}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {month.fullName}
                                    {isSelected && (
                                        <span className="ml-1 text-xs">
                      ({isCompleted ? 'Realizado' : 'Programado'})
                    </span>
                                    )}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    )
                })}
            </div>
        </TooltipProvider>
    )
}
