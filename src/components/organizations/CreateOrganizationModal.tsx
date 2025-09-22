import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { supabase } from '../../lib/supabase'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Building2, X } from 'lucide-react'

interface CreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CreateOrganizationData {
  name: string
  slug: string
  description: string
  website_url?: string
}

export function CreateOrganizationModal({ isOpen, onClose }: CreateOrganizationModalProps) {
  console.log('🔥 CreateOrganizationModal rendered with isOpen:', isOpen)
  const { user } = useAuth()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    website_url: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createOrganizationMutation = useMutation({
    mutationFn: async (data: CreateOrganizationData) => {
      // Create the organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description,
          website_url: data.website_url || null,
          created_by: user?.id,
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Add the creator as an admin of the organization
      const { error: memberError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: user?.id,
          organization_id: organization.id,
          role: 'admin',
        })

      if (memberError) throw memberError

      return organization
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] })
      handleClose()
    },
    onError: (error: any) => {
      console.error('Error creating organization:', error)
      if (error.code === '23505') {
        setErrors({ slug: t('createOrg.slugInUse') })
      } else {
        setErrors({ general: t('createOrg.generalError') })
      }
    },
  })

  const handleClose = () => {
    setFormData({ name: '', slug: '', description: '', website_url: '' })
    setErrors({})
    onClose()
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: prev.slug === '' ? generateSlug(value) : prev.slug
    }))
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }))
    }
  }

  const handleSlugChange = (value: string) => {
    const cleanSlug = generateSlug(value)
    setFormData(prev => ({ ...prev, slug: cleanSlug }))
    if (errors.slug) {
      setErrors(prev => ({ ...prev, slug: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('createOrg.nameRequired')
    }

    if (!formData.slug.trim()) {
      newErrors.slug = t('createOrg.slugRequired')
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = t('createOrg.slugFormat')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    createOrganizationMutation.mutate({
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      website_url: formData.website_url.trim() || undefined,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 text-indigo-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t('createOrg.title')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('createOrg.nameLabel')}
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t('createOrg.namePlaceholder')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              {t('createOrg.slugLabel')}
            </label>
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder={t('createOrg.slugPlaceholder')}
              className={errors.slug ? 'border-red-500' : ''}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {t('createOrg.slugHelp')}
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('createOrg.descriptionLabel')}
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('createOrg.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              {t('createOrg.websiteLabel')}
            </label>
            <Input
              id="website"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
              placeholder={t('createOrg.websitePlaceholder')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createOrganizationMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={createOrganizationMutation.isPending}
            >
              {createOrganizationMutation.isPending ? t('createOrg.creating') : t('createOrg.create')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}