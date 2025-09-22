import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Button } from '../components/ui/Button'
import { CreateOrganizationModal } from '../components/organizations/CreateOrganizationModal'
import { Building2, Users, FolderKanban, Plus } from 'lucide-react'

interface Organization {
  id: string
  name: string
  description: string
  slug: string
}

interface Project {
  id: string
  name: string
  description: string
  status: string
  organization: Organization
  boards: Array<{
    id: string
    name: string
    description: string
  }>
}

export function ProjectSelectionPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null)
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false)

  console.log('🔥 ProjectSelectionPage render - isCreateOrgModalOpen:', isCreateOrgModalOpen)

  // Fetch user's organizations
  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['user-organizations'],
    queryFn: async (): Promise<Organization[]> => {
      const { data, error } = await supabase
        .from('user_organizations')
        .select(`
          organization_id,
          organizations:organizations(
            id,
            name,
            description,
            slug
          )
        `)
        .eq('user_id', user?.id)

      if (error) throw error
      return data.map(item => item.organizations).filter(Boolean)
    },
    enabled: !!user?.id,
  })

  // Fetch projects for selected organization
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['organization-projects', selectedOrg],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          status,
          organizations:organizations(
            id,
            name,
            description,
            slug
          ),
          boards:boards(
            id,
            name,
            description
          )
        `)
        .eq('organization_id', selectedOrg)

      if (error) throw error
      return data.map(project => ({
        ...project,
        organization: project.organizations
      }))
    },
    enabled: !!selectedOrg,
  })

  if (orgsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('projectSelection.noOrganizations')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('projectSelection.noOrganizationsDescription')}
          </p>
          <Button onClick={() => {
            console.log('🔥 Create Organization button clicked!')
            console.log('🔥 Setting isCreateOrgModalOpen to true')
            setIsCreateOrgModalOpen(true)
            console.log('🔥 State should now be true')
          }}>
            <Plus className="w-4 h-4 mr-2" />
            {t('projectSelection.createOrganization')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('projectSelection.title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('projectSelection.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
        {/* Organizations Panel */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center mb-4">
            <Building2 className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-foreground">{t('projectSelection.organizations')}</h2>
          </div>

          <div className="space-y-3">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => setSelectedOrg(org.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedOrg === org.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-border/80'
                }`}
              >
                <h3 className="font-medium text-foreground">{org.name}</h3>
                {org.description && (
                  <p className="text-sm text-muted-foreground mt-1">{org.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Panel */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center mb-4">
            <FolderKanban className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <h2 className="text-xl font-semibold text-foreground">{t('projectSelection.projects')}</h2>
          </div>

          {!selectedOrg ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {t('projectSelection.selectOrganization')}
              </p>
            </div>
          ) : projectsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                {t('projectSelection.noProjects')}
              </p>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('projectSelection.createProject')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-lg border border-border hover:border-border/80 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                              : project.status === 'planning'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                              : project.status === 'paused'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {project.boards && project.boards.length > 0 ? (
                        <Link
                          to={`/project/${project.id}/board/${project.boards[0].id}`}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                        >
                          {t('projectSelection.openBoard')}
                        </Link>
                      ) : (
                        <Button size="sm" variant="outline">
                          {t('projectSelection.createBoard')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={isCreateOrgModalOpen}
        onClose={() => setIsCreateOrgModalOpen(false)}
      />
    </div>
  </div>
  )
}