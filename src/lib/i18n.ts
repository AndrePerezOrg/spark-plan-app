// Simple internationalization system
export type Language = 'pt-BR' | 'en'

export const translations = {
  'pt-BR': {
    // Header
    'kanban.title': 'Quadro de Ideias',
    'kanban.subtitle': 'Gerencie e colabore em ideias inovadoras',

    // Search and Filters
    'search.placeholder': 'Buscar ideias por título ou descrição...',
    'filters.title': 'Filtros',
    'filters.clear': 'Limpar',
    'filters.priority': 'Prioridade',
    'filters.priority.high': 'Alta',
    'filters.priority.medium': 'Média',
    'filters.priority.low': 'Baixa',
    'filters.creator': 'Criador',
    'filters.creator.placeholder': 'Filtrar por criador...',
    'filters.column': 'Coluna/Status',
    'filters.column.all': 'Todas as colunas',
    'filters.archived': 'Mostrar cards arquivados',
    'filters.active': 'Filtros ativos:',
    'filters.search': 'Busca',
    'filters.priority.label': 'Prioridade',
    'filters.creator.label': 'Criador',
    'filters.column.label': 'Coluna',

    // Card Actions
    'card.vote': 'Votar',
    'card.comment': 'Comentar',
    'card.edit': 'Editar',
    'card.archive': 'Arquivar Card',
    'card.restore': 'Desarquivar Card',
    'card.archived': 'Arquivado',
    'card.move': 'Mover para coluna',
    'card.priority.update': 'Atualizar',

    // Column
    'column.dropHere': 'Solte o card aqui!',
    'column.dropToChange': 'Solte o card aqui para mudar seu status',
    'column.addIdea': 'Adicione uma ideia',

    // Card Modal
    'modal.manage': 'Gerenciar Card',
    'modal.comments': 'Comentários',
    'modal.addComment': 'Adicione um comentário...',
    'modal.noComments': 'Nenhum comentário ainda. Seja o primeiro a comentar!',
    'modal.description': 'Descrição',
    'modal.tags': 'Tags',
    'modal.priority.change': 'Alterar prioridade',

    // User and Auth
    'user.defaultName': 'Usuário',
    'auth.signOut': 'Sair',

    // Project Selection
    'projectSelection.title': 'Selecionar Projeto',
    'projectSelection.subtitle': 'Escolha uma organização e projeto para acessar o quadro Kanban',
    'projectSelection.organizations': 'Organizações',
    'projectSelection.projects': 'Projetos',
    'projectSelection.noOrganizations': 'Nenhuma Organização Encontrada',
    'projectSelection.noOrganizationsDescription': 'Você não está associado a nenhuma organização ainda.',
    'projectSelection.createOrganization': 'Criar Organização',
    'projectSelection.selectOrganization': 'Selecione uma organização para ver os projetos',
    'projectSelection.noProjects': 'Nenhum projeto encontrado nesta organização',
    'projectSelection.createProject': 'Criar Projeto',
    'projectSelection.openBoard': 'Abrir Quadro',
    'projectSelection.createBoard': 'Criar Quadro',

    // Create Organization Modal
    'createOrg.title': 'Criar Nova Organização',
    'createOrg.nameLabel': 'Nome da Organização *',
    'createOrg.namePlaceholder': 'Ex: BIX Innovation Hub',
    'createOrg.slugLabel': 'Slug (URL) *',
    'createOrg.slugPlaceholder': 'Ex: bix-innovation',
    'createOrg.slugHelp': 'Usado na URL da organização. Apenas letras minúsculas, números e hífens.',
    'createOrg.descriptionLabel': 'Descrição',
    'createOrg.descriptionPlaceholder': 'Descreva o propósito da organização...',
    'createOrg.websiteLabel': 'Website (opcional)',
    'createOrg.websitePlaceholder': 'https://exemplo.com',
    'createOrg.create': 'Criar Organização',
    'createOrg.creating': 'Criando...',
    'createOrg.nameRequired': 'Nome da organização é obrigatório',
    'createOrg.slugRequired': 'Slug é obrigatório',
    'createOrg.slugFormat': 'Slug deve conter apenas letras minúsculas, números e hífens',
    'createOrg.slugInUse': 'Este slug já está em uso. Escolha outro.',
    'createOrg.generalError': 'Erro ao criar organização. Tente novamente.',

    // Add Card Modal
    'addCard.title': 'Nova Ideia',
    'addCard.titleLabel': 'Título *',
    'addCard.titlePlaceholder': 'Descreva sua ideia em poucas palavras...',
    'addCard.descriptionLabel': 'Descrição',
    'addCard.descriptionPlaceholder': 'Detalhe sua ideia, explique como funcionaria...',
    'addCard.priorityLabel': 'Prioridade',
    'addCard.tagsLabel': 'Tags (opcional)',
    'addCard.tagsPlaceholder': 'Adicione uma tag...',
    'addCard.tagsHelp': 'Máximo 5 tags. Pressione Enter para adicionar.',
    'addCard.create': 'Criar Ideia',
    'addCard.titleRequired': 'O título é obrigatório.',
    'addCard.columnRequired': 'Selecione uma coluna.',
    'addCard.success': 'Ideia criada!',
    'addCard.successDescription': 'Sua ideia foi adicionada ao quadro.',
    'addCard.error': 'Não foi possível criar a ideia.',

    // Toast Messages
    'toast.error': 'Erro',
    'toast.vote.error': 'Não foi possível votar.',
    'toast.move.success': 'Card movido!',
    'toast.move.description': 'O card foi movido para a nova coluna com sucesso.',
    'toast.move.error': 'Não foi possível mover o card.',
    'toast.archive.success': 'Card arquivado!',
    'toast.restore.success': 'Card desarquivado!',
    'toast.archive.description': 'O card foi arquivado com sucesso.',
    'toast.restore.description': 'O card foi desarquivado com sucesso.',
    'toast.archive.error': 'Não foi possível arquivar/desarquivar o card.',
    'toast.priority.success': 'Prioridade atualizada!',
    'toast.priority.description': 'A prioridade do card foi atualizada com sucesso.',
    'toast.priority.error': 'Não foi possível atualizar a prioridade.',
    'toast.comment.success': 'Comentário adicionado!',
    'toast.comment.description': 'Seu comentário foi adicionado com sucesso.',
    'toast.comment.error': 'Não foi possível adicionar o comentário.',

    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro ao carregar o quadro. Tente novamente.',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.close': 'Fechar',
  },
  'en': {
    // Header
    'kanban.title': 'Ideas Board',
    'kanban.subtitle': 'Manage and collaborate on innovative ideas',

    // Search and Filters
    'search.placeholder': 'Search ideas by title or description...',
    'filters.title': 'Filters',
    'filters.clear': 'Clear',
    'filters.priority': 'Priority',
    'filters.priority.high': 'High',
    'filters.priority.medium': 'Medium',
    'filters.priority.low': 'Low',
    'filters.creator': 'Creator',
    'filters.creator.placeholder': 'Filter by creator...',
    'filters.column': 'Column/Status',
    'filters.column.all': 'All columns',
    'filters.archived': 'Show archived cards',
    'filters.active': 'Active filters:',
    'filters.search': 'Search',
    'filters.priority.label': 'Priority',
    'filters.creator.label': 'Creator',
    'filters.column.label': 'Column',

    // Card Actions
    'card.vote': 'Vote',
    'card.comment': 'Comment',
    'card.edit': 'Edit',
    'card.archive': 'Archive Card',
    'card.restore': 'Restore Card',
    'card.archived': 'Archived',
    'card.move': 'Move to column',
    'card.priority.update': 'Update',

    // Column
    'column.dropHere': 'Drop the card here!',
    'column.dropToChange': 'Drop the card here to change its status',
    'column.addIdea': 'Add an idea',

    // Card Modal
    'modal.manage': 'Manage Card',
    'modal.comments': 'Comments',
    'modal.addComment': 'Add a comment...',
    'modal.noComments': 'No comments yet. Be the first to comment!',
    'modal.description': 'Description',
    'modal.tags': 'Tags',
    'modal.priority.change': 'Change priority',

    // User and Auth
    'user.defaultName': 'User',
    'auth.signOut': 'Sign Out',

    // Project Selection
    'projectSelection.title': 'Select Project',
    'projectSelection.subtitle': 'Choose an organization and project to access the Kanban board',
    'projectSelection.organizations': 'Organizations',
    'projectSelection.projects': 'Projects',
    'projectSelection.noOrganizations': 'No Organizations Found',
    'projectSelection.noOrganizationsDescription': 'You are not associated with any organization yet.',
    'projectSelection.createOrganization': 'Create Organization',
    'projectSelection.selectOrganization': 'Select an organization to see projects',
    'projectSelection.noProjects': 'No projects found in this organization',
    'projectSelection.createProject': 'Create Project',
    'projectSelection.openBoard': 'Open Board',
    'projectSelection.createBoard': 'Create Board',

    // Create Organization Modal
    'createOrg.title': 'Create New Organization',
    'createOrg.nameLabel': 'Organization Name *',
    'createOrg.namePlaceholder': 'Ex: BIX Innovation Hub',
    'createOrg.slugLabel': 'Slug (URL) *',
    'createOrg.slugPlaceholder': 'Ex: bix-innovation',
    'createOrg.slugHelp': 'Used in the organization URL. Only lowercase letters, numbers and hyphens.',
    'createOrg.descriptionLabel': 'Description',
    'createOrg.descriptionPlaceholder': 'Describe the organization purpose...',
    'createOrg.websiteLabel': 'Website (optional)',
    'createOrg.websitePlaceholder': 'https://example.com',
    'createOrg.create': 'Create Organization',
    'createOrg.creating': 'Creating...',
    'createOrg.nameRequired': 'Organization name is required',
    'createOrg.slugRequired': 'Slug is required',
    'createOrg.slugFormat': 'Slug must contain only lowercase letters, numbers and hyphens',
    'createOrg.slugInUse': 'This slug is already in use. Choose another.',
    'createOrg.generalError': 'Error creating organization. Please try again.',

    // Add Card Modal
    'addCard.title': 'New Idea',
    'addCard.titleLabel': 'Title *',
    'addCard.titlePlaceholder': 'Describe your idea in a few words...',
    'addCard.descriptionLabel': 'Description',
    'addCard.descriptionPlaceholder': 'Detail your idea, explain how it would work...',
    'addCard.priorityLabel': 'Priority',
    'addCard.tagsLabel': 'Tags (optional)',
    'addCard.tagsPlaceholder': 'Add a tag...',
    'addCard.tagsHelp': 'Maximum 5 tags. Press Enter to add.',
    'addCard.create': 'Create Idea',
    'addCard.titleRequired': 'Title is required.',
    'addCard.columnRequired': 'Select a column.',
    'addCard.success': 'Idea created!',
    'addCard.successDescription': 'Your idea was added to the board.',
    'addCard.error': 'Could not create the idea.',

    // Toast Messages
    'toast.error': 'Error',
    'toast.vote.error': 'Could not vote.',
    'toast.move.success': 'Card moved!',
    'toast.move.description': 'The card was successfully moved to the new column.',
    'toast.move.error': 'Could not move card.',
    'toast.archive.success': 'Card archived!',
    'toast.restore.success': 'Card restored!',
    'toast.archive.description': 'The card was successfully archived.',
    'toast.restore.description': 'The card was successfully restored.',
    'toast.archive.error': 'Could not archive/restore card.',
    'toast.priority.success': 'Priority updated!',
    'toast.priority.description': 'The card priority was successfully updated.',
    'toast.priority.error': 'Could not update priority.',
    'toast.comment.success': 'Comment added!',
    'toast.comment.description': 'Your comment was successfully added.',
    'toast.comment.error': 'Could not add comment.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error loading board. Please try again.',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
  }
}

// Get current language from localStorage or default to PT-BR
export const getCurrentLanguage = (): Language => {
  if (typeof window === 'undefined') return 'pt-BR'
  return (localStorage.getItem('language') as Language) || 'pt-BR'
}

// Set language in localStorage
export const setLanguage = (language: Language) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', language)
  }
}

// Get translation by key
export const t = (key: string, language?: Language): string => {
  const lang = language || getCurrentLanguage()
  const langTranslations = translations[lang]
  return langTranslations[key as keyof typeof langTranslations] || key
}