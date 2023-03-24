const MAX = 10
const myThing = {
  size: 10,
  x: 1,
  y: 4,
}

function getUrl() {
  let i = 0

  // if
  if (i < MAX) {
    console.log('i:', i)
  }
  // 0

  // repeat
  while (i < MAX) {
    i++
    console.log('i:', i)
  }
  // 1
  // ...
  // 10

  do {
    i++
    console.log('i:', i)
  } while (i < MAX)
  // 11

  // repeat
  for (let j = 0; j < MAX; j += 2) {
    console.log('j:', j)
  }
  // 0
  // ...
  // 8

  // forever
  while (true) {
    console.log('Look ma! No end!')
  }
}

getUrl()
