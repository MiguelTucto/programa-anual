'use client'

import { useSSTStore } from '@/lib/store'
import { canProgramBeCompleted, getProgramProgress, getProgramStatusSummary } from '@/lib/progress'
import { KPICard } from './kpi-card'
import { ObjectiveCard } from './objective-card'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
    Target,
    CheckCircle2,
    Activity,
    DollarSign,
    Plus,
    ListTree,
    ChartColumn,
    Calendar,
    ChevronDown,
    Settings,
    Pencil,
    Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { GeneralObjectiveModal } from './general-objective-modal'
import { SubprogramsView } from './subprograms-view'
import { Empty } from '@/components/ui/empty'
import type { Activity as ActivityType, ProgramStatus } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'
import { ProgramActivitiesDialog } from './program-activities-dialog'
import { ProgramStatisticsDialog } from './program-statistics-dialog'
import { ProgramModal } from './program-modal'
import { DeleteConfirmDialog } from './delete-confirm-dialog'

interface DashboardProps {
    viewingActivity?: ActivityType & { programId: string; generalObjectiveId: string; specificObjectiveId: string } | null
    onActivitySelected?: (activity: ActivityType & { programId: string; generalObjectiveId: string; specificObjectiveId: string } | null) => void
}

export function Dashboard({ viewingActivity, onActivitySelected }: DashboardProps) {
    const { programs, selectedProgramId, selectProgram, updateProgramStatus, deleteProgram } = useSSTStore()
    const selectedProgram = programs.find((p) => p.id === selectedProgramId)

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showObjectiveModal, setShowObjectiveModal] = useState(false)
    const [showActivitiesDialog, setShowActivitiesDialog] = useState(false)
    const [showStatisticsDialog, setShowStatisticsDialog] = useState(false)
    const statusOptions: ProgramStatus[] = ['pendiente', 'en_proceso', 'realizado']

    const handleOpenSubprograms = (
        activity: ActivityType,
        generalObjId: string,
        specificObjId: string
    ) => {
        if (!selectedProgram) return
        onActivitySelected?.({
            ...activity,
            programId: selectedProgram.id,
            generalObjectiveId: generalObjId,
            specificObjectiveId: specificObjId,
        })
    }

    const handleStatusChange = (status: ProgramStatus) => {
        if (!selectedProgram) return
        if (status === 'realizado' && !canProgramBeCompleted(selectedProgram)) {
            alert(
                'No se puede marcar el programa como Realizado. Todos los meses de todos los subprogramas deben estar en estado Ejecutado (E).'
            )
            return
        }
        updateProgramStatus(selectedProgram.id, status)
    }

    const handleDeleteProgram = () => {
        if (!selectedProgram) return
        deleteProgram(selectedProgram.id)
        setShowDeleteDialog(false)
    }

    // If viewing a specific activity, show the subprograms view
    if (viewingActivity) {
        const liveActivity =
            programs
                .find((p) => p.id === viewingActivity.programId)
                ?.objetivosGenerales.find((go) => go.id === viewingActivity.generalObjectiveId)
                ?.objetivosEspecificos.find((so) => so.id === viewingActivity.specificObjectiveId)
                ?.actividades.find((a) => a.id === viewingActivity.id) || viewingActivity

        return (
            <SubprogramsView
                programId={viewingActivity.programId}
                generalObjectiveId={viewingActivity.generalObjectiveId}
                specificObjectiveId={viewingActivity.specificObjectiveId}
                activity={liveActivity}
                onBack={() => onActivitySelected?.(null)}
            />
        )
    }

    if (!selectedProgram) {
        return (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 h-full">
                <div className="rounded-xl border border-border/70 bg-card p-4 md:p-5">
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                        <div className="space-y-1">
                            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Panel General</h1>
                            <p className="text-sm text-muted-foreground">
                                Selecciona un programa para comenzar a gestionar objetivos y actividades.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Seleccionar programa
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Programas Anuales</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {programs.length === 0 ? (
                                        <DropdownMenuItem disabled>No hay programas creados</DropdownMenuItem>
                                    ) : (
                                        programs
                                            .sort((a, b) => b.anio - a.anio)
                                            .map((program) => (
                                                <DropdownMenuItem
                                                    key={program.id}
                                                    onClick={() => selectProgram(program.id)}
                                                    className="flex items-center justify-between"
                                                >
                                                    <span className="font-medium">{program.anio}</span>
                                                    <span
                                                        className={cn(
                                                            'text-xs px-2 py-0.5 rounded-full border',
                                                            STATUS_COLORS[program.estado]
                                                        )}
                                                    >
                                                        {STATUS_LABELS[program.estado]}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Programa
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <Empty
                        title="Sin programa seleccionado"
                        description="Selecciona o crea un programa anual para comenzar"
                    />
                </div>
                <ProgramModal open={showCreateModal} onOpenChange={setShowCreateModal} mode="create" />
            </div>
        )
    }

    // Calculate KPIs
    const summary = getProgramStatusSummary(selectedProgram)
    const programProgress = getProgramProgress(selectedProgram)

    const totalObjectives = selectedProgram.objetivosGenerales.length
    const totalSpecificObjectives = selectedProgram.objetivosGenerales.reduce(
        (acc, obj) => acc + obj.objetivosEspecificos.length,
        0
    )
    const totalBudget = selectedProgram.objetivosGenerales.reduce(
        (acc, obj) =>
            acc +
            obj.objetivosEspecificos.reduce((acc2, spec) => acc2 + spec.presupuesto, 0),
        0
    )

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 h-full">
            <div className="rounded-xl border border-border/70 bg-card p-4 md:p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                            Panel del Programa Anual {selectedProgram.anio}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Visualiza avance, objetivos y actividades en una sola vista.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    Cambiar programa
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Programas Anuales</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {programs
                                    .sort((a, b) => b.anio - a.anio)
                                    .map((program) => (
                                        <DropdownMenuItem
                                            key={program.id}
                                            onClick={() => selectProgram(program.id)}
                                            className={cn(
                                                'flex items-center justify-between',
                                                selectedProgramId === program.id && 'bg-accent'
                                            )}
                                        >
                                            <span className="font-medium">{program.anio}</span>
                                            <span
                                                className={cn(
                                                    'text-xs px-2 py-0.5 rounded-full border',
                                                    STATUS_COLORS[program.estado]
                                                )}
                                            >
                                                {STATUS_LABELS[program.estado]}
                                            </span>
                                        </DropdownMenuItem>
                                    ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setShowCreateModal(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo Programa
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className={cn('gap-2 border', STATUS_COLORS[selectedProgram.estado])}>
                                    {STATUS_LABELS[selectedProgram.estado]}
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {statusOptions.map((status) => (
                                    <DropdownMenuItem
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        className={cn(selectedProgram.estado === status && 'bg-accent')}
                                    >
                                        {STATUS_LABELS[status]}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Editar programa
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar programa
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                    title="Progreso General"
                    value={`${programProgress}%`}
                    icon={<Target className="w-6 h-6" />}
                    progress={programProgress}
                />
                <KPICard
                    title="Objetivos Generales"
                    value={totalObjectives}
                    icon={<Target className="w-6 h-6" />}
                />
                <KPICard
                    title="Objetivos Específicos"
                    value={totalSpecificObjectives}
                    icon={<CheckCircle2 className="w-6 h-6" />}
                />
                <KPICard
                    title="Actividades"
                    value={`${summary.completed}/${summary.total}`}
                    icon={<Activity className="w-6 h-6" />}
                    progress={summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}
                />
                <KPICard
                    title="Presupuesto Asignado"
                    value={`S/. ${totalBudget.toLocaleString()}`}
                    icon={<DollarSign className="w-6 h-6" />}
                />
            </div>

            {/* Objectives Section */}
            <div className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                        Objetivos Generales
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowActivitiesDialog(true)}>
                            <ListTree className="mr-2 h-4 w-4" />
                            Listado de Actividades
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowStatisticsDialog(true)}>
                            <ChartColumn className="mr-2 h-4 w-4" />
                            Estadísticas
                        </Button>
                        <Button onClick={() => setShowObjectiveModal(true)} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Objetivo
                        </Button>
                    </div>
                </div>

                {selectedProgram.objetivosGenerales.length === 0 ? (
                    <Empty
                        title="Sin objetivos"
                        description="Agrega un objetivo general para comenzar a planificar el programa"
                    />
                ) : (
                    <div className="space-y-4">
                        {selectedProgram.objetivosGenerales.map((objective, index) => (
                            <ObjectiveCard
                                key={objective.id}
                                objective={objective}
                                programId={selectedProgram.id}
                                index={index + 1}
                                onViewSubprograms={handleOpenSubprograms}
                            />
                        ))}
                    </div>
                )}
            </div>

            <GeneralObjectiveModal
                open={showObjectiveModal}
                onOpenChange={setShowObjectiveModal}
                programId={selectedProgram.id}
                mode="create"
            />
            <ProgramModal open={showCreateModal} onOpenChange={setShowCreateModal} mode="create" />
            <ProgramModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                mode="edit"
                program={selectedProgram}
            />
            <DeleteConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDeleteProgram}
                title="Eliminar Programa"
                description={`¿Estás seguro de que deseas eliminar el programa del año ${selectedProgram.anio}? Esta acción no se puede deshacer.`}
            />
            <ProgramActivitiesDialog
                open={showActivitiesDialog}
                onOpenChange={setShowActivitiesDialog}
                program={selectedProgram}
                onViewSubprograms={handleOpenSubprograms}
            />
            <ProgramStatisticsDialog
                open={showStatisticsDialog}
                onOpenChange={setShowStatisticsDialog}
                program={selectedProgram}
            />
        </div>
    )
}
