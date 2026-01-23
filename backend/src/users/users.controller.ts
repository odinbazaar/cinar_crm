import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll() {
        try {
            return await this.usersService.findAll();
        } catch (error) {
            console.error('Error in findAll users:', error);
            throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const user = await this.usersService.findOne(id);
            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }
            return user;
        } catch (error) {
            console.error(`Error in findOne user ${id}:`, error);
            throw new HttpException(error.message || 'Internal server error', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('role/:role')
    async getUsersByRole(@Param('role') role: string) {
        try {
            return await this.usersService.getUsersByRole(role);
        } catch (error) {
            console.error(`Error in getUsersByRole ${role}:`, error);
            throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        try {
            return await this.usersService.create(createUserDto);
        } catch (error) {
            console.error('Error in create user:', error);
            // Check for duplicate key error (Supabase/Postgres specific code often 23505)
            if (error.message && error.message.includes('duplicate key')) {
                throw new HttpException('User with this email already exists', HttpStatus.CONFLICT);
            }
            throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        try {
            return await this.usersService.update(id, updateUserDto);
        } catch (error) {
            console.error(`Error in update user ${id}:`, error);
            throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        try {
            return await this.usersService.delete(id);
        } catch (error) {
            console.error(`Error in delete user ${id}:`, error);
            throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
