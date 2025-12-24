import { Injectable } from '@nestjs/common';
import supabase from '../config/supabase.config';
import { Task, CreateTaskDto, UpdateTaskDto } from './tasks.dto';

@Injectable()
export class TasksService {
    async findAll(): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
        *,
        project:projects(id, name, status),
        assignments:task_assignments(user:users(id, first_name, last_name))
      `)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as Task[];
    }

    async findOne(id: string): Promise<Task | null> {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
        *,
        project:projects(id, name, status, client:clients(id, name)),
        assignments:task_assignments(user:users(id, first_name, last_name, email)),
        approvals:task_approvals(*)
      `)
            .eq('id', id)
            .single();

        if (error) return null;
        return data as Task;
    }

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    ...createTaskDto,
                    status: createTaskDto.status || 'TODO',
                    priority: createTaskDto.priority || 'MEDIUM',
                    actual_hours: 0,
                },
            ])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Task;
    }

    async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const { data, error } = await supabase
            .from('tasks')
            .update(updateTaskDto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Task;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw new Error(error.message);
    }

    async getByProject(projectId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*, assignments:task_assignments(user:users(id, first_name, last_name))')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as Task[];
    }

    async assignUser(taskId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('task_assignments')
            .insert([{ task_id: taskId, user_id: userId }]);

        if (error) throw new Error(error.message);
    }

    async unassignUser(taskId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('task_assignments')
            .delete()
            .eq('task_id', taskId)
            .eq('user_id', userId);

        if (error) throw new Error(error.message);
    }
}
