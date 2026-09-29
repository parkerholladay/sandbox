import 'server-only'

import { getFormSubmissionSchema } from './schemas'
import { getFormDefinitionRepository, type FormDefinitionRepository } from './repository'
import type { FormDefinition } from './types'

export async function getFormDefinition(
  type: string,
  repository: FormDefinitionRepository = getFormDefinitionRepository(),
): Promise<FormDefinition | null> {
  const definition = await repository.getByType(type)

  if (!definition) {
    return null
  }

  getFormSubmissionSchema(definition.type)

  return definition
}

export async function listFormDefinitions(
  repository: FormDefinitionRepository = getFormDefinitionRepository(),
): Promise<readonly FormDefinition[]> {
  const definitions = await repository.list()

  for (const definition of definitions) {
    getFormSubmissionSchema(definition.type)
  }

  return definitions
}
