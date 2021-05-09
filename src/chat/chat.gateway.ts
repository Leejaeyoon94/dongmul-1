import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ItemChatJoinDto } from './dto/itemChatJoin.dto';
import { ChatService } from './chat.service';
import { ItemChatDto } from './dto/itemChat.dto';
import { ShowUserDto } from './dto/showUser.dto';
import { JoinAutoDto } from './dto/joinAuto.dto';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway(3001, { namespace: '/chatting' })
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly chatService: ChatService) {}
	private logger: Logger = new Logger('ChatGateway');

	@WebSocketServer() server: Server;

	// front => socket.emit('sendMsg', data = { email: '채팅을 친 사용자', icrId: icrId, chatMsg: '안녕하세요!'})
	// 채팅 메시지 테이블에 저장하기
	// 이메일, 닉네임, 메시지, 채팅한 시간 정보가 담겨있음.
	@SubscribeMessage('sendMsg')
	async handleMessage(client: Socket, itemChatDto: ItemChatDto) {
		console.log(itemChatDto);
		const data = await this.chatService.saveChatMsg(itemChatDto);
		this.server.to(itemChatDto.icrId).emit('returnMsg', data);
	}

	// 이메일이 해당 방의 방장과 같다면, 단체 채팅방 및 1:1 채팅방 접속한 인원들을 보여줌.
	// window.onload
	// front => socket.emit('showUserList', data = { email: '현재 상세페이지에 들어온 사용자', icrId: icrId })
	@SubscribeMessage('showUserList')
	async handleShowUserRoom(client: Socket, showUserDto: ShowUserDto) {
		console.log(showUserDto);
		await this.chatService
			.showGroupUser(showUserDto)
			.then(async (groupUserData) => {
				if (groupUserData) {
					await this.chatService
						.showOneUser(showUserDto)
						.then((oneUserData) => {
							const data = {
								group: groupUserData,
								one: oneUserData
							};
							client.emit('returnUserList', data);
						});
				}
			});
	}

	// 채팅방 사용자 테이블에 해당 사용자가 이미 등록되어 있다면 자동으로 join
	// 채팅방 사용자 테이블에 해당 사용자가 등록되어 있지 않다면 자동으로 join 안함
	// 또한 나갔다 들어온 이후에는 이전의 채팅방 메시지가 보여야 하므로, 해당 사용자가 입력한 첫 메시지 이후의 모든 메시지를 가져옴!
	// 단체 채팅방 메시지, 1:1 메시지 모두 가져옴
	// 이걸 사용해서 채팅방 참가 버튼 유무를 정할 수 있음.
	@SubscribeMessage('joinAuto')
	async handleJoinAutoRoom(client: Socket, joinAutoDto: JoinAutoDto) {
		return await this.chatService
			.joinAuto(joinAutoDto)
			.then(async (joinAuto) => {
				const data = {
					chatGroup: 'N',
					chatOne: 'N',
					chatGroupList: null,
					chatOneList: null
				};
				if (joinAuto) {
					client.join(joinAutoDto.icrId);

					const chatGroupList = await this.chatService.showGroupChat(
						joinAutoDto
					);
					data.chatGroupList = chatGroupList;
					data.chatGroup = 'Y';
					if (joinAuto.chooseYn == 'N') {
						client.emit('returnJoinAuto', data);
					} else {
						const chatOneList = await this.chatService.showOneChat(
							joinAutoDto
						);
						data.chatOne = 'Y';
						data.chatOneList = chatOneList;
						client.emit('returnJoinAuto', data);
					}
				} else {
					client.emit('returnJoinAuto', data);
				}
			});
	}

	// '님이 입장하셨습니다.'
	// 채팅방 사용자 테이블에 해당 사용자 등록하기.
	// itemChatRoomUser 테이블에 존재하면 넣고, 아니라면 안넣음
	// button.click
	// front => socket.emit('joinRoom', data = { email: '사용자 email', icrId: icrId})
	@SubscribeMessage('joinRoom')
	async handleJoinRoom(client: Socket, itemChatJoinDto: ItemChatJoinDto) {
		console.log(itemChatJoinDto);
		await this.chatService.joinChatRoom(itemChatJoinDto);
		client.join(itemChatJoinDto.icrId);
		client.emit('returnJoinMsg', itemChatJoinDto.icrId);
	}

	// '님이 퇴장하셨습니다.'
	// front => socket.emit('leaveRoom', icrId)
	// @SubscribeMessage('leaveRoom')
	// handleLeaveRoom(client: Socket, room: string) {
	// 	client.leave(room);
	// 	client.emit('leaveRoom', room);
	// }

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	// handleConnection => 클라이언트의 연결 끊김을 확인
	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	// handleConnection => 클라이언트의 연결을 확인
	// handleConnection(client: Socket, ...args: any[]) {
	// 	this.logger.log(`Client connected: ${client.id}`);
	// }

	// 인증 하기
	// async 함수로 만들고 return으로 해주니까 front에서 on만으로도 결과값을 받을 수 있게 됨.
	@SubscribeMessage('authenticate')
	async handleAuthenticate(client: Socket, auth: string) {
		const [type, token] = auth['token'].split(' ');

		if (type != 'Bearer') {
			return { msg: 'fail', errorMsg: 'no login' };
		}

		try {
			const payload = jwt.verify(token, process.env.SECRET_KEY);
			if (payload) {
				return { msg: 'success' };
			} else {
				return { msg: 'fail', errorMsg: 'no login' };
			}
		} catch {
			return { msg: 'fail', errorMsg: 'no login' };
		}
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}
}
