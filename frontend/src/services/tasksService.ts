import apiClient from './api';

// Types
export interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    project_id: string;
    start_date?: string;
    due_date?: string;
    completed_date?: string;
    estimated_hours?: number;
    actual_hours: number;
    parent_task_id?: string;
    created_at: string;
    updated_at: string;
    project?: any;
    assignments?: any[];
    approvals?: any[];
}

export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    project_id: string;
    start_date?: string;
    due_date?: string;
    estimated_hours?: number;
    parent_task_id?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
    completed_date?: string;
    actual_hours?: number;
}

// Tasks Service
export const tasksService = {
    async getAll(): Promise<Task[]> {
        return apiClient.get<Task[]>('/tasks');
    },

    async getOne(id: string): Promise<Task> {
        return apiClient.get<Task>(`/tasks/${id}`);
    },

    async getByProject(projectId: string): Promise<Task[]> {
        return apiClient.get<Task[]>(`/tasks/project/${projectId}`);
    },

    async create(data: CreateTaskDto): Promise<Task> {
        return apiClient.post<Task>('/tasks', data);
    },

    async update(id: string, data: UpdateTaskDto): Promise<Task> {
        return apiClient.put<Task>(`/tasks/${id}`, data);
    },

    async assignUser(taskId: string, userId: string): Promise<void> {
        return apiClient.post<void>(`/tasks/${taskId}/assign/${userId}`, {});
    },

    async unassignUser(taskId: string, userId: string): Promise<void> {
        return apiClient.delete<void>(`/tasks/${taskId}/assign/${userId}`);
    },

    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/tasks/${id}`);
    },
};

export default tasksService;
