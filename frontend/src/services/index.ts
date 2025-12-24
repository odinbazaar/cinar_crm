// Export all services
export { default as apiClient } from './api';
export { default as authService } from './authService';
export { default as usersService } from './usersService';
export { default as clientsService } from './clientsService';
export { default as projectsService } from './projectsService';
export { default as proposalsService } from './proposalsService';
export { default as inventoryService } from './inventoryService';
export { default as bookingsService } from './bookingsService';
export { default as tasksService } from './tasksService';
export { default as financeService } from './financeService';

// Export types
export type { User, LoginCredentials, RegisterData, AuthResponse } from './authService';
export type { Client, CreateClientDto, UpdateClientDto } from './clientsService';
export type { Project, CreateProjectDto, UpdateProjectDto } from './projectsService';
export type { Proposal, ProposalItem, CreateProposalDto, UpdateProposalDto } from './proposalsService';
export type { InventoryItem, CreateInventoryItemDto, UpdateInventoryItemDto } from './inventoryService';
export type { Booking, CreateBookingDto, UpdateBookingDto } from './bookingsService';
export type { Task, CreateTaskDto, UpdateTaskDto } from './tasksService';
export type { CreateUserDto, UpdateUserDto } from './usersService';
