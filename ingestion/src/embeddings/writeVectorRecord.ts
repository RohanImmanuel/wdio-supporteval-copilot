import fs from 'fs'
import path from 'path'
import { VectorRecord } from './types'

export function appendVectorRecord(filePath: string, record: VectorRecord): void {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
  fs.appendFileSync(filePath, JSON.stringify(record) + '\n', 'utf-8')
}
