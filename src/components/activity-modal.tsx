'use client'

import { useState } from 'react'
import { useSSTStore } from '@/lib/store'
import { canActivityBeCompleted } from '@/lib/progress'
import type { Activity, ActivityStatus, DynamicField } from '@/lib/types'
import { MONTHS } from '@/lib/types'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DynamicFieldsManager } from './dynamic-fields-manager'
import { cn } from '@/lib/utils'
import { ExecutionEvidenceDialog } from './execution-evidence-dialog'

interface ActivityModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    programId: string
    generalObjectiveId: string
    specificObjectiveId: string
    mode: 'create' | 'edit'
    activity?: Activity
}

function ActivityModalForm({
    programId,
    generalObjectiveId,
    specificObjectiveId,
    mode,
    activity,
    onOpenChange,
}: {
    programId: string
    generalObjectiveId: string
    specificObjectiveId: string
    mode: 'create' | 'edit'
    activity?: Activity
    onOpenChange: (open: boolean) => void
}) {
    const { addActivity, updateActivity } = useSSTStore()

    const [descripcion, setDescripcion] = useState(
        () => (mode === 'edit' && activity ? activity.descripcion : '')
    )
    const [responsable, setResponsable] = useState(
        () => (mode === 'edit' && activity ? activity.responsable : '')
    )
    const [medioVerificacion, setMedioVerificacion] = useState(
        () => (mode === 'edit' && activity ? activity.medioVerificacion : '')
    )
    const [ejecucionAnual, setEjecucionAnual] = useState<number[]>(
        () => (mode === 'edit' && activity ? activity.ejecucionAnual : [])
    )
    const [fechaVerificacion, setFechaVerificacion] = useState(
        () => (mode === 'edit' && activity ? activity.fechaVerificacion : '')
    )
    const [estado, setEstado] = useState<ActivityStatus>(
        () => (mode === 'edit' && activity ? activity.estado : 'En proceso')
    )
    const [showFieldsManager, setShowFieldsManager] = useState(false)
    const [dynamicFields, setDynamicFields] = useState<DynamicField[]>(
        () => (mode === 'edit' && activity ? activity.dynamicFields : [])
    )
    const [showExecutionDialog, setShowExecutionDialog] = useState(false)
    const [pendingActivityData, setPendingActivityData] = useState<{
        descripcion: string
        responsable: string
        medioVerificacion: string
        ejecucionAnual: number[]
        fechaVerificacion: string
        estado: ActivityStatus
    } | null>(null)

    const createFieldId = () => Math.random().toString(36).substring(2, 9)

    const handleMonthToggle = (month: number) => {
        setEjecucionAnual((prev) =>
            prev.includes(month)
                ? prev.filter((m) => m !== month)
                : [...prev, month].sort((a, b) => a - b)
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (
            !descripcion.trim() ||
            !responsable.trim() ||
            !medioVerificacion.trim() ||
            !fechaVerificacion ||
            ejecucionAnual.length === 0
        ) {
            return
        }

        if (mode === 'edit' && activity && estado === 'Realizada' && !canActivityBeCompleted(activity)) {
            alert('No se puede marcar como Realizada. Todos los subprogramas deben estar Ejecutados (E).')
            return
        }

        const activityData = {
            descripcion: descripcion.trim(),
            responsable: responsable.trim(),
            medioVerificacion: medioVerificacion.trim(),
            ejecucionAnual,
            fechaVerificacion,
            estado,
        }

        if (activityData.estado === 'Realizada') {
            setPendingActivityData(activityData)
            setShowExecutionDialog(true)
            return
        }

        if (mode === 'create') {
            addActivity(programId, generalObjectiveId, specificObjectiveId, {
                ...activityData,
                dynamicFields,
            })
        } else if (activity) {
            updateActivity(programId, generalObjectiveId, specificObjectiveId, activity.id, {
                ...activityData,
                dynamicFields,
                ejecucionInfo: undefined,
            })
        }

        onOpenChange(false)
    }

    return (
        <>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Nueva Actividad' : 'Editar Actividad'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Agrega una actividad con su responsable, cronograma y estado.'
                            : 'Modifica los detalles de la actividad.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="descripcion">Actividad / Descripción</Label>
                    <Textarea
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Describe la actividad a realizar"
                        rows={2}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="responsable">Responsable</Label>
                        <Input
                            id="responsable"
                            value={responsable}
                            onChange={(e) => setResponsable(e.target.value)}
                            placeholder="Nombre del responsable"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="medioVerificacion">Medio de Verificación</Label>
                        <Input
                            id="medioVerificacion"
                            value={medioVerificacion}
                            onChange={(e) => setMedioVerificacion(e.target.value)}
                            placeholder="Ej: Lista de asistencia"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Ejecución Anual (Meses)</Label>
                    <div className="grid grid-cols-6 gap-2">
                        {MONTHS.map((month) => {
                            const isSelected = ejecucionAnual.includes(month.value)
                            return (
                                <label
                                    key={month.value}
                                    className={cn(
                                        'flex items-center justify-center gap-1 p-2 rounded-lg border cursor-pointer transition-colors',
                                        isSelected
                                            ? 'bg-primary/20 border-primary text-primary'
                                            : 'bg-muted/30 border-border hover:bg-muted/50'
                                    )}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => handleMonthToggle(month.value)}
                                        className="sr-only"
                                    />
                                    <span className="text-sm font-medium">{month.label}</span>
                                </label>
                            )
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Selecciona los meses de ejecución</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fechaVerificacion">Fecha de Verificación</Label>
                        <Input
                            id="fechaVerificacion"
                            type="date"
                            value={fechaVerificacion}
                            onChange={(e) => setFechaVerificacion(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Select value={estado} onValueChange={(v) => setEstado(v as ActivityStatus)}>
                            <SelectTrigger id="estado">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="En proceso">En proceso</SelectItem>
                                <SelectItem
                                    value="Realizada"
                                    disabled={mode === 'edit' && activity && !canActivityBeCompleted(activity)}
                                >
                                    Realizada
                                    {mode === 'edit' && activity && !canActivityBeCompleted(activity) && (
                                        <span className="text-xs text-muted-foreground"> (Todos deben ser Ejecutados)</span>
                                    )}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Campos Dinámicos para Subprogramas</Label>
                        <Button
                            type="button"
                            variant={showFieldsManager ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setShowFieldsManager(!showFieldsManager)}
                        >
                            {showFieldsManager ? 'Ocultar' : 'Configurar'}
                        </Button>
                    </div>
                    {showFieldsManager && (
                        <DynamicFieldsManager
                            fields={dynamicFields}
                            onAddField={(fieldName) => {
                                const normalizedName = fieldName.trim().toUpperCase()
                                if (!normalizedName) return

                                setDynamicFields((prev) => [
                                    ...prev,
                                    {
                                        id: createFieldId(),
                                        nombre: normalizedName,
                                        orden: prev.length,
                                    },
                                ])
                            }}
                            onUpdateField={(fieldId, fieldName) => {
                                setDynamicFields((prev) =>
                                    prev.map((field) =>
                                        field.id === fieldId ? { ...field, nombre: fieldName.trim().toUpperCase() } : field
                                    )
                                )
                            }}
                            onDeleteField={(fieldId) => {
                                setDynamicFields((prev) =>
                                    prev
                                        .filter((field) => field.id !== fieldId)
                                        .map((field, index) => ({ ...field, orden: index }))
                                )
                            }}
                        />
                    )}
                </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">{mode === 'create' ? 'Crear Actividad' : 'Guardar Cambios'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            <ExecutionEvidenceDialog
                open={showExecutionDialog}
                onOpenChange={setShowExecutionDialog}
                title="Ejecución de actividad"
                onConfirm={(executionInfo) => {
                    if (!pendingActivityData) return

                    if (mode === 'create') {
                        addActivity(programId, generalObjectiveId, specificObjectiveId, {
                            ...pendingActivityData,
                            dynamicFields,
                            ejecucionInfo: executionInfo,
                        })
                    } else if (activity) {
                        updateActivity(programId, generalObjectiveId, specificObjectiveId, activity.id, {
                            ...pendingActivityData,
                            dynamicFields,
                            ejecucionInfo: executionInfo,
                        })
                    }

                    setPendingActivityData(null)
                    onOpenChange(false)
                }}
            />
        </>
    )
}

export function ActivityModal({
    open,
    onOpenChange,
    programId,
    generalObjectiveId,
    specificObjectiveId,
    mode,
    activity,
}: ActivityModalProps) {
    const formKey = open ? `${mode}-${activity?.id ?? 'new'}` : 'closed'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <ActivityModalForm
                key={formKey}
                programId={programId}
                generalObjectiveId={generalObjectiveId}
                specificObjectiveId={specificObjectiveId}
                mode={mode}
                activity={activity}
                onOpenChange={onOpenChange}
            />
        </Dialog>
    )
}
