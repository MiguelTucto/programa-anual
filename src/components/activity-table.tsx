'use client'

import { useMemo, useState } from 'react'
import type { Activity, SubprogramMonthStatus, Subprograma } from '@/lib/types'
import { useSSTStore } from '@/lib/store'
import { getActivityProgress, canActivityBeCompleted } from '@/lib/progress'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Network, MessageSquare, ListTodo } from 'lucide-react'
import { TimelineBar } from './timeline-bar'
import { ActivityModal } from './activity-modal'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { CommentsDialog } from './comments-dialog'
import { ProgressBar } from './progress-bar'
import { cn } from '@/lib/utils'
import { MONTHS } from '@/lib/types'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SubprogramEditDialog } from './subprogram-edit-dialog'
import { ExecutionEvidenceDialog } from './execution-evidence-dialog'

interface ActivityTableProps {
    activities: Activity[]
    programId: string
    generalObjectiveId: string
    specificObjectiveId: string
    onViewSubprograms?: (activity: Activity) => void
}

export function ActivityTable({
                                  activities,
                                  programId,
                                  generalObjectiveId,
                                  specificObjectiveId,
                                  onViewSubprograms,
                              }: ActivityTableProps) {
    const { deleteActivity, addCommentToActivity, updateSubprogramaMesEstado, updateSubprograma, updateActivity } =
        useSSTStore()

    const [editActivity, setEditActivity] = useState<Activity | null>(null)
    const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null)
    const [commentActivityId, setCommentActivityId] = useState<string | null>(null)
    const [manageSubprogramActivityId, setManageSubprogramActivityId] = useState<string | null>(null)
    const [editingSubprograma, setEditingSubprograma] = useState<Subprograma | null>(null)
    const [pendingSubprogramExecution, setPendingSubprogramExecution] = useState<{
        activityId: string
        subprogramaId: string
        mes: number
    } | null>(null)
    const [showSubprogramExecutionDialog, setShowSubprogramExecutionDialog] = useState(false)
    const [showActivityExecutionDialog, setShowActivityExecutionDialog] = useState(false)
    const [activityForCompletion, setActivityForCompletion] = useState<Activity | null>(null)

    const handleDelete = () => {
        if (deleteActivityId) {
            deleteActivity(
                programId,
                generalObjectiveId,
                specificObjectiveId,
                deleteActivityId
            )
            setDeleteActivityId(null)
        }
    }

    const activityToDelete = activities.find((a) => a.id === deleteActivityId)
    const activityToManageSubprograms = useMemo(
        () => activities.find((a) => a.id === manageSubprogramActivityId) || null,
        [activities, manageSubprogramActivityId]
    )

    const pickActivityFromStore = (activityId: string): Activity | null => {
        const { programs } = useSSTStore.getState()
        const program = programs.find((p) => p.id === programId)
        return (
            program
                ?.objetivosGenerales.find((go) => go.id === generalObjectiveId)
                ?.objetivosEspecificos.find((so) => so.id === specificObjectiveId)
                ?.actividades.find((a) => a.id === activityId) ?? null
        )
    }

    const maybeAskToCompleteActivity = (activityId: string) => {
        const live = pickActivityFromStore(activityId)
        if (!live) return

        const canComplete = canActivityBeCompleted(live)

        if (canComplete && live.estado !== 'Realizada') {
            const shouldComplete = window.confirm(
                'Todos los meses de todos los subprogramas están Ejecutados. ¿Deseas marcar la actividad como completada?'
            )
            if (shouldComplete) {
                setActivityForCompletion(live)
                setShowActivityExecutionDialog(true)
            }
        }

        if (!canComplete && live.estado === 'Realizada') {
            updateActivity(programId, generalObjectiveId, specificObjectiveId, live.id, {
                descripcion: live.descripcion,
                responsable: live.responsable,
                medioVerificacion: live.medioVerificacion,
                ejecucionAnual: live.ejecucionAnual,
                fechaVerificacion: live.fechaVerificacion,
                estado: 'En proceso',
                ejecucionInfo: undefined,
            })
        }
    }

    const monthStatusLabels: Record<SubprogramMonthStatus, string> = {
        P: 'Programado',
        E: 'Ejecutado',
        R: 'Postergado',
        F: 'Replan. Planeada',
        C: 'Replan. Ejecutada',
    }

    const handleMesEstadoInTable = (activityId: string, subprogramaId: string, mes: number, next: SubprogramMonthStatus) => {
        if (next === 'E') {
            setPendingSubprogramExecution({ activityId, subprogramaId, mes })
            setShowSubprogramExecutionDialog(true)
            return
        }
        updateSubprogramaMesEstado(
            programId,
            generalObjectiveId,
            specificObjectiveId,
            activityId,
            subprogramaId,
            mes,
            next,
            undefined
        )
        maybeAskToCompleteActivity(activityId)
    }

    return (
        <>
            <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="text-xs font-medium">Actividad</TableHead>
                            <TableHead className="text-xs font-medium">Responsable</TableHead>
                            <TableHead className="text-xs font-medium">Medio de Verificación</TableHead>
                            <TableHead className="text-xs font-medium">Progreso</TableHead>
                            <TableHead className="text-xs font-medium">Ejecución Anual</TableHead>
                            <TableHead className="text-xs font-medium">Fecha Verif.</TableHead>
                            <TableHead className="text-xs font-medium">Estado</TableHead>
                            <TableHead className="text-xs font-medium w-24">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((activity) => {
                            const progress = getActivityProgress(activity)
                            const canComplete = canActivityBeCompleted(activity)

                            return (
                                <TableRow key={activity.id} className="hover:bg-muted/20">
                                    <TableCell className="text-sm max-w-[200px]">
                                        <span className="line-clamp-2">{activity.descripcion}</span>
                                    </TableCell>
                                    <TableCell className="text-sm">{activity.responsable}</TableCell>
                                    <TableCell className="text-sm max-w-[150px]">
                                        <span className="line-clamp-2">{activity.medioVerificacion}</span>
                                    </TableCell>
                                    <TableCell className="text-sm max-w-[150px]">
                                        <ProgressBar
                                            value={progress}
                                            size="sm"
                                            showValue={true}
                                            variant={progress === 100 ? 'success' : progress > 0 ? 'default' : 'danger'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TimelineBar
                                            selectedMonths={activity.ejecucionAnual}
                                            status={activity.estado}
                                            compact
                                        />
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {activity.fechaVerificacion}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'text-xs w-fit',
                                                    activity.estado === 'Realizada'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                )}
                                            >
                                                {activity.estado}
                                            </Badge>
                                            {!canComplete && activity.subprogramas.length > 0 && (
                                                <span className="text-xs text-warning-foreground bg-warning/20 px-2 py-0.5 rounded">
                          Incomp.
                        </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {onViewSubprograms && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                    title="Ver subprogramas"
                                                    onClick={() => onViewSubprograms(activity)}
                                                >
                                                    <Network className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                title="Editar subprogramas"
                                                onClick={() => setManageSubprogramActivityId(activity.id)}
                                            >
                                                <ListTodo className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-400 hover:text-blue-400 hover:bg-blue-500/10"
                                                title="Comentarios"
                                                onClick={() => setCommentActivityId(activity.id)}
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setEditActivity(activity)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => setDeleteActivityId(activity.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {editActivity && (
                <ActivityModal
                    open={!!editActivity}
                    onOpenChange={(open) => !open && setEditActivity(null)}
                    programId={programId}
                    generalObjectiveId={generalObjectiveId}
                    specificObjectiveId={specificObjectiveId}
                    mode="edit"
                    activity={editActivity}
                />
            )}

            <DeleteConfirmDialog
                open={!!deleteActivityId}
                onOpenChange={(open) => !open && setDeleteActivityId(null)}
                onConfirm={handleDelete}
                title="Eliminar Actividad"
                description={`¿Estás seguro de que deseas eliminar la actividad "${activityToDelete?.descripcion}"?`}
            />

            {commentActivityId && (
                <CommentsDialog
                    open={!!commentActivityId}
                    onOpenChange={(open) => !open && setCommentActivityId(null)}
                    comentarios={activities.find((a) => a.id === commentActivityId)?.comentarios || []}
                    onAddComment={(autor, contenido) => {
                        if (commentActivityId) {
                            addCommentToActivity(
                                programId,
                                generalObjectiveId,
                                specificObjectiveId,
                                commentActivityId,
                                autor,
                                contenido
                            )
                        }
                    }}
                    title="Comentarios de Actividad"
                />
            )}

            <Dialog
                open={!!activityToManageSubprograms}
                onOpenChange={(open) => !open && setManageSubprogramActivityId(null)}
            >
                <DialogContent className="max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Editar subprogramas desde actividades</DialogTitle>
                        <DialogDescription>
                            Gestiona el estado por mes y los campos sin salir de la tabla de actividades.
                        </DialogDescription>
                    </DialogHeader>

                    {activityToManageSubprograms?.subprogramas.length ? (
                        <div className="max-h-[60vh] overflow-auto rounded-lg border border-border/50">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        {activityToManageSubprograms.dynamicFields.map((field) => (
                                            <TableHead key={field.id}>{field.nombre}</TableHead>
                                        ))}
                                        <TableHead>Meses y estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activityToManageSubprograms.subprogramas.map((subprograma) => (
                                        <TableRow key={subprograma.id}>
                                            {activityToManageSubprograms.dynamicFields.map((field) => (
                                                <TableCell key={`${subprograma.id}-${field.id}`}>
                                                    {subprograma.fieldValues.find((fv) => fv.fieldId === field.id)?.valor || '-'}
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <div className="flex min-w-[320px] flex-wrap gap-2">
                                                    {MONTHS.filter((m) =>
                                                        activityToManageSubprograms.ejecucionAnual.includes(m.value)
                                                    ).map((month) => {
                                                        const isAssigned = subprograma.meses.includes(month.value)
                                                        const mesEstado =
                                                            subprograma.mesEstados[String(month.value)]?.estado ?? 'P'
                                                        return (
                                                            <div
                                                                key={`${subprograma.id}-month-${month.value}`}
                                                                className={cn(
                                                                    'flex w-[104px] flex-col gap-1 rounded border px-1 py-1',
                                                                    isAssigned
                                                                        ? 'border-primary/30 bg-primary/10'
                                                                        : 'border-border bg-muted/20 text-muted-foreground'
                                                                )}
                                                            >
                                                                <span className="text-center text-[10px] font-semibold">
                                                                    {month.label}
                                                                </span>
                                                                {isAssigned ? (
                                                                    <Select
                                                                        value={mesEstado}
                                                                        onValueChange={(value) =>
                                                                            handleMesEstadoInTable(
                                                                                activityToManageSubprograms.id,
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
                                                                            <SelectItem value="P">{monthStatusLabels.P}</SelectItem>
                                                                            <SelectItem value="E">{monthStatusLabels.E}</SelectItem>
                                                                            <SelectItem value="R">{monthStatusLabels.R}</SelectItem>
                                                                            <SelectItem value="F">{monthStatusLabels.F}</SelectItem>
                                                                            <SelectItem value="C">{monthStatusLabels.C}</SelectItem>
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
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingSubprograma(subprograma)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="rounded-md bg-secondary/50 p-6 text-sm text-muted-foreground">
                            Esta actividad no tiene subprogramas para editar.
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {activityToManageSubprograms && (
                <SubprogramEditDialog
                    open={!!editingSubprograma}
                    onOpenChange={(open) => !open && setEditingSubprograma(null)}
                    activity={activityToManageSubprograms}
                    subprograma={editingSubprograma}
                    onSave={(updates) => {
                        if (!editingSubprograma) return

                        updateSubprograma(
                            programId,
                            generalObjectiveId,
                            specificObjectiveId,
                            activityToManageSubprograms.id,
                            editingSubprograma.id,
                            updates
                        )

                        maybeAskToCompleteActivity(activityToManageSubprograms.id)
                    }}
                />
            )}
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
                        pendingSubprogramExecution.activityId,
                        pendingSubprogramExecution.subprogramaId,
                        pendingSubprogramExecution.mes,
                        'E',
                        executionInfo
                    )

                    maybeAskToCompleteActivity(pendingSubprogramExecution.activityId)
                    setPendingSubprogramExecution(null)
                }}
            />
            <ExecutionEvidenceDialog
                open={showActivityExecutionDialog}
                onOpenChange={setShowActivityExecutionDialog}
                title="Ejecución de actividad"
                onConfirm={(executionInfo) => {
                    if (!activityForCompletion) return
                    updateActivity(programId, generalObjectiveId, specificObjectiveId, activityForCompletion.id, {
                        descripcion: activityForCompletion.descripcion,
                        responsable: activityForCompletion.responsable,
                        medioVerificacion: activityForCompletion.medioVerificacion,
                        ejecucionAnual: activityForCompletion.ejecucionAnual,
                        fechaVerificacion: activityForCompletion.fechaVerificacion,
                        estado: 'Realizada',
                        ejecucionInfo: executionInfo,
                    })
                    setActivityForCompletion(null)
                }}
            />
        </>
    )
}
