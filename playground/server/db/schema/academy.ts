import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const students = sqliteTable('students', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
});

export const courses = sqliteTable('courses', {
    id: integer('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
});

export const enrollments = sqliteTable('enrollments', {
    id: integer('id').primaryKey(),
    student_id: integer('student_id').notNull().references(() => students.id),
    course_id: integer('course_id').notNull().references(() => courses.id),
});
