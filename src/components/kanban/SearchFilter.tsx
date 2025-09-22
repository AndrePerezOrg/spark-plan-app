import { useState } from 'react'
import { Search, Filter, X, Archive } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'

interface Filters {
  priority: string
  creator: string
  column: string
  tags: string[]
  showArchived: boolean
}

interface SearchFilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  columns?: Array<{ id: string; name: string }>
}

export function SearchFilter({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  columns = [],
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false)
  const { t } = useLanguage()

  const handlePriorityChange = (priority: string) => {
    onFiltersChange({
      ...filters,
      priority: filters.priority === priority ? '' : priority,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      priority: '',
      creator: '',
      column: '',
      tags: [],
      showArchived: false,
    })
    onSearchChange('')
  }

  const hasActiveFilters = searchTerm || filters.priority || filters.creator || filters.column || filters.tags.length > 0 || filters.showArchived

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-primary pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            {t('filters.title')}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="inline-flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              {t('filters.clear')}
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-card p-4 rounded-lg border border-border space-y-4">
          <h3 className="font-medium text-foreground">{t('filters.title')}</h3>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('filters.priority')}
            </label>
            <div className="flex gap-2">
              {[
                { value: 'high', label: t('filters.priority.high'), color: 'bg-red-100 text-red-800' },
                { value: 'medium', label: t('filters.priority.medium'), color: 'bg-yellow-100 text-yellow-800' },
                { value: 'low', label: t('filters.priority.low'), color: 'bg-green-100 text-green-800' },
              ].map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => handlePriorityChange(priority.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    filters.priority === priority.value
                      ? `${priority.color} border-current`
                      : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Creator Filter */}
          <div>
            <Input
              label={t('filters.creator')}
              placeholder={t('filters.creator.placeholder')}
              value={filters.creator}
              onChange={(e) =>
                onFiltersChange({ ...filters, creator: e.target.value })
              }
            />
          </div>

          {/* Column Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('filters.column')}
            </label>
            <select
              value={filters.column}
              onChange={(e) =>
                onFiltersChange({ ...filters, column: e.target.value })
              }
              className="select-primary"
            >
              <option value="">{t('filters.column.all')}</option>
              {columns.map((column) => (
                <option key={column.id} value={column.name}>
                  {column.name}
                </option>
              ))}
            </select>
          </div>

          {/* Show Archived Toggle */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showArchived}
                onChange={(e) =>
                  onFiltersChange({ ...filters, showArchived: e.target.checked })
                }
                className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2"
              />
              <Archive className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {t('filters.archived')}
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground">{t('filters.active')}</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
              {t('filters.search')}: "{searchTerm}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full">
              {t('filters.priority')}: {filters.priority}
              <button
                onClick={() => handlePriorityChange(filters.priority)}
                className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.creator && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
              {t('filters.creator')}: {filters.creator}
              <button
                onClick={() => onFiltersChange({ ...filters, creator: '' })}
                className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.column && (
            <span className="inline-flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded-full">
              {t('filters.column')}: {filters.column}
              <button
                onClick={() => onFiltersChange({ ...filters, column: '' })}
                className="ml-1 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.showArchived && (
            <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground rounded-full">
              <Archive className="w-3 h-3 mr-1" />
              {t('filters.archived')}
              <button
                onClick={() => onFiltersChange({ ...filters, showArchived: false })}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}