const odbc = require('odbc')

const connectionString = 'DRIVER={CData ODBC Driver for GraphQL};URL=http://localhost:4000;'

const test = async () => {
  let connection

  try {
    connection = await odbc.connect(connectionString)
    const tables = await connection.tables(null, null, null, null)
    tables.forEach(table => console.log('table:', JSON.stringify(table, null, 2)))

    const columns = await connection.columns(null, null, null, null)
    columns.forEach(col => console.info('column:', JSON.stringify(col, null, 2)))

    const query = `
select
  l.id,
  l.title,
  l.locationType,
  l.costPerNight,
  l.numOfBeds,
  l.overallRating,
  la.category,
  la.name
from featuredListings l
  join featuredListings_amenities la
`
    const rows = await connection.query(query)
    rows.forEach(row => console.info('listing:', JSON.stringify(row, null, 2)))
  } catch (err) {
    console.error('FAIL', err)
  } finally {
    connection?.close()
  }
}

test()
