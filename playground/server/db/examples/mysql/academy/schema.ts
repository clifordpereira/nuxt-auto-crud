import { mysqlTable, int, varchar, text } from 'drizzle-orm/mysql-core'

export const students = mysqlTable('students', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
})

export const courses = mysqlTable('courses', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(), // text is perfect here for longer strings
})

export const enrollments = mysqlTable('enrollments', {
  id: int('id').primaryKey().autoincrement(),
  student_id: int('student_id').notNull().references(() => students.id),
  course_id: int('course_id').notNull().references(() => courses.id),
})
