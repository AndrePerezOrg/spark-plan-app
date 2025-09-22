import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { SearchFilter } from '../components/kanban/SearchFilter'
import { AddCardModal } from '../components/kanban/AddCardModal'
import { useColumns } from '../hooks/useKanban'
import { useLanguage } from '../contexts/LanguageContext'

export function DashboardPage() {
  const { projectId, boardId } = useParams<{ projectId: string; boardId: string }>()
  const { data: columns } = useColumns(boardId)
  const { t } = useLanguage()
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    priority: '',
    creator: '',
    column: '',
    tags: [] as string[],
    showArchived: false,
  })

  const handleAddCard = (columnId: string) => {
    setSelectedColumnId(columnId)
    setIsAddCardModalOpen(true)
  }

  return (
    <div className="w-full min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('kanban.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('kanban.subtitle')}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          columns={columns || []}
        />
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        boardId={boardId}
        searchTerm={searchTerm}
        filters={filters}
        onAddCard={handleAddCard}
      />

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => {
          setIsAddCardModalOpen(false)
          setSelectedColumnId(null)
        }}
        columnId={selectedColumnId}
      />
    </div>
  )
}