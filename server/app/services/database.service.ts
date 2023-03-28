/* eslint-disable no-underscore-dangle */
/* eslint-disable max-lines */
import { DATABASE_NAME, DATABASE_URL } from '@app/constants/database-environment';
import {
    AccountInfo,
    CollectionType,
    Dictionary,
    GameHistory,
    PlayerName,
    Score,
    TopScores,
    VirtualPlayerDifficulty
} from '@app/constants/database-interfaces';
import { DATABASE_UNAVAILABLE, NO_ERROR, USERNAME_TAKEN } from '@app/constants/error-code-constants';
import { ChatInfo, ChatInfoDB, ChatType } from '@app/interfaces/chat-info';
import { ChatMessageDB } from '@app/interfaces/chat-message';
import { FriendsDB } from '@app/interfaces/friend-info';
import { ProfileInfo, ProfileInfoDB, ProfileSettings } from '@app/interfaces/profile-info';
import { Question } from '@app/interfaces/question';
import * as fs from 'fs';
import { Collection, Db, Document, MongoClient, ObjectId } from 'mongodb';
import 'reflect-metadata';
import Container, { Service } from 'typedi';
import { ProfileService } from './profile.service';

const DEFAULT_DICTIONARY = 'Mon dictionnaire';

@Service()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;

    async start(url: string = DATABASE_URL): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(url);
            this.client = client;
            this.db = client.db(DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }
        await this.initialiseDB();
        return this.client;
    }

    async initialiseDB() {
        await this.fillScoreCollection();
        await this.insertDefaultDictionary();
        await this.insertDefaultPlayerNames();
    }

    async resetDB() {
        for (const type of Object.values(CollectionType)) {
            await this.resetCollection(type);
        }
        await this.initialiseDB();
    }

    async resetCollection(type: CollectionType) {
        if (type === CollectionType.SCORE) {
            await this.getCollection(type).deleteMany({});
            await this.getCollection(type).deleteMany({});
        } else {
            await this.getCollection(type).deleteMany({});
        }
    }

    async isUsernameFree(usernameToCheck: string): Promise<boolean> {
        const usernameInDB = await this.getCollection(CollectionType.USERACCOUNTS)?.findOne({ username: usernameToCheck });
        return Promise.resolve(usernameInDB === undefined || usernameInDB === null);
    }

    // eslint-disable-next-line max-len, prettier/prettier
    async addUserAccount(username: string, encryptedPassword: string, email: string, securityQuestion: Question): Promise<boolean> {
        let isAccountCreated = true;
        const accountInfo: AccountInfo = {
            username,
            encryptedPassword,
            email,
            securityQuestion,
        };
        await this.getCollection(CollectionType.USERACCOUNTS)
            ?.insertOne(accountInfo)
            .catch(() => {
                isAccountCreated = false;
            });
        return Promise.resolve(isAccountCreated);
    }

    async removeUserAccount(username: string) {
        const userId = await this.getUserId(username);
        await this.getCollection(CollectionType.USERACCOUNTS)?.deleteOne({ _id: new ObjectId(userId) });
        await this.getCollection(CollectionType.PROFILEINFO)?.deleteOne({ _id: new ObjectId(userId) });
    }

    async getUserId(username: string): Promise<string> {
        const userAccountInfoDoc = await (this.getCollection(CollectionType.USERACCOUNTS) as Collection<Document>)?.findOne({
            username,
        });
        let userId = '';

        if (userAccountInfoDoc !== undefined && userAccountInfoDoc !== null) {
            userId = userAccountInfoDoc._id.toString();
        }
        return userId;
    }

    async getUsernameFromId(userId: string): Promise<string> {
        const userAccountInfoDoc = await (this.getCollection(CollectionType.USERACCOUNTS) as Collection<AccountInfo>)?.findOne({
            _id: new ObjectId(userId),
        });
        let username = '';

        if (userAccountInfoDoc !== undefined && userAccountInfoDoc !== null) {
            username = userAccountInfoDoc.username;
        }
        return username;
    }

    async changeUserPassword(usernameUser: string, encryptedPasswordUser: string): Promise<boolean> {
        let isChangeSuccess = true;
        await this.getCollection(CollectionType.USERACCOUNTS)
            ?.updateOne({ username: usernameUser }, { $set: { encryptedPassword: encryptedPasswordUser } })
            .catch(() => {
                isChangeSuccess = false;
            });
        return isChangeSuccess;
    }

    async changeUsername(userId: string, newUsername: string): Promise<string> {
        let error = USERNAME_TAKEN;
        if (await this.isUsernameFree(newUsername)) {
            error = NO_ERROR;
            await this.getCollection(CollectionType.USERACCOUNTS)
                ?.updateOne({ _id: new ObjectId(userId) }, { $set: { username: newUsername } })
                .catch(() => {
                    error = DATABASE_UNAVAILABLE;
                });
        }
        return error;
    }

    async getUserEncryptedPassword(username: string): Promise<string> {
        const userAccountInfoDoc = await (this.getCollection(CollectionType.USERACCOUNTS) as Collection<AccountInfo>)?.findOne({
            username,
        });
        let encryptedPassword = '';

        if (userAccountInfoDoc !== undefined && userAccountInfoDoc !== null) {
            encryptedPassword = userAccountInfoDoc.encryptedPassword;
        }
        return encryptedPassword;
    }

    async addScore(score: Score): Promise<void> {
        await this.getCollection(CollectionType.SCORE)?.insertOne(score).catch();
    }

    async getUserSecurityQuestion(username: string): Promise<string> {
        const userAccountInfoDoc = await (this.getCollection(CollectionType.USERACCOUNTS) as Collection<AccountInfo>)?.findOne({
            username,
        });
        let securityQuestion = '';

        if (userAccountInfoDoc !== undefined && userAccountInfoDoc !== null) {
            securityQuestion = userAccountInfoDoc.securityQuestion.question;
        }
        return securityQuestion;
    }

    async getSecurityQuestionAsnwer(username: string): Promise<string> {
        const userAccountInfoDoc = await (this.getCollection(CollectionType.USERACCOUNTS) as Collection<AccountInfo>)?.findOne({
            username,
        });
        let securityQuestionAnswer = '';

        if (userAccountInfoDoc !== undefined && userAccountInfoDoc !== null) {
            securityQuestionAnswer = userAccountInfoDoc.securityQuestion.answer;
        }
        return securityQuestionAnswer;
    }

    async getUserProfileInfo(userId: string): Promise<ProfileInfo> {
        let profileInfo: ProfileInfo = Container.get(ProfileService).getDefaultProfileInformation();
        const userProfileInfoDoc = await (this.getCollection(CollectionType.PROFILEINFO) as Collection<ProfileInfoDB>)?.findOne({
            _id: new ObjectId(userId),
        });

        if (userProfileInfoDoc !== undefined && userProfileInfoDoc !== null) {
            profileInfo = userProfileInfoDoc.profileInfo;
        }
        return profileInfo;
    }

    async getUserAvatar(userId: string): Promise<string> {
        let userAvatar = '';
        const userProfileInfoDoc = await (this.getCollection(CollectionType.PROFILEINFO) as Collection<ProfileInfoDB>)?.findOne({
            _id: new ObjectId(userId),
        });

        if (userProfileInfoDoc !== undefined && userProfileInfoDoc !== null) {
            userAvatar = userProfileInfoDoc.profileInfo.avatar;
        }
        return userAvatar;
    }

    async getUserProfileSettings(userId: string): Promise<ProfileSettings> {
        let profileSettings: ProfileSettings = Container.get(ProfileService).getDefaultProfileSettings();
        const userProfileInfoDoc = await (this.getCollection(CollectionType.PROFILEINFO) as Collection<ProfileInfoDB>)?.findOne({
            _id: new ObjectId(userId),
        });

        console.log(userProfileInfoDoc);
        if (userProfileInfoDoc !== undefined && userProfileInfoDoc !== null) {
            profileSettings = userProfileInfoDoc.profileSettings;
        }
        return profileSettings;
    }

    async addNewProfile(userId: string, profileInfo: ProfileInfo, profileSettings: ProfileSettings): Promise<boolean> {
        const profileInfoDB: ProfileInfoDB = {
            _id: new ObjectId(userId),
            profileInfo,
            profileSettings,
        };
        let isCreationSuccess = true;
        await this.getCollection(CollectionType.PROFILEINFO)
            ?.insertOne(profileInfoDB)
            .catch(() => {
                isCreationSuccess = false;
            });
        return isCreationSuccess;
    }

    async changeUserProfileInfo(userId: string, profileInfo: ProfileInfo): Promise<string> {
        let errorCode = NO_ERROR;
        await this.getCollection(CollectionType.PROFILEINFO)
            ?.updateOne({ _id: new ObjectId(userId) }, { $set: { profileInfo } })
            .catch(() => {
                errorCode = DATABASE_UNAVAILABLE;
            });
        return errorCode;
    }

    async changeUserProfileSettings(userId: string, profileSettings: ProfileSettings): Promise<string> {
        let errorCode = NO_ERROR;
        await this.getCollection(CollectionType.PROFILEINFO)
            ?.updateOne({ _id: new ObjectId(userId) }, { $set: { profileSettings } })
            .catch(() => {
                errorCode = DATABASE_UNAVAILABLE;
            });
        return errorCode;
    }

    async addFriendDoc(userId: string): Promise<boolean> {
        const friendsInfo: FriendsDB = {
            _id: new ObjectId(userId),
            friendsId: [],
        };
        let isCreationSuccess = true;
        await this.getCollection(CollectionType.FRIENDS)
            ?.insertOne(friendsInfo)
            .catch(() => {
                isCreationSuccess = false;
            });
        return isCreationSuccess;
    }

    async addFriend(userId: string, friendUserId: string): Promise<string> {
        let errorCode: string = NO_ERROR;
        await (this.getCollection(CollectionType.FRIENDS) as Collection<FriendsDB>)
            ?.updateOne({ _id: new ObjectId(userId) }, { $push: { friendsId: friendUserId } })
            .catch(() => {
                errorCode = DATABASE_UNAVAILABLE;
            });

        return errorCode;
    }

    async removeFriend(userId: string, friendUserId: string): Promise<string> {
        let errorCode: string = NO_ERROR;
        await (this.getCollection(CollectionType.FRIENDS) as Collection<FriendsDB>)
            ?.updateOne({ _id: new ObjectId(userId) }, { $pull: { friendsId: friendUserId } })
            .catch(() => {
                errorCode = DATABASE_UNAVAILABLE;
            });

        return errorCode;
    }

    async getUserFriendList(userId: string): Promise<string[]> {
        let friendsList: string[] = [];
        const userFriendsDoc = await (this.getCollection(CollectionType.FRIENDS) as Collection<FriendsDB>)?.findOne({
            _id: new ObjectId(userId),
        });

        if (userFriendsDoc !== undefined && userFriendsDoc !== null) {
            friendsList = userFriendsDoc.friendsId;
        }
        return friendsList;
    }

    async getUserIdFromFriendCode(friendCode: string): Promise<string> {
        const profileWithCode = await ((await this.getCollection(CollectionType.PROFILEINFO)) as Collection<ProfileInfoDB>)?.findOne({
            'profileInfo.userCode': friendCode,
        });
        let friendId = '';

        if (profileWithCode !== undefined && profileWithCode !== null) {
            friendId = profileWithCode._id.toString();
        }
        return friendId;
    }

    async isFriendCodeTaken(friendCodeToCheck: string): Promise<boolean> {
        const userWithFriendCode = await ((await this.getCollection(CollectionType.PROFILEINFO)) as Collection<ProfileInfoDB>)?.findOne({
            'profileInfo.userCode': friendCodeToCheck,
        });
        return Promise.resolve(!(userWithFriendCode === undefined || userWithFriendCode === null));
    }

    async addNewChatCanal(chatInfo: ChatInfoDB): Promise<string> {
        let chatId = '';
        let creationSuccess = true;
        const chatDoc = await this.getCollection(CollectionType.CHATCANALS)
            ?.insertOne(chatInfo)
            .catch(() => {
                creationSuccess = false;
            });

        if (creationSuccess) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            chatId = chatDoc!.insertedId.toString();
        }
        return chatId;
    }

    async joinChatCanal(userId: string, chatId: string): Promise<boolean> {
        let wasUserAddedToChat = false;
        if (!(await this.isUserInChat(userId, chatId))) {
            wasUserAddedToChat = true;
            await this.getCollection(CollectionType.CHATCANALS)
                ?.updateOne({ _id: new ObjectId(chatId) }, { $push: { usersIds: userId } })
                .catch(() => {
                    wasUserAddedToChat = false;
                });
        }

        return wasUserAddedToChat;
    }

    async addMessageToHistory(chatId: string, chatMessage: ChatMessageDB): Promise<string> {
        let error = DATABASE_UNAVAILABLE;
        if (await this.isUserInChat(chatMessage.userId, chatId)) {
            error = NO_ERROR;
            await this.getCollection(CollectionType.CHATCANALS)
                ?.updateOne({ _id: new ObjectId(chatId) }, { $push: { chatHistory: chatMessage } })
                .catch(() => {
                    error = DATABASE_UNAVAILABLE;
                });
        }

        return error;
    }

    async leaveChatCanal(userId: string, chatId: string): Promise<boolean> {
        let wasUserRemovedFromChat = false;
        if (await this.isUserInChat(userId, chatId)) {
            wasUserRemovedFromChat = true;
            await this.getCollection(CollectionType.CHATCANALS)
                ?.updateOne({ _id: new ObjectId(chatId) }, { $pull: { usersIds: userId } })
                .catch(() => {
                    wasUserRemovedFromChat = false;
                });
        }

        if ((await this.getNumberOfUsersInChatCanal(chatId)) <= 0) {
            this.removeChatCanal(chatId);
        }

        return wasUserRemovedFromChat;
    }

    async getChatHistory(chatId: string): Promise<ChatMessageDB[]> {
        const chatDoc = await ((await this.getCollection(CollectionType.CHATCANALS)) as Collection<ChatInfoDB>)?.findOne({
            _id: new ObjectId(chatId),
        });
        let chatHistory: ChatMessageDB[] = [];

        if (chatDoc !== undefined && chatDoc !== null) {
            chatHistory = chatDoc.chatHistory;
        }
        return chatHistory;
    }

    async getChatCanalsUserCanJoin(userId: string): Promise<ChatInfo[]> {
        const chatCanlasUserCanJoin = (await this.getCollection(CollectionType.CHATCANALS)
            ?.find({ usersIds: { $ne: userId }, chatType: ChatType.PUBLIC }, { projection: { chatName: 1, chatType: 1 } })
            .toArray()) as unknown[];
        return this.transformMongoArrayToChatInfoArray(chatCanlasUserCanJoin);
    }

    async getChatsUserIsIn(userId: string): Promise<ChatInfo[]> {
        const chatCanalsUserIsIn = (await this.getCollection(CollectionType.CHATCANALS)
            ?.find({ usersIds: userId }, { projection: { chatName: 1, chatType: 1 } })
            .toArray()) as unknown[];
        return this.transformMongoArrayToChatInfoArray(chatCanalsUserIsIn);
    }

    async getNumberOfUsersInChatCanal(chatId: string): Promise<number> {
        const chatCanalDocResult = await this.getCollection(CollectionType.CHATCANALS)?.findOne(
            { _id: new ObjectId(chatId) },
            { projection: { _id: 0, usersIds: 1 } },
        );
        let numberOfUsers = 100;

        if (chatCanalDocResult !== undefined && chatCanalDocResult !== null) {
            numberOfUsers = (chatCanalDocResult as unknown as ChatInfoDB).usersIds.length;
        }
        return numberOfUsers;
    }

    async removeChatCanal(chatId: string): Promise<void> {
        await this.getCollection(CollectionType.CHATCANALS)?.deleteOne({ _id: new ObjectId(chatId) });
    }

    async isUserInChat(userId: string, chatId: string): Promise<boolean> {
        const thisChatWithUserInIt = await this.getCollection(CollectionType.CHATCANALS)?.findOne({ _id: new ObjectId(chatId), usersIds: userId });
        return Promise.resolve(!(thisChatWithUserInIt === undefined || thisChatWithUserInIt === null));
    }

    async isChatExistant(chatId: string): Promise<boolean> {
        const chatDoc = await this.getCollection(CollectionType.CHATCANALS)?.findOne({ _id: new ObjectId(chatId) });
        return Promise.resolve(!(chatDoc === undefined || chatDoc === null));
    }

    async isGlobalChatExistant(): Promise<boolean> {
        const globalChatDoc = await this.getCollection(CollectionType.CHATCANALS)?.findOne({ chatType: ChatType.GLOBAL });
        return Promise.resolve(!(globalChatDoc === undefined || globalChatDoc === null));
    }

    async getGlobalChatId(): Promise<string> {
        const globalChatDoc = await this.getCollection(CollectionType.CHATCANALS)?.findOne(
            { chatType: ChatType.GLOBAL },
            { projection: { chatType: 1, chatName: 1 } },
        );
        let chatId = '';

        if (globalChatDoc !== undefined && globalChatDoc !== null) {
            chatId = (globalChatDoc as unknown as ChatInfo)._id.toString();
        }
        return chatId;
    }

    async getFriendChatId(possibleChatName1: string, possibleChatName2: string): Promise<string> {
        const possibleChatDoc1 = await this.getCollection(CollectionType.CHATCANALS)?.findOne(
            { chatType: ChatType.PRIVATE, chatName: possibleChatName1 },
            { projection: { chatType: 1, chatName: 1 } },
        );
        const possibleChatDoc2 = await this.getCollection(CollectionType.CHATCANALS)?.findOne(
            { chatType: ChatType.PRIVATE, chatName: possibleChatName2 },
            { projection: { chatType: 1, chatName: 1 } },
        );
        let chatId = '';

        if (possibleChatDoc1 !== undefined && possibleChatDoc1 !== null) {
            chatId = (possibleChatDoc1 as unknown as ChatInfo)._id.toString();
        } else if (possibleChatDoc2 !== undefined && possibleChatDoc2 !== null) {
            chatId = (possibleChatDoc2 as unknown as ChatInfo)._id.toString();
        }

        return chatId;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformMongoArrayToChatInfoArray(mongoArray: any[]): ChatInfo[] {
        mongoArray.forEach((mongoInfo) => {
            mongoInfo._id = mongoInfo._id.toString();
        });
        return mongoArray as ChatInfo[];
    }

    async getTopScores(resultCount: number): Promise<TopScores> {
        const dbResults = await (this.getCollection(CollectionType.SCORE) as Collection<Score>)
            ?.find({}, { projection: { _id: 0 } })
            .sort({ score: -1 })
            .toArray();
        if (!dbResults || dbResults.length === 0) {
            return {};
        }

        const topResults: TopScores = {};
        let score = dbResults[0].score + 1;
        for (let i = 0; resultCount >= 0; i++) {
            if (!dbResults[i]) {
                return topResults;
            }
            if (dbResults[i].score < score) {
                resultCount--;
                if (resultCount < 0) {
                    break;
                }
                score = dbResults[i].score;
                topResults[score.toString()] = [];
            }
            topResults[score.toString()].push(dbResults[i].username);
        }
        return topResults;
    }

    async getDictionary(dictName: string = DEFAULT_DICTIONARY): Promise<Dictionary | null> {
        return await (this.getCollection(CollectionType.DICTIONARY) as Collection<Dictionary>)?.findOne(
            { title: dictName },
            { projection: { _id: 0 } },
        );
    }

    async deleteDictionary(dictName: string) {
        await this.getCollection(CollectionType.DICTIONARY)?.deleteOne({ title: dictName });
    }

    async getDictionaryList(): Promise<Dictionary[]> {
        return (
            await (this.getCollection(CollectionType.DICTIONARY) as Collection<Dictionary>).find(
                {},
                { projection: { _id: 0, title: 1, description: 1 } },
            )
        ).toArray();
    }

    async editDictionary(dictName: string, newDict: Dictionary): Promise<boolean> {
        if ((await this.getCollection(CollectionType.DICTIONARY).find({ title: newDict.title }).toArray()).length > 0 && dictName !== newDict.title)
            return false;
        await this.getCollection(CollectionType.DICTIONARY)?.updateOne(
            { title: dictName },
            { $set: { title: newDict.title, description: newDict.description } },
        );
        return true;
    }

    async addDictionary(dictionary: Dictionary): Promise<boolean> {
        if ((await this.getCollection(CollectionType.DICTIONARY).find({ title: dictionary.title }).toArray()).length > 0) return false;
        if (dictionary.words) await this.getCollection(CollectionType.DICTIONARY)?.insertOne(dictionary);
        return true;
    }

    async editPlayerName(oldName: string, newName: PlayerName): Promise<boolean> {
        if (
            (await (this.getCollection(CollectionType.NAMES) as Collection<PlayerName>).find({ name: newName.name }).toArray()).length > 0 &&
            oldName !== newName.name
        ) {
            return false;
        }
        await (this.getCollection(CollectionType.NAMES) as Collection<PlayerName>)?.updateOne(
            { name: oldName },
            { $set: { name: newName.name, difficulty: newName.difficulty } },
        );
        return true;
    }

    async getPlayerNameList(difficulty?: VirtualPlayerDifficulty): Promise<PlayerName[]> {
        if (!difficulty) return ((await this.getCollection(CollectionType.NAMES)) as Collection<PlayerName>).find({}).toArray();
        return await (this.getCollection(CollectionType.NAMES) as Collection<PlayerName>)?.find({ difficulty }, { projection: { _id: 0 } }).toArray();
    }

    async getGameHistoryList(): Promise<GameHistory[]> {
        return ((await this.getCollection(CollectionType.GAMES)) as Collection<GameHistory>)?.find({}, { projection: { _id: 0 } }).toArray();
    }

    async addPlayerName(virtualPlayerName: PlayerName): Promise<boolean> {
        virtualPlayerName.default = false;
        if ((await this.getCollection(CollectionType.NAMES).find({ name: virtualPlayerName.name }).toArray()).length > 0) return false;
        await this.getCollection(CollectionType.NAMES)?.insertOne(virtualPlayerName);
        return true;
    }

    async deletePlayerName(name: string) {
        await this.getCollection(CollectionType.NAMES)?.deleteOne({ name });
    }

    async addGameHistory(gameHistory: GameHistory) {
        await this.getCollection(CollectionType.GAMES)?.insertOne(gameHistory);
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    private getCollection<T extends Document>(collectionType: CollectionType): Collection<T> {
        return this.database?.collection(collectionType);
    }

    private async fillScoreCollection(): Promise<void> {
        if ((await this.getCollection(CollectionType.SCORE)?.countDocuments()) === 0) {
            await this.insertDefaultScores(this.getCollection(CollectionType.SCORE));
        }
    }

    private async insertDefaultScores(collection: Collection<Score>) {
        const defaultScores: Score[] = [
            {
                username: 'Joe',
                score: 25,
            },
            {
                username: 'Michel',
                score: 35,
            },
            {
                username: 'Eve',
                score: 50,
            },
            {
                username: 'Luigi',
                score: 10,
            },
            {
                username: 'Maria',
                score: 15,
            },
        ];
        await collection?.insertMany(defaultScores);
    }

    private async insertDefaultDictionary() {
        if ((await this.getCollection(CollectionType.DICTIONARY)?.countDocuments()) !== 0) return;
        const jsonDict = JSON.parse(fs.readFileSync('./assets/dictionnary.json', 'utf8')) as Dictionary;
        await this.getCollection(CollectionType.DICTIONARY).insertOne(jsonDict);
    }

    private async insertDefaultPlayerNames() {
        if ((await this.getCollection(CollectionType.NAMES)?.countDocuments()) !== 0) return;
        const defaultPlayerNames: PlayerName[] = [
            {
                name: 'Damien',
                difficulty: VirtualPlayerDifficulty.BEGINNER,
                default: true,
            },
            {
                name: 'Alex',
                difficulty: VirtualPlayerDifficulty.BEGINNER,
                default: true,
            },
            {
                name: 'Michel Gagnon',
                difficulty: VirtualPlayerDifficulty.BEGINNER,
                default: true,
            },
            {
                name: 'Joe',
                difficulty: VirtualPlayerDifficulty.EXPERT,
                default: true,
            },
            {
                name: 'Eve',
                difficulty: VirtualPlayerDifficulty.EXPERT,
                default: true,
            },
            {
                name: 'Rebecca',
                difficulty: VirtualPlayerDifficulty.EXPERT,
                default: true,
            },
        ];
        await this.getCollection(CollectionType.NAMES).insertMany(defaultPlayerNames);
    }

    get database(): Db {
        return this.db;
    }
}
