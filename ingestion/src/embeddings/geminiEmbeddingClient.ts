import { GoogleGenerativeAI } from '@google/generative-ai'
import { EMBEDDING_MODEL } from './config'

export function createGeminiClient(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })
  return {
    async embedBatch(texts: string[]): Promise<number[][]> {
      const result = await model.batchEmbedContents({
        requests: texts.map(text => ({
          content: { role: 'user', parts: [{ text }] },
        })),
      })
      return result.embeddings.map(e => e.values)
    },
  }
}
