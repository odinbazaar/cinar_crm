// Tasks DTOs
export interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    project_id: string;
    start_date?: Date;
    due_date?: Date;
    completed_date?: Date;
    estimated_hours?: number;
    actual_hours: number;
    parent_task_id?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    project_id: string;
    start_date?: Date;
    due_date?: Date;
    estimated_hours?: number;
    parent_task_id?: string;
}

export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    start_date?: Date;
    due_date?: Date;
    completed_date?: Date;
    estimated_hours?: number;
    actual_hours?: number;
}
