// Type definitions for the application

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETE' | 'ON_HOLD';
  repoLink?: string;
  tasks: Task[];
  _count?: {
    tasks: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// API Response types
export interface ApiError {
  error: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Form input types
export interface ProjectFormData {
  title: string;
  description: string;
  status: Project['status'];
  repoLink: string;
}

export interface TaskFormData {
  title: string;
  priority: Task['priority'];
}

export interface TaskUpdateData {
  title?: string;
  priority?: Task['priority'];
  completed?: boolean;
}
