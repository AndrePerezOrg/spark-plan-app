import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Heart, MessageCircle, User, Calendar, Tag, Archive } from 'lucide-react'
import { CardWithDetails } from '../../types/database'
import { useVoteCard } from '../../hooks/useKanban'
import { CardModal } from './CardModal'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'

interface KanbanCardProps {
  card: CardWithDetails
  boardId?: string
}

export function KanbanCard({ card, boardId }: KanbanCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const voteCardMutation = useVoteCard()
  const { t, language } = useLanguage()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await voteCardMutation.mutateAsync(card.id)
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high'
      case 'medium':
        return 'priority-medium'
      case 'low':
        return 'priority-low'
      default:
        return 'priority-medium'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return t('filters.priority.high')
      case 'medium':
        return t('filters.priority.medium')
      case 'low':
        return t('filters.priority.low')
      default:
        return t('filters.priority.medium')
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`kanban-card ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''} ${
          card.status === 'archived' ? 'opacity-60 bg-muted/50 border-muted-foreground/30' : ''
        }`}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Priority Badge and Archive Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(card.priority)}`}>
              {getPriorityLabel(card.priority)}
            </span>
            {card.status === 'archived' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                <Archive className="w-3 h-3 mr-1" />
                {t('card.archived')}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
          {card.title}
        </h4>

        {/* Description */}
        {card.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {card.description}
          </p>
        )}

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {card.tags.length > 3 && (
              <span className="tag">
                +{card.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          {/* Creator and Date */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-center w-6 h-6 bg-muted rounded-full">
              {card.creator?.avatar_url ? (
                <img
                  src={card.creator.avatar_url}
                  alt={card.creator.display_name || 'User'}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <User className="w-3 h-3" />
              )}
            </div>
            <span className="font-medium">
              {card.creator?.display_name || t('user.defaultName')}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Vote Button */}
            <button
              onClick={handleVote}
              disabled={voteCardMutation.isPending}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                card.user_has_voted
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Heart className={`w-3 h-3 ${card.user_has_voted ? 'fill-current' : ''}`} />
              <span>{card.vote_count || 0}</span>
            </button>

            {/* Comments */}
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <MessageCircle className="w-3 h-3" />
              <span>{card.comment_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Creation Date */}
        <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground/70">
          <Calendar className="w-3 h-3" />
          <span>
            {formatDistanceToNow(new Date(card.created_at), {
              addSuffix: true,
              locale: language === 'pt-BR' ? ptBR : enUS,
            })}
          </span>
        </div>
      </div>

      {/* Card Modal */}
      <CardModal
        card={card}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boardId={boardId}
      />
    </>
  )
}