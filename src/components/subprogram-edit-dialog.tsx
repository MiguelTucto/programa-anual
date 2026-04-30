'use client'

import { useState } from 'react'
import type { Activity, DynamicFieldValue, Subprograma } from '@/lib/types'
import { MONTHS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface SubprogramEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    activity: Activity
    subprograma: Subprograma | null
    onSave: (updates: { fieldValues: DynamicFieldValue[]; meses: number[] }) => void
}

function SubprogramEditForm({
    activity,
    subprograma,
    onSave,
    onOpenChange,
}: {
    activity: Activity
    subprograma: Subprograma
    onSave: (updates: { fieldValues: DynamicFieldValue[]; meses: number[] }) => void
    onOpenChange: (open: boolean) => void
}) {
    const [fieldValues, setFieldValues] = useState(() => subprograma.fieldValues)
    const [meses, setMeses] = useState(() => subprograma.meses)

    const availableMonths = MONTHS.filter((m) => activity.ejecucionAnual.includes(m.value))

    const handleFieldValueChange = (fieldId: string, value: string) => {
        setFieldValues((prev) => {
            const existing = prev.find((fv) => fv.fieldId === fieldId)
            if (existing) {
                return prev.map((fv) => (fv.fieldId === fieldId ? { ...fv, valor: value } : fv))
            }
            return [...prev, { fieldId, valor: value }]
        })
    }

    const handleMonthToggle = (month: number) => {
        setMeses((prev) =>
            prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month].sort((a, b) => a - b)
        )
    }

    const canSave =
        meses.length > 0 &&
        activity.dynamicFields.every(
            (field) => !!fieldValues.find((fv) => fv.fieldId === field.id)?.valor?.trim()
        )

    return (
        <>
            <DialogHeader>
                <DialogTitle>Editar subprograma</DialogTitle>
                <DialogDescription>
                    Modifica campos y meses del subprograma. El estado por mes se gestiona en la vista principal.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                {activity.dynamicFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={`edit-field-${field.id}`}>{field.nombre}</Label>
                        <Input
                            id={`edit-field-${field.id}`}
                            value={fieldValues.find((fv) => fv.fieldId === field.id)?.valor || ''}
                            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                        />
                    </div>
                ))}

                <div className="space-y-2">
                    <Label>Meses</Label>
                    <div className="grid grid-cols-6 gap-2">
                        {availableMonths.map((month) => {
                            const isSelected = meses.includes(month.value)
                            return (
                                <label
                                    key={month.value}
                                    className={cn(
                                        'flex cursor-pointer items-center justify-center gap-1 rounded-lg border p-2 transition-colors',
                                        isSelected
                                            ? 'border-primary bg-primary/20 text-primary'
                                            : 'border-border bg-muted/30 hover:bg-muted/50'
                                    )}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => handleMonthToggle(month.value)}
                                        className="sr-only"
                                    />
                                    <span className="text-xs font-medium">{month.label}</span>
                                </label>
                            )
                        })}
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                </Button>
                <Button
                    disabled={!canSave}
                    onClick={() => {
                        onSave({
                            fieldValues: activity.dynamicFields.map((field) => ({
                                fieldId: field.id,
                                valor: fieldValues.find((fv) => fv.fieldId === field.id)?.valor?.trim() || '',
                            })),
                            meses,
                        })
                        onOpenChange(false)
                    }}
                >
                    Guardar
                </Button>
            </DialogFooter>
        </>
    )
}

export function SubprogramEditDialog({
    open,
    onOpenChange,
    activity,
    subprograma,
    onSave,
}: SubprogramEditDialogProps) {
    if (!subprograma) return null

    const formKey = open ? `${subprograma.id}` : 'closed'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                {open ? (
                    <SubprogramEditForm
                        key={formKey}
                        activity={activity}
                        subprograma={subprograma}
                        onSave={onSave}
                        onOpenChange={onOpenChange}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
