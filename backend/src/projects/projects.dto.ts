export interface Project {
    id: string;
    name: string;
    description?: string;
    category: string;
    status: string;
    client_id: string;
    project_manager_id?: string;
    budget: number;
    actual_cost: number;
    profit_margin?: number;
    start_date?: Date;
    end_date?: Date;
    deadline?: Date;
    is_archived: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateProjectDto {
    name: string;
    description?: string;
    category: string;
    status?: string;
    client_id: string;
    project_manager_id?: string;
    budget: number;
    profit_margin?: number;
    start_date?: Date;
    end_date?: Date;
    deadline?: Date;
}

export interface UpdateProjectDto {
    name?: string;
    description?: string;
    category?: string;
    status?: string;
    project_manager_id?: string;
    budget?: number;
    actual_cost?: number;
    profit_margin?: number;
    start_date?: Date;
    end_date?: Date;
    deadline?: Date;
    is_archived?: boolean;
}
