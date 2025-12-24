import { Injectable } from '@nestjs/common';
import supabase from '../config/supabase.config';
import { Project, CreateProjectDto, UpdateProjectDto } from './projects.dto';

@Injectable()
export class ProjectsService {
    async findAll(): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        client:clients(id, name, company_name, email),
        project_manager:users!project_manager_id(id, first_name, last_name, email)
      `)
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as Project[];
    }

    async findOne(id: string): Promise<Project | null> {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        client:clients(id, name, company_name, email, phone),
        project_manager:users!project_manager_id(id, first_name, last_name, email)
      `)
            .eq('id', id)
            .single();

        if (error) return null;
        return data as Project;
    }

    async create(createProjectDto: CreateProjectDto): Promise<Project> {
        const { data, error } = await supabase
            .from('projects')
            .insert([
                {
                    ...createProjectDto,
                    actual_cost: 0,
                    is_archived: false,
                },
            ])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Project;
    }

    async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
        const { data, error } = await supabase
            .from('projects')
            .update(updateProjectDto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Project;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('projects').delete().eq('id', id);

        if (error) throw new Error(error.message);
    }

    async getByStatus(status: string): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*, client:clients(id, name)')
            .eq('status', status)
            .eq('is_archived', false);

        if (error) throw new Error(error.message);
        return data as Project[];
    }

    async getByClient(clientId: string): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('client_id', clientId)
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as Project[];
    }

    async archive(id: string): Promise<Project> {
        return this.update(id, { is_archived: true });
    }
}
