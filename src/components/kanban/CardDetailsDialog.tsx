import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/types/database';
import { useComments, useCreateComment, useVoteCard } from '@/hooks/useKanban';
import { Heart, MessageCircle, User, Send, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface CardDetailsDialogProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetailsDialog({ card, isOpen, onClose }: CardDetailsDialogProps) {
  const [newComment, setNewComment] = useState('');
  
  const { data: comments, isLoading: commentsLoading } = useComments(card.id);
  const createCommentMutation = useCreateComment();
  const voteCardMutation = useVoteCard();
  const { toast } = useToast();

  const handleVote = async () => {
    try {
      await voteCardMutation.mutateAsync(card.id);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível votar. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        cardId: card.id,
        content: newComment.trim(),
      });
      
      setNewComment('');
      toast({
        title: 'Comentário adicionado!',
        description: 'Seu comentário foi publicado.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o comentário. Tente novamente.',
        variant: 'destructive',
      });
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{card.title}</DialogTitle>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={card.creator?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{card.creator?.display_name || 'Usuário'}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(card.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Badge className={getPriorityColor(card.priority)}>
                {getPriorityLabel(card.priority)}
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                className={`vote-button ${
                  card.user_has_voted ? 'vote-button-active' : ''
                }`}
                onClick={handleVote}
                disabled={voteCardMutation.isPending}
              >
                <Heart className={`h-4 w-4 mr-1 ${
                  card.user_has_voted ? 'fill-current' : ''
                }`} />
                {card.vote_count || 0} votos
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {card.description && (
            <div>
              <h4 className="font-semibold mb-2">Descrição</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {card.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Comments Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5" />
              <h4 className="font-semibold">
                Comentários ({comments?.length || 0})
              </h4>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um comentário..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="btn-primary"
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {commentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="shimmer h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <div className="shimmer h-4 w-24 rounded mb-2" />
                        <div className="shimmer h-12 w-full rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.user?.display_name || 'Usuário'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-8">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}