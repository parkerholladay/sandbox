function longestProfit(data) {
  let increaseMonths = []
  data.forEach(d => {
    const previous = increaseMonths.slice(-2, -1)[0]
    const last = increaseMonths.slice(-1)[0]
    if (previous === undefined || (last === undefined && d > previous) || d > last) {
      increaseMonths.push(d)
    } else if (d > previous && d < last) {
      increaseMonths.splice(-1, 1, d)
    }
  })

  console.log("increaseMonths:", increaseMonths)
  return increaseMonths.length
}

const data = [-1, 9, 0, 8, -5, 6, 5, 8, 6, -1, 0, 4, 5, 6, 7, 3, 9, 8, 9, 12, -5, 11, 12, -24]
longestProfit(data)

