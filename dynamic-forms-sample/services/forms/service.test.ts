import { describe, expect, it } from 'vitest'

import { FORM_DEFINITION_SEEDS } from './seed'
import { getFormDefinition, listFormDefinitions } from './service'
import type { FormDefinition } from './types'
import type { FormDefinitionRepository } from './repository'

function createRepository(definitions: readonly FormDefinition[]): FormDefinitionRepository {
  return {
    async list() {
      return definitions
    },
    async getByType(type) {
      return definitions.find((definition) => definition.type === type) ?? null
    },
  }
}

describe('#getFormDefinition', () => {
  it('returns a registered definition and returns null when the definition is missing', async () => {
    const repository = createRepository(FORM_DEFINITION_SEEDS)

    await expect(getFormDefinition('absence-report', repository)).resolves.toEqual(
      FORM_DEFINITION_SEEDS.find((definition) => definition.type === 'absence-report'),
    )
    await expect(getFormDefinition('unknown-form', repository)).resolves.toBeNull()
  })

  it('throws when a found definition has no registered submission schema', async () => {
    const repository = createRepository([
      { type: 'unregistered', title: 'Unregistered', fields: [] },
    ])

    await expect(getFormDefinition('unregistered', repository)).rejects.toThrow(
      'No submission schema is registered for form type "unregistered".',
    )
  })

  it('propagates repository errors', async () => {
    const repository: FormDefinitionRepository = {
      async list() {
        return []
      },
      async getByType() {
        throw new Error('Repository unavailable')
      },
    }

    await expect(getFormDefinition('absence-report', repository)).rejects.toThrow('Repository unavailable')
  })
})

describe('#listFormDefinitions', () => {
  it('returns registered definitions in repository order', async () => {
    const definitions = [FORM_DEFINITION_SEEDS[2], FORM_DEFINITION_SEEDS[0]]

    await expect(listFormDefinitions(createRepository(definitions))).resolves.toEqual(definitions)
  })

  it('returns an empty list when the repository has no definitions', async () => {
    await expect(listFormDefinitions(createRepository([]))).resolves.toEqual([])
  })

  it('throws if any listed definition has no registered submission schema', async () => {
    const definitions = [
      FORM_DEFINITION_SEEDS[0],
      { type: 'unregistered', title: 'Unregistered', fields: [] },
      FORM_DEFINITION_SEEDS[1],
    ]

    await expect(listFormDefinitions(createRepository(definitions))).rejects.toThrow(
      'No submission schema is registered for form type "unregistered".',
    )
  })

  it('propagates repository errors', async () => {
    const repository: FormDefinitionRepository = {
      async list() {
        throw new Error('Repository unavailable')
      },
      async getByType() {
        return null
      },
    }

    await expect(listFormDefinitions(repository)).rejects.toThrow('Repository unavailable')
  })
})
