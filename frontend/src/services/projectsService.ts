import apiClient from './api';

// Types
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
    start_date?: string;
    end_date?: string;
    deadline?: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    client?: any;
    project_manager?: any;
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
    start_date?: string;
    end_date?: string;
    deadline?: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
    actual_cost?: number;
    is_archived?: boolean;
}

// Projects Service
export const projectsService = {
    async getAll(): Promise<Project[]> {
        return apiClient.get<Project[]>('/projects');
    },

    async getOne(id: string): Promise<Project> {
        return apiClient.get<Project>(`/projects/${id}`);
    },

    async getByStatus(status: string): Promise<Project[]> {
        return apiClient.get<Project[]>(`/projects/status/${status}`);
    },

    async getByClient(clientId: string): Promise<Project[]> {
        return apiClient.get<Project[]>(`/projects/client/${clientId}`);
    },

    async create(data: CreateProjectDto): Promise<Project> {
        return apiClient.post<Project>('/projects', data);
    },

    async update(id: string, data: UpdateProjectDto): Promise<Project> {
        return apiClient.put<Project>(`/projects/${id}`, data);
    },

    async archive(id: string): Promise<Project> {
        return apiClient.put<Project>(`/projects/${id}/archive`, {});
    },

    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/projects/${id}`);
    },
};

export default projectsService;
