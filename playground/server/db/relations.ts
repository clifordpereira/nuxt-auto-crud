import { defineRelations, type DBQueryConfig } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  students: {
    courses: r.many.courses({
      from: r.students.id.through(r.enrollments.student_id),
      to: r.courses.id.through(r.enrollments.course_id),
    }),
    enrollments: r.many.enrollments(),
  },
  courses: {
    students: r.many.students({
      from: r.courses.id.through(r.enrollments.course_id),
      to: r.students.id.through(r.enrollments.student_id),
    }),
    enrollments: r.many.enrollments(),
  },
  enrollments: {
    student: r.one.students({ from: r.enrollments.student_id, to: r.students.id }),
    course: r.one.courses({ from: r.enrollments.course_id, to: r.courses.id }),
  },
}));

export const tableQueryConfig: Record<string, DBQueryConfig> = {
  enrollments: {
    columns: {
      student_id: false,
      course_id: false,
    },
    with: {
      student: { columns: { name: true } },
      course: { columns: { title: true } },
    },
    orderBy: { id: "asc" },
  },
  students: {
    orderBy: { id: "asc" },
  }
};