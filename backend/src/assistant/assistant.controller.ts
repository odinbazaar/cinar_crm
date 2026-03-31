import { Controller, Post, Body } from '@nestjs/common';
import { AssistantService } from './assistant.service';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatRequestDto {
    messages: ChatMessage[];
}

@Controller('assistant')
export class AssistantController {
    constructor(private readonly assistantService: AssistantService) { }

    @Post('chat')
    async chat(@Body() body: ChatRequestDto) {
        const reply = await this.assistantService.chat(body.messages);
        return { reply };
    }
}
