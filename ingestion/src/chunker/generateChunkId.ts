export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section'
  )
}

export function generateChunkId(
  docId: string,
  headingPath: string,
  index: number,
): string {
  const slug = headingPath ? slugify(headingPath) : 'content'
  const padded = String(index).padStart(4, '0')
  return `${docId}-${slug}-${padded}`
}
