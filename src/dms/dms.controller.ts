import { Body, Controller, Delete, Get, NotImplementedException, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OneUsernameDTO } from 'src/user/dto/oneUsername.dto';
import { DmsService } from './dms.service';
import { CreateDmMessageDTO } from './dto/createDmMessage.dto';
import { CreateDmMessagePathDTO } from './dto/createDmMessage.path.dto';
import { DeleteDmPathDTO } from './dto/deleteDm.path.dto';
import { GetDmMessagesPathDTO } from './dto/getDmMessages.path.dto';
import { GetDmMessagesQueryDTO } from './dto/getDmMessages.query.dto';
import { JoinDmDTO } from './dto/joinDm.dto';
import { LeaveDmPathDTO } from './dto/leaveDm.path.dto';

@ApiTags('dms')
@Controller('dms')
export class DmsController
{
	constructor(private readonly dmsService: DmsService) {}


	@ApiTags('me')
	@UseGuards(JwtAuthGuard)
	@Get('/me')
	async getDms(@Request()req: any)
	{
		return this.dmsService.getDms(req.user.username)
	}

	@ApiTags('me')
	@UseGuards(JwtAuthGuard)
	@Post('/me')
	async joinDm(@Request()req: any, @Body()dto: JoinDmDTO)
	{
		return this.dmsService.joinDm(req.user.username, dto.DmId)
	}

	@ApiTags('me')
	@UseGuards(JwtAuthGuard)
	@Delete('/me/:DmId')
	async leaveDm(@Request()req: any, @Param()pathDTO: LeaveDmPathDTO)
	{
		return this.dmsService.leaveDm(req.user.username, pathDTO.DmId)
	}

	@UseGuards(JwtAuthGuard)
	@Post('/')
	async createDm(@Request()req: any, @Body()dto: OneUsernameDTO)
	{
		return this.dmsService.createDm(req.user.username, dto.username)
	}

	@UseGuards(JwtAuthGuard)
	@Delete('/:DmId')
	async deleteDm(@Request()req: any, @Param()pathDTO: DeleteDmPathDTO)
	{
		return this.dmsService.deleteDm(req.user.username, pathDTO.DmId)
	}

	@UseGuards(JwtAuthGuard)
	@Get('/:dmId/messages')
	async getDmMessages(@Request()req: any, @Param()pathDTO: GetDmMessagesPathDTO, @Query()queryDTO: GetDmMessagesQueryDTO)
	{
		return this.dmsService.getDmMessages(req.user.username, pathDTO.dmId, queryDTO.nMessages, queryDTO.start)
	}

	@UseGuards(JwtAuthGuard)
	@Post('/:dmId/messages')
	async createDmMessage(@Request()req: any, @Param()pathDTO: CreateDmMessagePathDTO, @Body()messageDTO: CreateDmMessageDTO)
	{
		return this.dmsService.createDmMessage(req.user.username, pathDTO.dmId, messageDTO.content, messageDTO.relatedId)
	}
}
