import { Injectable } from '@nestjs/common';
import supabase from '../config/supabase.config';
import { TimeEntry, CreateTimeEntryDto, UpdateTimeEntryDto } from './time-entries.dto';

@Injectable()
export class TimeEntriesService {
    async findAll(): Promise<TimeEntry[]> {
        const { data, error } = await supabase
            .from('time_entries')
            .select(`
        *,
        user:users(id, first_name, last_name, email),
        project:projects(id, name),
        task:tasks(id, title)
      `)
            .order('start_time', { ascending: false });

        if (error) throw new Error(error.message);
        return data as TimeEntry[];
    }

    async findOne(id: string): Promise<TimeEntry | null> {
        const { data, error } = await supabase
            .from('time_entries')
            .select(`
        *,
        user:users(id, first_name, last_name, email, hourly_rate),
        project:projects(id, name, client:clients(id, name)),
        task:tasks(id, title)
      `)
            .eq('id', id)
            .single();

        if (error) return null;
        return data as TimeEntry;
    }

    async create(createTimeEntryDto: CreateTimeEntryDto): Promise<TimeEntry> {
        let duration: number | null = null;
        if (createTimeEntryDto.end_time) {
            const start = new Date(createTimeEntryDto.start_time).getTime();
            const end = new Date(createTimeEntryDto.end_time).getTime();
            duration = Math.floor((end - start) / 1000); // Duration in seconds
        }

        const { data, error } = await supabase
            .from('time_entries')
            .insert([
                {
                    ...createTimeEntryDto,
                    duration,
                    is_billable: createTimeEntryDto.is_billable ?? true,
                },
            ])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as TimeEntry;
    }

    async update(id: string, updateTimeEntryDto: UpdateTimeEntryDto): Promise<TimeEntry> {
        const updateData: any = { ...updateTimeEntryDto };

        // Recalculate duration if end_time is updated
        if (updateTimeEntryDto.end_time) {
            const entry = await this.findOne(id);
            if (entry) {
                const start = new Date(entry.start_time).getTime();
                const end = new Date(updateTimeEntryDto.end_time).getTime();
                updateData.duration = Math.floor((end - start) / 1000);
            }
        }

        const { data, error } = await supabase
            .from('time_entries')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as TimeEntry;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('time_entries').delete().eq('id', id);
        if (error) throw new Error(error.message);
    }

    async getByUser(userId: string): Promise<TimeEntry[]> {
        const { data, error } = await supabase
            .from('time_entries')
            .select('*, project:projects(id, name), task:tasks(id, title)')
            .eq('user_id', userId)
            .order('start_time', { ascending: false });

        if (error) throw new Error(error.message);
        return data as TimeEntry[];
    }

    async getByProject(projectId: string): Promise<TimeEntry[]> {
        const { data, error } = await supabase
            .from('time_entries')
            .select('*, user:users(id, first_name, last_name), task:tasks(id, title)')
            .eq('project_id', projectId)
            .order('start_time', { ascending: false });

        if (error) throw new Error(error.message);
        return data as TimeEntry[];
    }

    async stopTimer(id: string): Promise<TimeEntry> {
        return this.update(id, { end_time: new Date() });
    }
}
