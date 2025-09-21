import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useColumns, useCards, useMoveCard } from '@/hooks/useKanban';
import { useRealtimeCards } from '@/hooks/useRealtime';
import { KanbanColumn } from './KanbanColumn';
import { Card } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

const BOARD_ID = '00000000-0000-0000-0000-000000000001';

export function KanbanBoard() {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  
  const { data: columns, isLoading: columnsLoading } = useColumns(BOARD_ID);
  const { data: cards, isLoading: cardsLoading } = useCards();
  const moveCardMutation = useMoveCard();
  const { toast } = useToast();

  // Enable real-time updates
  useRealtimeCards();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards?.find(c => c.id === event.active.id);
    if (card) {
      setActiveCard(card as Card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    const activeCard = cards?.find(card => card.id === active.id);
    if (!activeCard) return;

    const overColumnId = over.id as string;
    const cardsInOverColumn = cards?.filter(card => card.column_id === overColumnId) || [];
    const newPosition = cardsInOverColumn.length + 1;

    try {
      await moveCardMutation.mutateAsync({
        cardId: activeCard.id,
        newColumnId: overColumnId,
        newPosition,
      });

      toast({
        title: 'Card movido!',
        description: 'O card foi movido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível mover o card. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  if (columnsLoading || cardsLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="kanban-column p-4 h-96">
              <div className="shimmer h-6 w-32 rounded mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="shimmer h-24 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-secondary">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          BIX IA Hackathon - Quadro de Ideias
        </h1>
        <p className="text-muted-foreground text-lg">
          Colabore, vote e organize as melhores ideias para o hackathon
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {columns?.map((column) => {
            const columnCards = (cards?.filter(card => card.column_id === column.id) || []) as Card[];
            
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={columnCards}
              />
            );
          })}
        </div>

        {/* Drag overlay could be added here */}
      </DndContext>
    </div>
  );
}