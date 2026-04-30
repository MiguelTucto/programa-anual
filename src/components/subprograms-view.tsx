'use client'

import { useState } from 'react'
import { useSSTStore } from '@/lib/store'
import { canActivityBeCompleted, getActivityProgress } from '@/lib/progress'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CommentsSection } from './comments-section'
import { ProgressBar } from './progress-bar'
import { MONTHS } from '@/lib/types'
import { Plus, Trash2, ArrowLeft, Pencil, Rows3, LayoutGrid, Wrench } from 'lucide-react'
import type { Activity, DynamicFieldValue, SubprogramMonthStatus, Subprograma } from '@/lib/types'
import { SubprogramEditDialog } from './subprogram-edit-dialog'
import { ExecutionEvidenceDialog } from './execution-evidence-dialog'
import { DynamicFieldsManager } from './dynamic-fields-manager'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

interface SubprogramsViewProps {
    programId: string
    generalObjectiveId: string
    specificObjectiveId: string
    activity: Activity
    onBack: () => void
}

export function SubprogramsView({
                                    programId,
                                    generalObjectiveId,
                                    specificObjectiveId,
                                    activity,
                                    onBack,
                                }: SubprogramsViewProps) {
    const {
        addSubprograma,
        updateSubprogramaMesEstado,
        updateSubprograma,
        updateActivity,
        deleteSubprograma,
        addCommentToSubprograma,
        addDynamicField,
        updateDynamicField,
        deleteDynamicField,
    } = useSSTStore()

    const [openDialog, setOpenDialog] = useState(false)
    const [fieldValues, setFieldValues] = useState<DynamicFieldValue[]>([])
    const [selectedMeses, setSelectedMeses] = useState<number[]>(
        activity.ejecucionAnual.length ? [activity.ejecucionAnual[0]] : []
    )
    const [editingSubprograma, setEditingSubprograma] = useState<Subprograma | null>(null)
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
    const [pendingSubprogramExecution, setPendingSubprogramExecution] = useState<{
        subprogramaId: string
        mes: number
    } | null>(null)
    const [showSubprogramExecutionDialog, setShowSubprogramExecutionDialog] = useState(false)
    const [showActivityExecutionDialog, setShowActivityExecutionDialog] = useState(false)
    const [showDynamicFieldsConfig, setShowDynamicFieldsConfig] = useState(false)

    const availableMonths = MONTHS.filter((m) => activity.ejecucionAnual.includes(m.value))

    const splitByComma = (value: string) =>
        value
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)

    const canCreateSubprograma = (() => {
        if (selectedMeses.length === 0) return false
        if (activity.dynamicFields.length === 0) return true

        return activity.dynamicFields.every((field) => {
            const value = fieldValues.find((fv) => fv.fieldId === field.id)?.valor || ''
            return splitByComma(value).length > 0
        })
    })()

    const handleCreateSubprograma = () => {
        if (!canCreateSubprograma) return

        if (activity.dynamicFields.length === 0) {
            addSubprograma(
                programId,
                generalObjectiveId,
                specificObjectiveId,
                activity.id,
                [],
                selectedMeses
            )
        } else {
            const valuesByField = activity.dynamicFields.map((field) => {
                const rawValue = fieldValues.find((fv) => fv.fieldId === field.id)?.valor || ''
                return {
                    fieldId: field.id,
                    values: splitByComma(rawValue),
                }
            })

            const totalRows = Math.max(...valuesByField.map((item) => item.values.length))

            for (let i = 0; i < totalRows; i++) {
                const rowValues: DynamicFieldValue[] = valuesByField.map((item) => ({
                    fieldId: item.fieldId,
                    valor: item.values[Math.min(i, item.values.length - 1)] || '',
                }))

                addSubprograma(
                    programId,
                    generalObjectiveId,
                    specificObjectiveId,
                    activity.id,
                    rowValues,
                    selectedMeses
                )
            }
        }

        setFieldValues([])
        setSelectedMeses(activity.ejecucionAnual.length ? [activity.ejecucionAnual[0]] : [])
        setOpenDialog(false)
    }

    const handleMonthToggle = (month: number) => {
        setSelectedMeses((prev) =>
            prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month].sort((a, b) => a - b)
        )
    }

    const handleFieldValueChange = (fieldId: string, value: string) => {
        setFieldValues((prev) => {
            const existing = prev.find((fv) => fv.fieldId === fieldId)
            if (existing) {
                return prev.map((fv) => (fv.fieldId === fieldId ? { ...fv, valor: value } : fv))
            }
            return [...prev, { fieldId, valor: value }]
        })
    }

    const getMonthLabel = (monthNumber: number) => {
        return MONTHS.find((m) => m.value === monthNumber)?.fullName || String(monthNumber)
    }

    const statusLabels: Record<SubprogramMonthStatus, string> = {
        P: 'Programado',
        E: 'Ejecutado',
        R: 'Postergado',
        F: 'Replan. Planeada',
        C: 'Replan. Ejecutada',
    }

    const statusColors: Record<SubprogramMonthStatus, string> = {
        P: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        E: 'bg-green-500/20 text-green-400 border-green-500/30',
        R: 'bg-red-500/20 text-red-400 border-red-500/30',
        F: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        C: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    }

    const getLiveActivity = (): Activity => {
        const { programs } = useSSTStore.getState()
        const program = programs.find((p) => p.id === programId)
        const act =
            program
                ?.objetivosGenerales.find((go) => go.id === generalObjectiveId)
                ?.objetivosEspecificos.find((so) => so.id === specificObjectiveId)
                ?.actividades.find((a) => a.id === activity.id) ?? activity
        return act
    }

    const maybeAskToCompleteActivity = () => {
        const live = getLiveActivity()
        const canComplete = canActivityBeCompleted(live)

        if (canComplete && live.estado !== 'Realizada') {
            const shouldComplete = window.confirm(
                'Todos los meses de todos los subprogramas están Ejecutados. ¿Deseas marcar la actividad como completada?'
            )
            if (shouldComplete) {
                setShowActivityExecutionDialog(true)
            }
        }

        if (!canComplete && live.estado === 'Realizada') {
            updateActivity(
                programId,
                generalObjectiveId,
                specificObjectiveId,
                activity.id,
                {
                    descripcion: live.descripcion,
                    responsable: live.responsable,
                    medioVerificacion: live.medioVerificacion,
                    ejecucionAnual: live.ejecucionAnual,
                    fechaVerificacion: live.fechaVerificacion,
                    estado: 'En proceso',
                    ejecucionInfo: undefined,
                }
            )
        }
    }

    const handleMesEstadoChange = (subprogramaId: string, mes: number, nextStatus: SubprogramMonthStatus) => {
        if (nextStatus === 'E') {
            setPendingSubprogramExecution({ subprogramaId, mes })
            setShowSubprogramExecutionDialog(true)
            return
        }

        updateSubprogramaMesEstado(
            programId,
            generalObjectiveId,
            specificObjectiveId,
            activity.id,
            subprogramaId,
            mes,
            nextStatus,
            undefined
        )

        maybeAskToCompleteActivity()
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-border bg-secondary/30 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">{activity.descripcion}</h2>
                            <p className="text-sm text-muted-foreground">
                                Responsable: {activity.responsable}
                            </p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm">
                                <Wrench className="mr-2 h-4 w-4" />
                                Gestionar Subprogramas
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setOpenDialog(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo subprograma
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowDynamicFieldsConfig((prev) => !prev)}>
                                <Wrench className="mr-2 h-4 w-4" />
                                {showDynamicFieldsConfig ? 'Ocultar campos dinámicos' : 'Configurar campos dinámicos'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="mb-3 flex items-center gap-2">
                    <Button
                        size="sm"
                        variant={viewMode === 'cards' ? 'default' : 'outline'}
                        onClick={() => setViewMode('cards')}
                    >
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        Cards
                    </Button>
                    <Button
                        size="sm"
                        variant={viewMode === 'table' ? 'default' : 'outline'}
                        onClick={() => setViewMode('table')}
                    >
                        <Rows3 className="mr-2 h-4 w-4" />
                        Tabla
                    </Button>
                </div>
                {showDynamicFieldsConfig && (
                    <div className="mb-3">
                        <DynamicFieldsManager
                            fields={activity.dynamicFields}
                            onAddField={(fieldName) => {
                                const normalized = fieldName.trim().toUpperCase()
                                if (!normalized) return
                                addDynamicField(
                                    programId,
                                    generalObjectiveId,
                                    specificObjectiveId,
                                    activity.id,
                                    normalized
                                )
                            }}
                            onUpdateField={(fieldId, fieldName) => {
                                const normalized = fieldName.trim().toUpperCase()
                                if (!normalized) return
                                updateDynamicField(
                                    programId,
                                    generalObjectiveId,
                                    specificObjectiveId,
                                    activity.id,
                                    fieldId,
                                    normalized
                                )
                            }}
                            onDeleteField={(fieldId) => {
                                deleteDynamicField(
                                    programId,
                                    generalObjectiveId,
                                    specificObjectiveId,
                                    activity.id,
                                    fieldId
                                )
                            }}
                        />
                    </div>
                )}
                <div className="max-w-xs">
                    <ProgressBar
                        value={getActivityProgress(activity)}
                        label="Progreso de Actividad"
                        size="md"
                        variant={
                            getActivityProgress(activity) === 100
                                ? 'success'
                                : getActivityProgress(activity) > 0
                                    ? 'default'
                                    : 'danger'
                        }
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {/* Create Dialog */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Crear Subprograma</DialogTitle>
                            <DialogDescription>
                                Completa los campos dinámicos y selecciona el mes de ejecución.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* Dynamic Fields */}
                            {activity.dynamicFields.length === 0 ? (
                                <div className="rounded-lg bg-secondary/50 p-4 text-center text-sm text-muted-foreground">
                                    No hay campos dinámicos definidos para esta actividad.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activity.dynamicFields
                                        .sort((a, b) => a.orden - b.orden)
                                        .map((field) => (
                                            <div key={field.id} className="space-y-2">
                                                <Label htmlFor={`field-${field.id}`}>{field.nombre}</Label>
                                                <Input
                                                    id={`field-${field.id}`}
                                                    placeholder={`Valor de ${field.nombre.toLowerCase()} (usa coma para crear varios)`}
                                                    value={
                                                        fieldValues.find((fv) => fv.fieldId === field.id)?.valor || ''
                                                    }
                                                    onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Month Selection */}
                            <div className="space-y-2">
                                <Label>Meses de Ejecución</Label>
                                <div className="grid grid-cols-6 gap-2">
                                    {availableMonths.map((month) => {
                                        const isSelected = selectedMeses.includes(month.value)
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
                            <Button variant="outline" onClick={() => setOpenDialog(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleCreateSubprograma}
                                disabled={!canCreateSubprograma}
                            >
                                Crear
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <SubprogramEditDialog
                    open={!!editingSubprograma}
                    onOpenChange={(open) => !open && setEditingSubprograma(null)}
                    activity={activity}
                    subprograma={editingSubprograma}
                    onSave={(updates) => {
                        if (!editingSubprograma) return

                        updateSubprograma(
                            programId,
                            generalObjectiveId,
                            specificObjectiveId,
                            activity.id,
                            editingSubprograma.id,
                            updates
                        )

                        maybeAskToCompleteActivity()
                    }}
                />
                <ExecutionEvidenceDialog
                    open={showSubprogramExecutionDialog}
                    onOpenChange={setShowSubprogramExecutionDialog}
                    title="Ejecución del mes (subprograma)"
                    onConfirm={(executionInfo) => {
                        if (!pendingSubprogramExecution) return
                        updateSubprogramaMesEstado(
                            programId,
                            generalObjectiveId,
                            specificObjectiveId,
                            activity.id,
                            pendingSubprogramExecution.subprogramaId,
                            pendingSubprogramExecution.mes,
                            'E',
                            executionInfo
                        )
                        maybeAskToCompleteActivity()
                        setPendingSubprogramExecution(null)
                    }}
                />
                <ExecutionEvidenceDialog
                    open={showActivityExecutionDialog}
                    onOpenChange={setShowActivityExecutionDialog}
                    title="Ejecución de actividad"
                    onConfirm={(executionInfo) => {
                        updateActivity(
                            programId,
                            generalObjectiveId,
                            specificObjectiveId,
                            activity.id,
                            {
                                descripcion: activity.descripcion,
                                responsable: activity.responsable,
                                medioVerificacion: activity.medioVerificacion,
                                ejecucionAnual: activity.ejecucionAnual,
                                fechaVerificacion: activity.fechaVerificacion,
                                estado: 'Realizada',
                                ejecucionInfo: executionInfo,
                            }
                        )
                    }}
                />

                {/* Subprograms List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activity.subprogramas.length === 0 ? (
                        <div className="rounded-lg bg-secondary/50 p-8 text-center text-muted-foreground">
                            No hay subprogramas creados aún
                        </div>
                    ) : viewMode === 'cards' ? (
                        activity.subprogramas.map((subprograma) => (
                            <Card key={subprograma.id} className="p-4 bg-secondary/30">
                                {/* Subprogram Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            {subprograma.fieldValues.map((fv) => {
                                                const field = activity.dynamicFields.find((f) => f.id === fv.fieldId)
                                                return (
                                                    <span
                                                        key={fv.fieldId}
                                                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded border border-primary/30"
                                                    >
                            <strong>{field?.nombre}:</strong> {fv.valor}
                          </span>
                                                )
                                            })}
                                        </div>
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            Meses asignados: {subprograma.meses.map(getMonthLabel).join(', ')}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {availableMonths.map((month) => {
                                                const isAssignedMonth = subprograma.meses.includes(month.value)
                                                const mesEstado =
                                                    subprograma.mesEstados[String(month.value)]?.estado ?? 'P'
                                                return (
                                                    <div
                                                        key={`${subprograma.id}-${month.value}`}
                                                        className={`flex min-w-[112px] flex-col gap-1 rounded-md border px-2 py-2 text-xs ${
                                                            isAssignedMonth
                                                                ? statusColors[mesEstado]
                                                                : 'border-border bg-muted/20 text-muted-foreground'
                                                        }`}
                                                    >
                                                        <span className="text-center font-semibold">{month.label}</span>
                                                        {isAssignedMonth ? (
                                                            <Select
                                                                value={mesEstado}
                                                                onValueChange={(value) =>
                                                                    handleMesEstadoChange(
                                                                        subprograma.id,
                                                                        month.value,
                                                                        value as SubprogramMonthStatus
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="h-8 text-[11px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="P">{statusLabels.P}</SelectItem>
                                                                    <SelectItem value="E">{statusLabels.E}</SelectItem>
                                                                    <SelectItem value="R">{statusLabels.R}</SelectItem>
                                                                    <SelectItem value="F">{statusLabels.F}</SelectItem>
                                                                    <SelectItem value="C">{statusLabels.C}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <span className="text-center text-[11px]">—</span>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="whitespace-nowrap">
                                            {subprograma.estado}
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingSubprograma(subprograma)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                deleteSubprograma(
                                                    programId,
                                                    generalObjectiveId,
                                                    specificObjectiveId,
                                                    activity.id,
                                                    subprograma.id
                                                )
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Comments */}
                                <CommentsSection
                                    comentarios={subprograma.comentarios}
                                    onAddComment={(autor, contenido) =>
                                        addCommentToSubprograma(
                                            programId,
                                            generalObjectiveId,
                                            specificObjectiveId,
                                            activity.id,
                                            subprograma.id,
                                            autor,
                                            contenido
                                        )
                                    }
                                />
                            </Card>
                        ))
                    ) : (
                        <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        {activity.dynamicFields.map((field) => (
                                            <TableHead key={field.id}>{field.nombre}</TableHead>
                                        ))}
                                        <TableHead>Meses y estado</TableHead>
                                        <TableHead className="w-28">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activity.subprogramas.map((subprograma) => (
                                        <TableRow key={subprograma.id}>
                                            {activity.dynamicFields.map((field) => (
                                                <TableCell key={`${subprograma.id}-${field.id}`}>
                                                    {subprograma.fieldValues.find((fv) => fv.fieldId === field.id)?.valor || '-'}
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <div className="flex min-w-[320px] flex-wrap gap-2">
                                                    {availableMonths.map((month) => {
                                                        const isAssignedMonth = subprograma.meses.includes(month.value)
                                                        const mesEstado =
                                                            subprograma.mesEstados[String(month.value)]?.estado ?? 'P'
                                                        return (
                                                            <div
                                                                key={`${subprograma.id}-table-${month.value}`}
                                                                className={`flex w-[104px] flex-col gap-1 rounded border px-1 py-1 ${
                                                                    isAssignedMonth
                                                                        ? statusColors[mesEstado]
                                                                        : 'border-border bg-muted/20 text-muted-foreground'
                                                                }`}
                                                            >
                                                                <span className="text-center text-[10px] font-semibold">
                                                                    {month.label}
                                                                </span>
                                                                {isAssignedMonth ? (
                                                                    <Select
                                                                        value={mesEstado}
                                                                        onValueChange={(value) =>
                                                                            handleMesEstadoChange(
                                                                                subprograma.id,
                                                                                month.value,
                                                                                value as SubprogramMonthStatus
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="h-7 text-[10px]">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="P">{statusLabels.P}</SelectItem>
                                                                            <SelectItem value="E">{statusLabels.E}</SelectItem>
                                                                            <SelectItem value="R">{statusLabels.R}</SelectItem>
                                                                            <SelectItem value="F">{statusLabels.F}</SelectItem>
                                                                            <SelectItem value="C">{statusLabels.C}</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                ) : (
                                                                    <span className="text-center text-[10px]">—</span>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="mt-2">
                                                    <Badge variant="outline" className="text-[11px]">
                                                        Subprograma: {subprograma.estado}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingSubprograma(subprograma)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            deleteSubprograma(
                                                                programId,
                                                                generalObjectiveId,
                                                                specificObjectiveId,
                                                                activity.id,
                                                                subprograma.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
