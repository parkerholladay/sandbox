import { describe, expect, it } from 'vitest'

import { FORM_DEFINITION_SEEDS } from './seed'
import {
  getFormDefinitionRepository,
  SeedFormDefinitionRepository,
  type FormDefinitionRepository,
} from './repository'

describe('#getByType', () => {
  it('lists seeds in order and looks up definitions by type', async () => {
    const repository = new SeedFormDefinitionRepository()
    const result = await repository.list()

    expect(result.map((form) => form.type)).toEqual(FORM_DEFINITION_SEEDS.map((form) => form.type))
    expect(await repository.getByType('field-trip-permission')).toEqual(
      FORM_DEFINITION_SEEDS.find((form) => form.type === 'field-trip-permission'),
    )
    expect(await repository.getByType('unknown-form')).toBeNull()
  })

  it('returns independent copies and accepts other repository implementations', async () => {
    const repository = getFormDefinitionRepository()
    const first = await repository.list()
    const originalTitle = first[0].title
    Object.assign(first[0], { title: 'Changed copy' })
    expect((await repository.getByType(first[0].type))?.title).toBe(originalTitle)

    const replacement: FormDefinitionRepository = {
      async list() {
        return []
      },
      async getByType() {
        return null
      },
    }
    expect(await replacement.list()).toEqual([])
    expect(await replacement.getByType('anything')).toBeNull()
  })
})
