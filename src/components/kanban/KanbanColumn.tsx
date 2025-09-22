import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { KanbanCard } from './KanbanCard'
import { useLanguage } from '../../contexts/LanguageContext'
import { CardWithDetails, Column } from '../../types/database'

interface KanbanColumnProps {
  column: Column & { cards?: CardWithDetails[] }
  cards: CardWithDetails[]
  onAddCard: () => void
  isDragging?: boolean
  boardId?: string
}

export function KanbanColumn({ column, cards, onAddCard, isDragging = false, boardId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })
  const { t } = useLanguage()

  return (
    <div className="kanban-column">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-foreground">{column.name}</h3>
          <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
            {cards.length}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onAddCard}
          className="p-1.5"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] transition-colors ${
          isOver ? 'bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg' : ''
        }`}
      >
        {/* Drop Indicator - Show at TOP when dragging */}
        {(isDragging || isOver) && (
          <div className={`flex items-center justify-center h-16 border-2 border-dashed rounded-lg mb-3 transition-all ${
            isOver
              ? 'text-primary bg-primary/10 border-primary'
              : 'text-muted-foreground bg-muted/50 border-muted-foreground/30'
          }`}>
            <p className="text-sm font-medium">
              {isOver ? t('column.dropHere') : t('column.dropToChange')}
            </p>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-3">
          <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <KanbanCard key={card.id} card={card} boardId={boardId} />
            ))}
          </SortableContext>
        </div>

        {/* Empty State */}
        {cards.length === 0 && !isDragging && !isOver && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <Plus className="w-6 h-6 mb-2" />
            <p className="text-sm">{t('column.addIdea')}</p>
          </div>
        )}
      </div>
    </div>
  )
}