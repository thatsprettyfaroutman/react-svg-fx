export const uid = (() => {
  let count = 0
  return () => `fx-${count++}`
})()
