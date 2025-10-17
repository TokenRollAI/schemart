import { z } from 'zod'

export const helloInputSchema = {
  sayHello: z.object({
    name: z.string().min(1, 'Name is required'),
  }),

  getCount: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
}

export type SayHelloInput = z.infer<typeof helloInputSchema.sayHello>
export type GetCountInput = z.infer<typeof helloInputSchema.getCount>
