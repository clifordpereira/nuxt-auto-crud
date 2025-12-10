import { eq, desc } from 'drizzle-orm'
import { testimonials } from '../database/schema'
import { useDrizzle } from '../utils/drizzle'

export default defineEventHandler(async () => {
  const db = useDrizzle()

  const activeTestimonials = await db.select()
    .from(testimonials)
    .where(eq(testimonials.status, 'active'))
    .orderBy(desc(testimonials.createdAt))
    .limit(9)
    .all()

  return activeTestimonials
})
