// TODO: handle dataUrl utf8 and base64

export const getSvgStringFromSrc = async (
  src: string,
  fetchOptions?: Parameters<typeof fetch>[1],
) => {
  if (src.toLowerCase().indexOf('<svg') === 0) {
    return src
  }

  const res = await fetch(src, fetchOptions)
  const contentType = res.headers.get('Content-Type')

  if (contentType !== 'image/svg+xml') {
    throw new Error('SvgFx, only svg images supported')
  }
  return res.text()
}
