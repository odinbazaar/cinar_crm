import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get()
    async findAll() {
        return this.projectsService.findAll();
    }

    @Get('status/:status')
    async getByStatus(@Param('status') status: string) {
        return this.projectsService.getByStatus(status);
    }

    @Get('client/:clientId')
    async getByClient(@Param('clientId') clientId: string) {
        return this.projectsService.getByClient(clientId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @Post()
    async create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
    ) {
        return this.projectsService.update(id, updateProjectDto);
    }

    @Put(':id/archive')
    async archive(@Param('id') id: string) {
        return this.projectsService.archive(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.projectsService.delete(id);
    }
}
