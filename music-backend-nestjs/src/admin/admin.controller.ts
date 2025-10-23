import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // User management routes
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(+id);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateUser(+id, body);
  }

  @Put('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() body: { role: 'user' | 'admin' }) {
    return this.adminService.updateUserRole(+id, body.role);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
  }

  // Song management routes
  @Post('songs')
  createSong(@Body() body: any) {
    return this.adminService.createSong(body);
  }

  @Get('songs')
  getAllSongs(@Query() query: any) {
    return this.adminService.getAllSongs(query);
  }

  @Get('songs/:id')
  getSongById(@Param('id') id: string) {
    return this.adminService.getSongById(+id);
  }

  @Put('songs/:id')
  updateSong(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateSong(+id, body);
  }

  @Delete('songs/:id')
  deleteSong(@Param('id') id: string) {
    return this.adminService.deleteSong(+id);
  }

  // Artist management routes
  @Post('artists')
  createArtist(@Body() body: any) {
    return this.adminService.createArtist(body);
  }

  @Get('artists')
  getAllArtists() {
    return this.adminService.getAllArtists();
  }

  @Get('artists/:id')
  getArtistById(@Param('id') id: string) {
    return this.adminService.getArtistById(+id);
  }

  @Put('artists/:id')
  updateArtist(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateArtist(+id, body);
  }

  @Delete('artists/:id')
  deleteArtist(@Param('id') id: string) {
    return this.adminService.deleteArtist(+id);
  }

  // Categories
  @Get('categories')
  getAllCategories() {
    return this.adminService.getAllCategories();
  }

  // Dashboard stats
  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // Statistics routes
  @Get('stats/revenue')
  getRevenueStats(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.adminService.getRevenueStats(startDate, endDate);
  }

  @Get('stats/monthly-revenue')
  getMonthlyRevenueStats() {
    return this.adminService.getMonthlyRevenueStats();
  }

  @Get('stats/vip-purchases')
  getVipPurchasesList(@Query('limit') limit: string, @Query('offset') offset: string) {
    return this.adminService.getVipPurchasesList(+limit || 10, +offset || 0);
  }

  @Get('stats/new-customers')
  getNewCustomers(@Query('days') days: string) {
    return this.adminService.getNewCustomers(+days || 30);
  }

  @Get('stats/top-packages')
  getTopVipPackages() {
    return this.adminService.getTopVipPackages();
  }

  @Get('stats/contribution-points')
  getContributionPointsStats() {
    return this.adminService.getContributionPointsStats();
  }

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.adminService.getProfile(req.user.userId);
  }

  // Comment management
  @Get('comments')
  getAllComments(@Query() query: any) {
    return this.adminService.getAllComments(query);
  }

  @Delete('comments/:id')
  deleteComment(@Param('id') id: string) {
    return this.adminService.deleteComment(+id);
  }

  @Put('comments/:id/status')
  updateCommentStatus(@Param('id') id: string, @Body() body: { status: 'pending' | 'approved' | 'rejected' }) {
    return this.adminService.updateCommentStatus(+id, body.status);
  }

  // VIP Package management
  @Get('vip-packages')
  getAllVipPackages() {
    return this.adminService.getAllVipPackages();
  }

  @Post('vip-packages')
  createVipPackage(@Body() vipPackageData: any) {
    return this.adminService.createVipPackage(vipPackageData);
  }

  @Put('vip-packages/:id')
  updateVipPackage(@Param('id') id: string, @Body() updates: any) {
    return this.adminService.updateVipPackage(+id, updates);
  }

  @Delete('vip-packages/:id')
  deleteVipPackage(@Param('id') id: string) {
    return this.adminService.deleteVipPackage(+id);
  }
}
