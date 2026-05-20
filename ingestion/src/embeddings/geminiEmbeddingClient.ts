import { GoogleGenerativeAI } from '@google/generative-ai'
import { EMBEDDING_MODEL } from './config'

export function createGeminiClient(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })
  return {
    async embed(text: string): Promise<number[]> {
      const result = await model.embedContent(text)
      return result.embedding.values
    },
  }
}
