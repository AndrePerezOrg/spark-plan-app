import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core'
import {
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'
import { useColumns, useCards, useUpdateCard } from '../../hooks/useKanban'
import { useRealtimeBoard } from '../../hooks/useRealtime'
import { useLanguage } from '../../contexts/LanguageContext'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { CardWithDetails } from '../../types/database'

interface KanbanBoardProps {
  boardId?: string
  searchTerm: string
  filters: {
    priority: string
    creator: string
    column: string
    tags: string[]
    showArchived: boolean
  }
  onAddCard: (columnId: string) => void
}

export function KanbanBoard({ boardId, searchTerm, filters, onAddCard }: KanbanBoardProps) {
  const { data: columns, isLoading, error } = useColumns(boardId)
  const { data: allCards } = useCards()
  const updateCardMutation = useUpdateCard()
  const [activeCard, setActiveCard] = useState<CardWithDetails | null>(null)
  const { t } = useLanguage()

  // Enable real-time subscriptions
  useRealtimeBoard(boardId)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced for better responsiveness
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter cards based on search and filters
  const filterCards = (cards: CardWithDetails[]) => {
    if (!cards) return []

    return cards.filter(card => {
      // Search filter (title, description, creator)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const titleMatch = card.title.toLowerCase().includes(searchLower)
        const descriptionMatch = card.description?.toLowerCase().includes(searchLower)
        const creatorMatch = card.creator?.display_name?.toLowerCase().includes(searchLower)

        if (!titleMatch && !descriptionMatch && !creatorMatch) {
          return false
        }
      }

      // Priority filter
      if (filters.priority && card.priority !== filters.priority) {
        return false
      }

      // Creator filter (partial match, case insensitive)
      if (filters.creator) {
        const creatorFilter = filters.creator.toLowerCase()
        const creatorName = card.creator?.display_name?.toLowerCase() || ''
        if (!creatorName.includes(creatorFilter)) {
          return false
        }
      }

      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => card.tags?.includes(tag))) {
        return false
      }

      // Column filter
      if (filters.column) {
        const cardColumn = columns?.find(col => col.id === card.column_id)
        if (!cardColumn || cardColumn.name !== filters.column) {
          return false
        }
      }

      // Archived filter
      if (!filters.showArchived && card.status === 'archived') {
        return false
      }

      return true
    })
  }

  // Group filtered cards by column ID and sort by position
  const getCardsForColumn = (columnId: string) => {
    const filteredCards = filterCards(allCards || [])

    return filteredCards
      .filter(card => card.column_id === columnId)
      .sort((a, b) => (a.position || 0) - (b.position || 0))
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    console.log('🚀 Drag started:', active.id)

    const card = allCards?.find(card => card.id === active.id)

    if (card) {
      setActiveCard(card)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Keep this simple - just for visual feedback
    console.log('📍 Drag over:', event.over?.id)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    console.log('🎯 Drag ended:', { activeId: active.id, overId: over?.id })
    setActiveCard(null)

    if (!over) {
      console.log('❌ No drop target found')
      return
    }

    // Find source card
    const sourceCard = allCards?.find(card => card.id === active.id)
    if (!sourceCard) {
      console.log('❌ Could not find source card')
      return
    }

    // Determine target column and position
    let targetColumnId: string | null = null
    let targetPosition: number | null = null

    // Check if we dropped on a column directly
    if (columns?.some(col => col.id === over.id)) {
      targetColumnId = over.id as string
      // When dropping on column, put at end
      const columnCards = getCardsForColumn(targetColumnId)
      targetPosition = columnCards.length
      console.log('✅ Dropped on column:', targetColumnId, 'position:', targetPosition)
    } else {
      // We dropped on a card - find its column and position
      const overCard = allCards?.find(card => card.id === over.id)

      if (overCard) {
        targetColumnId = overCard.column_id
        const columnCards = getCardsForColumn(targetColumnId)
        const overCardIndex = columnCards.findIndex(card => card.id === over.id)
        targetPosition = overCardIndex
        console.log('✅ Dropped on card in column:', targetColumnId, 'position:', targetPosition)
      }
    }

    if (!targetColumnId || targetPosition === null) {
      console.log('❌ Could not determine target column or position')
      return
    }

    // Check if anything actually changed
    const currentColumnCards = getCardsForColumn(sourceCard.column_id)
    const currentPosition = currentColumnCards.findIndex(card => card.id === active.id)

    if (sourceCard.column_id === targetColumnId && currentPosition === targetPosition) {
      console.log('🔄 Same position - no action needed')
      return
    }

    console.log('🔥 Moving card:', {
      cardId: active.id,
      from: sourceCard.column_id,
      to: targetColumnId,
      fromPosition: currentPosition,
      toPosition: targetPosition
    })

    try {
      const updates: any = {
        id: active.id as string,
        position: targetPosition,
      }

      // Only update column if it's actually changing
      if (sourceCard.column_id !== targetColumnId) {
        updates.column_id = targetColumnId
      }

      await updateCardMutation.mutateAsync(updates)
      console.log('✅ Card moved successfully')
    } catch (error) {
      console.error('❌ Error moving card:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-8">
        <p>{t('common.error')}</p>
      </div>
    )
  }

  // If no columns exist, show default columns
  const defaultColumns = [
    { id: 'backlog', name: 'Backlog', cards: [] },
    { id: 'analysis', name: 'Em Análise', cards: [] },
    { id: 'approved', name: 'Aprovado', cards: [] },
    { id: 'implemented', name: 'Implementado', cards: [] },
  ]

  const displayColumns = columns && columns.length > 0 ? columns : defaultColumns

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6">
        {displayColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={getCardsForColumn(column.id)}
            onAddCard={() => onAddCard(column.id)}
            isDragging={!!activeCard}
            boardId={boardId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="rotate-6 scale-105">
            <KanbanCard card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}