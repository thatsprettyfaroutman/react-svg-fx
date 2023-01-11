export const getElementFromHtml = (htmlString: string) => {
  const domParser = new DOMParser()

  return domParser
    .parseFromString(htmlString, 'image/svg+xml')
    ?.querySelector('svg')
}
