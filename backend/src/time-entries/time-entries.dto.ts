// Time Entries DTOs
export interface TimeEntry {
    id: string;
    user_id: string;
    project_id?: string;
    task_id?: string;
    description?: string;
    start_time: Date;
    end_time?: Date;
    duration?: number;
    is_billable: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateTimeEntryDto {
    user_id: string;
    project_id?: string;
    task_id?: string;
    description?: string;
    start_time: Date;
    end_time?: Date;
    is_billable?: boolean;
}

export interface UpdateTimeEntryDto {
    description?: string;
    end_time?: Date;
    is_billable?: boolean;
}
