import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }) {
        return this.authService.login(loginDto.email, loginDto.password);
    }

    @Post('register')
    async register(@Body() registerDto: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: string;
    }) {
        return this.authService.register(registerDto);
    }

    @Get('me')
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user?.id);
    }
}
