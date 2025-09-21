import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Card } from '@/types/database';
import { KanbanCard } from './KanbanCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddCardDialog } from './AddCardDialog';

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
}

export function KanbanColumn({ column, cards }: KanbanColumnProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const getColumnColorClass = (columnName: string) => {
    if (columnName.includes('Novas Ideias')) return 'border-l-column-ideas bg-column-ideas/5';
    if (columnName.includes('Análise')) return 'border-l-column-analysis bg-column-analysis/5';
    if (columnName.includes('Desenvolvimento')) return 'border-l-column-development bg-column-development/5';
    if (columnName.includes('Finalizadas')) return 'border-l-column-done bg-column-done/5';
    return 'border-l-gray-400 bg-gray-50/5';
  };

  const getColumnHeaderColor = (columnName: string) => {
    if (columnName.includes('Novas Ideias')) return 'text-column-ideas';
    if (columnName.includes('Análise')) return 'text-column-analysis';
    if (columnName.includes('Desenvolvimento')) return 'text-column-development';
    if (columnName.includes('Finalizadas')) return 'text-column-done';
    return 'text-gray-600';
  };

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column border-l-4 p-4 ${getColumnColorClass(column.name)} ${
        isOver ? 'ring-2 ring-primary/50' : ''
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className={`font-semibold text-lg ${getColumnHeaderColor(column.name)}`}>
            {column.name}
          </h3>
          <span className="text-sm text-muted-foreground">
            {cards.length} {cards.length === 1 ? 'ideia' : 'ideias'}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          className="h-8 w-8 p-0 hover:bg-primary/10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[200px]">
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} />
          ))}
          
          {cards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma ideia ainda</p>
              <p className="text-xs mt-1">Clique no + para adicionar</p>
            </div>
          )}
        </div>
      </SortableContext>

      <AddCardDialog
        columnId={column.id}
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />
    </div>
  );
}