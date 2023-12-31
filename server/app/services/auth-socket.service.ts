/* eslint-disable no-underscore-dangle */
import { DATABASE_UNAVAILABLE, INVALID_DATA_SENT, NO_ERROR, WRONG_SECURITY_ANSWER } from '@app/constants/error-code-constants';
import { ChatInfo } from '@app/interfaces/chat-info';
import { Question } from '@app/interfaces/question';
import * as io from 'socket.io';
import Container, { Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { AuthentificationService } from './authentification.service';
import { ChatService } from './chat.service';
import { FriendService } from './friend.service';
import { UsersStatusService } from './users-status.service';

@Service()
export class AuthSocketService {
    private readonly authentificationService: AuthentificationService;
    private readonly accountInfoService: AccountInfoService;
    private readonly chatService: ChatService;
    private readonly usersStatusService: UsersStatusService;
    private readonly friendService: FriendService;

    constructor() {
        this.authentificationService = Container.get(AuthentificationService);
        this.accountInfoService = Container.get(AccountInfoService);
        this.chatService = Container.get(ChatService);
        this.usersStatusService = Container.get(UsersStatusService);
        this.friendService = Container.get(FriendService);
    }
    handleAuthSockets(socket: io.Socket) {
        socket.on('User authentification', async (username: string, password: string) => {
            if (username && password) {
                const isAuthentificationSuccess = await this.authentificationService.authentifyUser(username, password);
                if (isAuthentificationSuccess) {
                    await this.setupUser(socket, username);
                    console.log(new Date().toLocaleTimeString() + ' | Login successfull');
                }
                socket.emit('Authentification status', isAuthentificationSuccess);
            } else {
                socket.emit('Authentification status', false);
            }
        });

        socket.on(
            'Create user account',
            async (username: string, password: string, email: string, userAvatar: string, securityQuestion: Question) => {
                if (username && password && email && userAvatar && securityQuestion) {
                    const accountCreationStatus: string = await this.authentificationService.createAccount(
                        username,
                        password,
                        email,
                        userAvatar,
                        securityQuestion,
                    );
                    if (accountCreationStatus === NO_ERROR) {
                        await this.setupUser(socket, username);
                        console.log(new Date().toLocaleTimeString() + ' | Register successfull');
                    }
                    socket.emit('Creation result', accountCreationStatus);
                } else {
                    socket.emit('Creation result', INVALID_DATA_SENT);
                }
            },
        );

        socket.on('Reset User Password', async (username: string) => {
            if (username) {
                socket.data.usernameResettingPassword = username;
                socket.emit('User Account Question', await this.authentificationService.getUserSecurityQuestion(username));
            } else {
                socket.emit('User Account Question', INVALID_DATA_SENT);
            }
        });

        socket.on('Account Question Answer', async (username: string, answerToQuestion: string, newPassword: string) => {
            if (username && answerToQuestion && newPassword) {
                const usernameForReset = username;
                let errorCode = WRONG_SECURITY_ANSWER;
                if (await this.authentificationService.isSecurityQuestionAnswerRight(usernameForReset, answerToQuestion)) {
                    errorCode = DATABASE_UNAVAILABLE;

                    if (await this.authentificationService.changeUserPassword(usernameForReset, newPassword)) {
                        errorCode = NO_ERROR;
                        socket.data.usernameResettingPassword = null;
                    }
                }
                socket.emit('Password Reset response', errorCode);
            } else {
                socket.emit('Password Reset response', INVALID_DATA_SENT);
            }
        });
    }

    async setupUser(socket: io.Socket, username: string, isSecondarySocket: boolean = false) {
        const userId = await this.authentificationService.getUserId(username);
        this.accountInfoService.setUsername(socket, username);
        this.accountInfoService.setUserId(socket, userId);
        socket.data.secondary = isSecondarySocket;
        await this.joinUserChatRooms(userId, socket);
        await this.joinUserFriendsRooms(userId, socket);
        await this.chatService.joinGlobalChat(userId);
        if (!isSecondarySocket) this.usersStatusService.addOnlineUser(userId, socket);
    }

    private async joinUserChatRooms(userId: string, socket: io.Socket) {
        const userChats: ChatInfo[] = await this.chatService.getUserChats(userId);
        userChats.forEach((userChatInfo: ChatInfo) => {
            socket.join(this.chatService.getChatRoomName(userChatInfo._id));
        });
    }

    private async joinUserFriendsRooms(userId: string, socket: io.Socket) {
        const userFriends: string[] = await this.friendService.getFriendsIds(userId);

        userFriends.forEach((friendId: string) => {
            socket.join(this.friendService.getFriendRoomName(friendId));
        });
    }
}
