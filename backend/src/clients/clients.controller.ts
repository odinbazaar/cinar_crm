import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './clients.dto';

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Get()
    async findAll() {
        return this.clientsService.findAll();
    }

    @Get('active')
    async getActiveClients() {
        return this.clientsService.getActiveClients();
    }

    @Get('stage/:stage')
    async getByLeadStage(@Param('stage') stage: string) {
        return this.clientsService.getByLeadStage(stage);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.clientsService.findOne(id);
    }

    @Post()
    async create(@Body() createClientDto: CreateClientDto) {
        return this.clientsService.create(createClientDto);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateClientDto: UpdateClientDto,
    ) {
        return this.clientsService.update(id, updateClientDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.clientsService.delete(id);
    }
}
