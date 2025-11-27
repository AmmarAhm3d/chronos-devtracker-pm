import { z } from 'zod';

// Project status enum
export const ProjectStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETE', 'ON_HOLD']);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

// Task priority enum
export const TaskPrioritySchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

// Project validation schema
export const ProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  status: ProjectStatusSchema.default('TODO'),
  repoLink: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;

// Create project schema (same as base schema)
export const CreateProjectSchema = ProjectSchema;

// Update project schema (all fields optional)
export const UpdateProjectSchema = ProjectSchema.partial();

// Task validation schema
export const TaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be less than 200 characters')
    .trim(),
  priority: TaskPrioritySchema.default('MEDIUM'),
  completed: z.boolean().default(false),
});

export type TaskInput = z.infer<typeof TaskSchema>;

// Create task schema
export const CreateTaskSchema = TaskSchema.pick({ title: true, priority: true });

// Update task schema (all fields optional)
export const UpdateTaskSchema = TaskSchema.partial();

// Auth validation schemas
export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;

// Helper function to get first error message from Zod error
export function getZodFirstError(error: z.ZodError): string {
  return error.errors[0]?.message || 'Validation error';
}

// Helper to validate and get errors as a record
export function validateWithErrors<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
}
