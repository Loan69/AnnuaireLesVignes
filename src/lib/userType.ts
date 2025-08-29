export function getTableFromType(type?: string): 'eleves' | 'professeurs' {
    if (type === 'E') return 'eleves'
    if (type === 'P') return 'professeurs'
    throw new Error('Type utilisateur inconnu : ' + type)
  }
  