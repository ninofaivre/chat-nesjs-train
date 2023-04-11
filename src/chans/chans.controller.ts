import { BadRequestException, Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post, Query, Req, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { plainToClass, plainToInstance, Transform, Type } from 'class-transformer';
import { validate } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChansService } from './chans.service';
import { CreateChanDTO } from './dto/createChan.dto';
import { CreateChanMessageDTO } from './dto/createChanMessage.dto';
import { CreateChanMessagePathDTO } from './dto/createChanMessage.path.dto';
import { DeleteChanPathDTO } from './dto/deleteChan.path.dto';
import { DeleteChanMessagePathDTO } from './dto/deleteChanMessage.path.dto';
import { GetChanMessagesPathDTO } from './dto/getChanMessages.path.dto';
import { GetChanMessagesQueryDTO } from './dto/getChanMessages.query.dto';
import { JoinChanByIdDTO, JoinChanByInvitationDTO } from './dto/joinChan.dto';
import { KickUserFromChanPathDTO } from './dto/kickUserFromChan.path.dto';
import { SearchChansQueryDTO } from './dto/searchChans.query.dto';

@ApiTags('chans')
@Controller('chans')
export class ChansController
{

	constructor(private readonly chansService: ChansService) {}

	@UseGuards(JwtAuthGuard)
	@Get('/')
	async searchChans(@Request()req: any, @Query()queryDTO: SearchChansQueryDTO)
	{
		return this.chansService.searchChans(queryDTO.titleContains, queryDTO.nResult)
	}

	@ApiTags('me')
	@UseGuards(JwtAuthGuard)
	@Get('/me')
	async getUserChans(@Request()req: any)
	{
		return this.chansService.getUserChans(req.user.username)
	}

	@ApiTags('me')
	@UseGuards(JwtAuthGuard)
	@Delete('/me/:id')
	async leaveChan(@Request()req: any, @Param()dto: DeleteChanPathDTO)
	{
		return this.chansService.leaveChan(req.user.username, dto.id)
	}

	@ApiTags('me')
	@UseGuards(JwtAuthGuard)
	@Post('/me/JoinByInvitation')
	async joinChanByInvitation(@Req()req: any, @Body()dto: JoinChanByInvitationDTO)
	{
		return this.chansService.joinChanByInvitation(req.user.username, dto.chanInvitationId)
	}

	@ApiTags('me')
	@UseGuards(JwtAuthGuard)
	@Post('/me/JoinById')
	async joinChanById(@Req()req: any, @Body()dto: JoinChanByIdDTO)
	{
		return this.chansService.joinChanByid(req.user.username, dto.chanId, dto.password)
	}

	@UseGuards(JwtAuthGuard)
	@Post('/')
	@ApiBody({
		type: CreateChanDTO,
		examples: // TODO find a cleaner way to retrieve CreatePublicChanDTO and CreatePrivateChanDTO examples (mb with $ref)
		{
			PUBLIC:
			{
				value:
				{
					chan:
					{
						type: "PUBLIC",
						title: "MySuperPublicChanTitle",
						password: "MySuperPassword",
					} 
				}
			},
			PRIVATE:
			{
				value:
				{
					chan:
					{
						type: "PRIVATE",
						title: "MySuperPrivateChanTitle",
					} 
				}
			}
		}
	})
	async createChan(@Request()req: any, @Body()dto: CreateChanDTO)
	{
		return this.chansService.createChan(req.user.username, dto.chan)
	}

	@UseGuards(JwtAuthGuard)
	@Patch('/:chanId')
	async updateChan(@Request()req: any)
	{ 
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async deleteChan(@Request()req: any, @Param()pathDTO: DeleteChanPathDTO)
	{
		return this.chansService.deleteChan(req.user.username, pathDTO.id)
	}

	@UseGuards(JwtAuthGuard)
	@Post(':chanId/messages')
	async createChanMessage(@Request()req: any, @Param()pathDTO: CreateChanMessagePathDTO, @Body()dto: CreateChanMessageDTO)
	{
		return this.chansService.createChanMessageIfRightTo(req.user.username, pathDTO.chanId, dto)
	}

	@UseGuards(JwtAuthGuard)
	@Get(':chanId/messages')
	async getChanMessages(@Request()req: any, @Param()pathDTO: GetChanMessagesPathDTO, @Query()queryDTO: GetChanMessagesQueryDTO)
	{
		return this.chansService.getChanMessages(req.user.username, pathDTO.chanId, queryDTO.nMessages, queryDTO.start)
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':chanId/messages/:msgId')
	async deleteChanMessage(@Request()req: any, @Param()pathDTO: DeleteChanMessagePathDTO)
	{
		return this.chansService.deleteChanMessage(req.user.username, pathDTO.chanId, pathDTO.msgId)
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':chanId/users/:username')
	async kickUserFromChan(@Request()req: any, @Param()pathDTO: KickUserFromChanPathDTO)
	{
		return this.chansService.kickUserFromChan(req.user.username, pathDTO.username, pathDTO.chanId) 
	}
}
