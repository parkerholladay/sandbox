import 'server-only'

import { FORM_DEFINITION_SEEDS } from './seed'
import type { FormDefinition } from './types'

export interface FormDefinitionRepository {
  list(): Promise<readonly FormDefinition[]>;
  getByType(type: string): Promise<FormDefinition | null>;
}

export class SeedFormDefinitionRepository implements FormDefinitionRepository {
  async list(): Promise<readonly FormDefinition[]> {
    return structuredClone(FORM_DEFINITION_SEEDS)
  }

  async getByType(type: string): Promise<FormDefinition | null> {
    const definition = FORM_DEFINITION_SEEDS.find((candidate) => candidate.type === type)
    return definition ? structuredClone(definition) : null
  }
}

const defaultRepository: FormDefinitionRepository = new SeedFormDefinitionRepository()

export function getFormDefinitionRepository(): FormDefinitionRepository {
  return defaultRepository
}
