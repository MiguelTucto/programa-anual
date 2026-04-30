import { cn } from '@/lib/utils'

interface ProgressBarProps {
    value: number // 0-100
    label?: string
    size?: 'sm' | 'md' | 'lg'
    showValue?: boolean
    variant?: 'default' | 'success' | 'warning' | 'danger'
}

const variantColors = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive',
}

const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
}

export function ProgressBar({
                                value,
                                label,
                                size = 'md',
                                showValue = true,
                                variant = 'default',
                            }: ProgressBarProps) {
    const progress = Math.min(Math.max(value, 0), 100)
    const variantClass = variantColors[variant]
    const sizeClass = sizeClasses[size]

    return (
        <div className="space-y-1">
            {(label || showValue) && (
                <div className="flex items-center justify-between text-xs">
                    {label && <span className="font-medium text-muted-foreground">{label}</span>}
                    {showValue && (
                        <span className={cn('font-semibold', progress === 100 ? 'text-success' : 'text-foreground')}>
              {progress}%
            </span>
                    )}
                </div>
            )}
            <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeClass)}>
                <div
                    className={cn('h-full rounded-full transition-all duration-300', variantClass)}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}
