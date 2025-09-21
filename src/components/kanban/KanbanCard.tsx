import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, User, MoreHorizontal } from 'lucide-react';
import { useVoteCard } from '@/hooks/useKanban';
import { CardDetailsDialog } from './CardDetailsDialog';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KanbanCardProps {
  card: CardType;
}

export function KanbanCard({ card }: KanbanCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const voteCardMutation = useVoteCard();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await voteCardMutation.mutateAsync(card.id);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Média';
    }
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`kanban-card cursor-pointer ${isDragging ? 'kanban-card-dragging' : ''} ${
          card.priority ? `priority-${card.priority}` : ''
        }`}
        onClick={() => setIsDetailsOpen(true)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <Badge variant="secondary" className={getPriorityColor(card.priority)}>
              {getPriorityLabel(card.priority)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(true);
              }}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-sm mb-2 line-clamp-2">
            {card.title}
          </h4>

          {/* Description */}
          {card.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {card.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {card.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{card.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={card.creator?.avatar_url} />
                <AvatarFallback className="text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(card.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`vote-button h-6 px-2 ${
                  card.user_has_voted ? 'vote-button-active' : ''
                }`}
                onClick={handleVote}
              >
                <Heart className={`h-3 w-3 mr-1 ${
                  card.user_has_voted ? 'fill-current' : ''
                }`} />
                <span className="text-xs">{card.vote_count || 0}</span>
              </Button>

              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                <span className="text-xs">{card.comment_count || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CardDetailsDialog
        card={card}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
}