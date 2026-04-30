import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from './progress-bar'

interface KPICardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    trend?: {
        value: number
        positive: boolean
    }
    progress?: number
    className?: string
}

export function KPICard({ title, value, icon, trend, progress, className }: KPICardProps) {
    return (
        <Card className={cn('bg-card/95 border-border/70 shadow-sm hover:shadow-md transition-shadow', className)}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
                        <p className="text-2xl md:text-3xl font-bold text-foreground">{value}</p>
                        {progress !== undefined && (
                            <div className="mt-3">
                                <ProgressBar
                                    value={progress}
                                    size="sm"
                                    showValue={true}
                                    variant={progress === 100 ? 'success' : progress > 0 ? 'default' : 'danger'}
                                />
                            </div>
                        )}
                        {trend && (
                            <p
                                className={cn(
                                    'text-sm font-medium',
                                    trend.positive ? 'text-emerald-400' : 'text-red-400'
                                )}
                            >
                                {trend.positive ? '+' : ''}{trend.value}% vs mes anterior
                            </p>
                        )}
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
