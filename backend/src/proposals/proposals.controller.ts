import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto, UpdateProposalDto } from './proposals.dto';

@Controller('proposals')
export class ProposalsController {
    constructor(private readonly proposalsService: ProposalsService) { }

    @Get()
    async findAll() {
        return this.proposalsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.proposalsService.findOne(id);
    }

    @Post()
    async create(@Body() createProposalDto: CreateProposalDto) {
        return this.proposalsService.create(createProposalDto);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateProposalDto: UpdateProposalDto,
    ) {
        return this.proposalsService.update(id, updateProposalDto);
    }

    @Put(':id/status/:status')
    async updateStatus(
        @Param('id') id: string,
        @Param('status') status: string,
    ) {
        return this.proposalsService.updateStatus(id, status);
    }

    @Post(':id/send-email')
    async sendEmail(
        @Param('id') id: string,
        @Body() body: { recipientEmail?: string; message?: string; senderEmail?: string },
    ) {
        try {
            console.log(`📧 E-posta gönderme isteği: ID=${id}, TO=${body.recipientEmail}, FROM=${body.senderEmail}`);
            const result = await this.proposalsService.sendProposalEmail(id, body.recipientEmail, body.message, body.senderEmail);
            console.log(`✅ E-posta gönderildi:`, result);
            return result;
        } catch (error) {
            console.error(`❌ E-posta gönderme hatası:`, error);
            return {
                success: false,
                message: error.message || 'Bilinmeyen bir hata oluştu'
            };
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.proposalsService.delete(id);
    }
}
