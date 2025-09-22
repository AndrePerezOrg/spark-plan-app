import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useComments, useCreateComment, useVoteCard, useUpdateCard, useColumns } from '../../hooks/useKanban'
import { useRealtimeComments } from '../../hooks/useRealtime'
import { useToast } from '../ui/Toaster'
import { useLanguage } from '../../contexts/LanguageContext'
import { CardWithDetails } from '../../types/database'
import { Heart, MessageCircle, User, Calendar, Tag, Send, ArrowRight, Archive, ArchiveRestore, ChevronDown, ChevronRight, Settings } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'

interface CardModalProps {
  card: CardWithDetails
  isOpen: boolean
  onClose: () => void
  boardId?: string
}

export function CardModal({ card, isOpen, onClose, boardId }: CardModalProps) {
  const [newComment, setNewComment] = useState('')
  const [selectedColumnId, setSelectedColumnId] = useState(card.column_id)
  const [selectedPriority, setSelectedPriority] = useState(card.priority)
  const [isManagementOpen, setIsManagementOpen] = useState(false)
  const { t, language } = useLanguage()

  const { data: comments, isLoading: commentsLoading } = useComments(card.id)
  const { data: columns } = useColumns(boardId)
  const createCommentMutation = useCreateComment()
  const voteCardMutation = useVoteCard()
  const updateCardMutation = useUpdateCard()
  const { toast } = useToast()

  // Enable real-time subscriptions for this card's comments
  useRealtimeComments(card.id)

  const handleVote = async () => {
    try {
      await voteCardMutation.mutateAsync(card.id)
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message || t('toast.vote.error'),
        variant: 'error',
      })
    }
  }

  const handleMoveCard = async () => {
    if (selectedColumnId === card.column_id) return

    try {
      await updateCardMutation.mutateAsync({
        id: card.id,
        column_id: selectedColumnId,
      })

      toast({
        title: t('toast.move.success'),
        description: t('toast.move.description'),
        variant: 'success',
      })
      onClose()
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message || t('toast.move.error'),
        variant: 'error',
      })
    }
  }

  const handleToggleArchive = async () => {
    try {
      await updateCardMutation.mutateAsync({
        id: card.id,
        status: card.status === 'archived' ? 'active' : 'archived',
      })

      toast({
        title: card.status === 'archived' ? t('toast.restore.success') : t('toast.archive.success'),
        description: card.status === 'archived'
          ? t('toast.restore.description')
          : t('toast.archive.description'),
        variant: 'success',
      })
      onClose()
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message || t('toast.archive.error'),
        variant: 'error',
      })
    }
  }

  const handleUpdatePriority = async () => {
    if (selectedPriority === card.priority) return

    try {
      await updateCardMutation.mutateAsync({
        id: card.id,
        priority: selectedPriority,
      })

      toast({
        title: t('toast.priority.success'),
        description: t('toast.priority.description'),
        variant: 'success',
      })
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message || t('toast.priority.error'),
        variant: 'error',
      })
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    try {
      await createCommentMutation.mutateAsync({
        cardId: card.id,
        content: newComment.trim(),
      })

      setNewComment('')
      toast({
        title: t('toast.comment.success'),
        description: t('toast.comment.description'),
        variant: 'success',
      })
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message || t('toast.comment.error'),
        variant: 'error',
      })
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {card.title}
              </h2>

              {/* Meta Information */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
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

                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(new Date(card.created_at), {
                      addSuffix: true,
                      locale: language === 'pt-BR' ? ptBR : enUS,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Priority and Actions */}
            <div className="flex flex-col gap-2 ml-4">
              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(card.priority)}`}>
                {getPriorityLabel(card.priority)}
              </span>

              <Button
                variant={card.user_has_voted ? 'primary' : 'secondary'}
                size="sm"
                onClick={handleVote}
                loading={voteCardMutation.isPending}
                className="flex items-center gap-1"
              >
                <Heart className={`w-3 h-3 ${card.user_has_voted ? 'fill-current' : ''}`} />
                <span>{card.vote_count || 0}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {card.description && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('modal.description')}</h4>
              <p className="text-gray-600 whitespace-pre-wrap">
                {card.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('modal.tags')}</h4>
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Card Management Accordion */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setIsManagementOpen(!isManagementOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-600" />
                <h4 className="font-semibold text-gray-900">{t('modal.manage')}</h4>
              </div>
              {isManagementOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {isManagementOpen && (
              <div className="p-4 space-y-4 border-t border-gray-200">

            {/* Move Card */}
            {columns && columns.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('card.move')}
                </label>
                <div className="flex gap-2">
                  <Select
                    value={selectedColumnId}
                    onChange={setSelectedColumnId}
                    options={columns.map(col => ({
                      value: col.id,
                      label: col.name,
                      disabled: col.id === card.column_id
                    }))}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleMoveCard}
                    disabled={selectedColumnId === card.column_id || updateCardMutation.isPending}
                    loading={updateCardMutation.isPending}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ArrowRight className="w-3 h-3" />
                    {t('card.move')}
                  </Button>
                </div>
              </div>
            )}

            {/* Update Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('modal.priority.change')}
              </label>
              <div className="flex gap-2">
                <Select
                  value={selectedPriority}
                  onChange={setSelectedPriority}
                  options={[
                    { value: 'low', label: t('filters.priority.low') },
                    { value: 'medium', label: t('filters.priority.medium') },
                    { value: 'high', label: t('filters.priority.high') },
                  ]}
                  className="flex-1"
                />
                <Button
                  onClick={handleUpdatePriority}
                  disabled={selectedPriority === card.priority || updateCardMutation.isPending}
                  loading={updateCardMutation.isPending}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {t('card.priority.update')}
                </Button>
              </div>
            </div>

            {/* Archive Toggle */}
            <div>
              <Button
                onClick={handleToggleArchive}
                disabled={updateCardMutation.isPending}
                loading={updateCardMutation.isPending}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                {card.status === 'archived' ? (
                  <>
                    <ArchiveRestore className="w-4 h-4" />
                    {t('card.restore')}
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    {t('card.archive')}
                  </>
                )}
              </Button>
            </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Comments Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-900">
                {t('modal.comments')} ({comments?.length || 0})
              </h4>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('modal.addComment')}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  className="self-end px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {commentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="w-24 h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                        <div className="w-full h-12 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                      {comment.user?.avatar_url ? (
                        <img
                          src={comment.user.avatar_url}
                          alt={comment.user.display_name || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.user?.display_name || t('user.defaultName')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: language === 'pt-BR' ? ptBR : enUS,
                          })}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-sm py-8">
                  {t('modal.noComments')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}