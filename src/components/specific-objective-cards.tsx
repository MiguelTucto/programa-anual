'use client'

import { useState } from 'react'
import type { SpecificObjective } from '@/lib/types'
import { useSSTStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { ActivityTable } from './activity-table'
import { SpecificObjectiveModal } from './specific-objective-modal'
import { ActivityModal } from './activity-modal'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { cn } from '@/lib/utils'
import { Empty } from '@/components/ui/empty'

interface SpecificObjectiveCardProps {
    specificObjective: SpecificObjective
    programId: string
    generalObjectiveId: string
    index: number
    onViewSubprograms?: (activity: SpecificObjective['actividades'][0], generalObjId: string, specificObjId: string) => void
}

export function SpecificObjectiveCard({
                                          specificObjective,
                                          programId,
                                          generalObjectiveId,
                                          index,
                                          onViewSubprograms,
                                      }: SpecificObjectiveCardProps) {
    const { deleteSpecificObjective } = useSSTStore()

    const [expanded, setExpanded] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showAddActivityModal, setShowAddActivityModal] = useState(false)

    const handleDelete = () => {
        deleteSpecificObjective(programId, generalObjectiveId, specificObjective.id)
        setShowDeleteDialog(false)
    }

    return (
        <>
            <div className="bg-secondary/45 rounded-lg border border-border/60 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                        <button
                            className="mt-0.5 p-1 hover:bg-accent rounded transition-colors"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-primary">OE-{index}</span>
                                <span className="text-xs text-muted-foreground">
                  {specificObjective.actividades.length} actividades
                </span>
                            </div>
                            <h4 className="text-sm font-semibold text-foreground">
                                {specificObjective.titulo}
                            </h4>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddActivityModal(true)}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Actividad
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Objective Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 ml-8">
                    <div>
                        <span className="text-xs text-muted-foreground">Meta</span>
                        <p className="text-sm text-foreground">{specificObjective.meta}</p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">Indicador</span>
                        <p className="text-sm text-foreground">{specificObjective.indicador}</p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">Presupuesto</span>
                        <p className="text-sm text-foreground font-medium">
                            S/. {specificObjective.presupuesto.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">Recursos</span>
                        <p className="text-sm text-foreground">{specificObjective.recursos}</p>
                    </div>
                </div>

                {/* Activities */}
                <div
                    className={cn(
                        'ml-8 transition-all duration-200',
                        expanded ? 'block' : 'hidden'
                    )}
                >
                    {specificObjective.actividades.length === 0 ? (
                        <Empty
                            title="Sin actividades"
                            description="Agrega actividades para este objetivo específico"
                            className="py-4"
                        />
                    ) : (
                        <ActivityTable
                            activities={specificObjective.actividades}
                            programId={programId}
                            generalObjectiveId={generalObjectiveId}
                            specificObjectiveId={specificObjective.id}
                            onViewSubprograms={(activity) => {
                                onViewSubprograms?.(activity, generalObjectiveId, specificObjective.id)
                            }}
                        />
                    )}
                </div>
            </div>

            <SpecificObjectiveModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                programId={programId}
                generalObjectiveId={generalObjectiveId}
                mode="edit"
                specificObjective={specificObjective}
            />

            <ActivityModal
                open={showAddActivityModal}
                onOpenChange={setShowAddActivityModal}
                programId={programId}
                generalObjectiveId={generalObjectiveId}
                specificObjectiveId={specificObjective.id}
                mode="create"
            />

            <DeleteConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                title="Eliminar Objetivo Específico"
                description="¿Estás seguro de que deseas eliminar este objetivo específico? Se eliminarán también todas las actividades asociadas."
            />
        </>
    )
}
