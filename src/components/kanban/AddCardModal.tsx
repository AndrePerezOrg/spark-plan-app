import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { useCreateCard } from '../../hooks/useKanban'
import { useToast } from '../ui/Toaster'
import { useLanguage } from '../../contexts/LanguageContext'
import { Priority } from '../../types/database'
import { Plus, X } from 'lucide-react'

interface AddCardModalProps {
  isOpen: boolean
  onClose: () => void
  columnId: string | null
}

export function AddCardModal({ isOpen, onClose, columnId }: AddCardModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const createCardMutation = useCreateCard()
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: t('toast.error'),
        description: t('addCard.titleRequired'),
        variant: 'error',
      })
      return
    }

    if (!columnId) {
      toast({
        title: t('toast.error'),
        description: t('addCard.columnRequired'),
        variant: 'error',
      })
      return
    }

    try {
      await createCardMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        column_id: columnId,
        priority,
        tags: tags.length > 0 ? tags : undefined,
      })

      toast({
        title: t('addCard.success'),
        description: t('addCard.successDescription'),
        variant: 'success',
      })

      // Reset form
      setTitle('')
      setDescription('')
      setPriority('medium')
      setTags([])
      setTagInput('')
      onClose()
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message || t('addCard.error'),
        variant: 'error',
      })
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setTags([])
    setTagInput('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('addCard.title')}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title */}
        <Input
          label={t('addCard.titleLabel')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('addCard.titlePlaceholder')}
          required
        />

        {/* Description */}
        <Textarea
          label={t('addCard.descriptionLabel')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('addCard.descriptionPlaceholder')}
          rows={4}
        />

        {/* Priority */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('addCard.priorityLabel')}
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="select-primary"
          >
            <option value="low">{t('filters.priority.low')}</option>
            <option value="medium">{t('filters.priority.medium')}</option>
            <option value="high">{t('filters.priority.high')}</option>
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('addCard.tagsLabel')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder={t('addCard.tagsPlaceholder')}
              className="input-primary flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addTag}
              disabled={!tagInput.trim() || tags.length >= 5}
              className="px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Tags Display */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">
            {t('addCard.tagsHelp')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            loading={createCardMutation.isPending}
            className="flex-1"
          >
            {t('addCard.create')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}