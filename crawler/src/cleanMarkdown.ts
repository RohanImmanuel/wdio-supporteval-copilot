export function cleanMarkdown(md: string): string {
  return md
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim()
}
