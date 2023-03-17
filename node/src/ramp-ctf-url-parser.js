function getUpdatedStateFromElement(state, el) {
  const tag = el.tagName.toLowerCase()

  const isValidSection = tag === 'section' && /^11/.test(el.id)
  const isValidMain = state.hasSection && tag === 'main' && /22$/.test(el.id)
  const isValidArticle = state.hasSection && state.hasMain && tag === 'article' && /33/.test(el.id)
  const isValidUrlPart = state.hasSection && state.hasMain && state.hasArticle
    && tag === 'p' && /flag/.test(el.className)

  return {
    hasSection: isValidSection || (!isValidUrlPart && state.hasSection),
    hasMain: isValidMain
      || (!isValidUrlPart && !isValidSection && state.hasSection && state.hasMain),
    hasArticle: isValidArticle
      || (!isValidUrlPart && !isValidSection && !isValidMain
        && state.hasSection && state.hasMain && state.hasArticle),
    urlPart: isValidUrlPart ? el.getAttribute('value') : '',
  }
}

function getUrl() {
  const tempElement = document.createElement('div')
  let url = ''
  let state = {
    hasSection: false,
    hasMain: false,
    hasArticle: false,
    urlPart: '',
  }

  const iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT)
  let currentNode
  while (currentNode = iterator.nextNode()) {
    tempElement.appendChild(currentNode.cloneNode())

    state = getUpdatedStateFromElement(state, tempElement.firstElementChild)
    if (state.urlPart) {
      url += state.urlPart
    }

    tempElement.replaceChildren()
  }

  return url
}
