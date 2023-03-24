const { expect } = require('chai')
const { validateVin } = require('../vin')

describe('vin', () => {
  describe('#validateVin', () => {
    const input = {
      fuel_type: 'gasoline',
      make: 'Nissan',
      model: 'Altima',
      vin: '1N4AL3AP4DN430959',
      year: '2013',
    }

    it('returns empty array for success', async () => {
      const result = await validateVin(input)
      expect(result).to.eql([])
    })

    it('fails vin when more than 17 characters', async () => {
      const result = await validateVin({ ...input, vin: input.vin + 'R' })
      expect(result).to.eql(['vin'])
    })

    it('fails vin when it contains Q, I, or O', async () => {
      const result = await validateVin({ ...input, vin: input.vin.slice(0, 16) + 'Q' })
      expect(result).to.eql(['vin'])
    })

    it('returns all incorrect fields', async () => {
      const result = await validateVin({
        fuel_type: 'diesel',
        make: 'Toyota',
        model: 'Camry',
        vin: input.vin,
        year: '2010',
      })
      expect(result).to.eql(['fuel_type', 'make', 'model', 'year'])
    })
  })
})
