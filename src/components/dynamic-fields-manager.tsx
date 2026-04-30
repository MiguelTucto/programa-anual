'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'
import type { DynamicField } from '@/lib/types'

interface DynamicFieldsManagerProps {
    fields: DynamicField[]
    onAddField: (fieldName: string) => void
    onUpdateField: (fieldId: string, fieldName: string) => void
    onDeleteField: (fieldId: string) => void
}

export function DynamicFieldsManager({
                                         fields,
                                         onAddField,
                                         onUpdateField,
                                         onDeleteField,
                                     }: DynamicFieldsManagerProps) {
    const [newFieldName, setNewFieldName] = useState('')
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
    const [editingFieldName, setEditingFieldName] = useState('')

    const handleAddField = () => {
        if (!newFieldName.trim()) return
        onAddField(newFieldName)
        setNewFieldName('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddField()
        }
    }

    return (
        <Card className="border-dashed border-primary/30 bg-secondary/30 p-4">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Campos Dinámicos</h4>
                    <span className="text-xs text-muted-foreground">{fields.length} campos</span>
                </div>

                {fields.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {fields
                            .sort((a, b) => a.orden - b.orden)
                            .map((field) => (
                                <div
                                    key={field.id}
                                    className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary border border-primary/30"
                                >
                                    {editingFieldId === field.id ? (
                                        <Input
                                            value={editingFieldName}
                                            onChange={(e) => setEditingFieldName(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    const value = editingFieldName.trim()
                                                    if (!value) return
                                                    onUpdateField(field.id, value)
                                                    setEditingFieldId(null)
                                                    setEditingFieldName('')
                                                }
                                            }}
                                            className="h-7 w-44 text-xs"
                                            autoFocus
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            className="underline-offset-2 hover:underline"
                                            onClick={() => {
                                                setEditingFieldId(field.id)
                                                setEditingFieldName(field.nombre)
                                            }}
                                        >
                                            {field.nombre}
                                        </button>
                                    )}
                                    {editingFieldId === field.id && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-7 px-2 text-xs"
                                            onClick={() => {
                                                const value = editingFieldName.trim()
                                                if (!value) return
                                                onUpdateField(field.id, value)
                                                setEditingFieldId(null)
                                                setEditingFieldName('')
                                            }}
                                        >
                                            Guardar
                                        </Button>
                                    )}
                                    <button
                                        onClick={() => onDeleteField(field.id)}
                                        className="ml-1 inline-flex rounded-full p-0.5 hover:bg-primary/20"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                    </div>
                )}

                <div className="flex gap-2">
                    <Input
                        placeholder="Ej: SEDE, DOCUMENTO, RESPONSABLE..."
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value.toUpperCase())}
                        onKeyPress={handleKeyPress}
                        className="text-sm"
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleAddField}
                        disabled={!newFieldName.trim()}
                        className="gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        Agregar
                    </Button>
                </div>

                {fields.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        Estos campos se usarán para cada subprograma en esta actividad.
                    </p>
                )}
            </div>
        </Card>
    )
}
