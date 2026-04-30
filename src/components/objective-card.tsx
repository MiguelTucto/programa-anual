'use client'

import { useState } from 'react'
import type { Activity, GeneralObjective } from '@/lib/types'
import { useSSTStore } from '@/lib/store'
import { getGeneralObjectiveProgress } from '@/lib/progress'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { SpecificObjectiveCard } from './specific-objective-cards'
import { GeneralObjectiveModal } from './general-objective-modal'
import { SpecificObjectiveModal } from './specific-objective-modal'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { ProgressBar } from './progress-bar'
import { cn } from '@/lib/utils'
import { Empty } from '@/components/ui/empty'

interface ObjectiveCardProps {
    objective: GeneralObjective
    programId: string
    index: number
    onViewSubprograms?: (activity: Activity, generalObjId: string, specificObjId: string) => void
}

export function ObjectiveCard({ objective, programId, index, onViewSubprograms }: ObjectiveCardProps) {
    const { deleteGeneralObjective } = useSSTStore()

    const [expanded, setExpanded] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showAddSpecificModal, setShowAddSpecificModal] = useState(false)

    const handleDelete = () => {
        deleteGeneralObjective(programId, objective.id)
        setShowDeleteDialog(false)
    }

    return (
        <>
            <Card className="bg-card/95 border-border/70 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                            <button
                                className="mt-1 p-1 hover:bg-accent rounded transition-colors"
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                )}
                            </button>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-primary">OG-{index}</span>
                                    <span className="text-xs text-muted-foreground">
                    {objective.objetivosEspecificos.length} objetivos específicos
                  </span>
                                </div>
                                <h3 className="text-base font-semibold text-foreground mt-1">
                                    {objective.titulo}
                                </h3>
                                <div className="mt-2 max-w-xs">
                                    <ProgressBar
                                        value={getGeneralObjectiveProgress(objective)}
                                        size="sm"
                                        showValue={true}
                                        variant={
                                            getGeneralObjectiveProgress(objective) === 100
                                                ? 'success'
                                                : getGeneralObjectiveProgress(objective) > 0
                                                    ? 'default'
                                                    : 'danger'
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAddSpecificModal(true)}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Objetivo Específico
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="w-5 h-5" />
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
                </CardHeader>
                <CardContent
                    className={cn(
                        'transition-all duration-200',
                        expanded ? 'block' : 'hidden'
                    )}
                >
                    {objective.objetivosEspecificos.length === 0 ? (
                        <Empty
                            title="Sin objetivos específicos"
                            description="Agrega un objetivo específico para definir metas e indicadores"
                            className="py-6"
                        />
                    ) : (
                        <div className="space-y-3">
                            {objective.objetivosEspecificos.map((specificObj, idx) => (
                                <SpecificObjectiveCard
                                    key={specificObj.id}
                                    specificObjective={specificObj}
                                    programId={programId}
                                    generalObjectiveId={objective.id}
                                    index={idx + 1}
                                    onViewSubprograms={onViewSubprograms}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <GeneralObjectiveModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                programId={programId}
                mode="edit"
                objective={objective}
            />

            <SpecificObjectiveModal
                open={showAddSpecificModal}
                onOpenChange={setShowAddSpecificModal}
                programId={programId}
                generalObjectiveId={objective.id}
                mode="create"
            />

            <DeleteConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                title="Eliminar Objetivo General"
                description="¿Estás seguro de que deseas eliminar este objetivo general? Se eliminarán también todos los objetivos específicos y actividades asociadas."
            />
        </>
    )
}
