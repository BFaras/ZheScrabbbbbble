import { GameType } from '@app/constants/basic-constants';
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
import { ChatInfoDB } from '@app/interfaces/chat-info';
import { Question } from '@app/interfaces/question';
import * as fs from 'fs';
import { Collection, Db, MongoClient } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

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
        await this.fillScoreCollection(GameType.CLASSIC);
        await this.fillScoreCollection(GameType.LOG2990);
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
            await this.getCollection(type, GameType.CLASSIC).deleteMany({});
            await this.getCollection(type, GameType.LOG2990).deleteMany({});
        } else {
            await this.getCollection(type).deleteMany({});
        }
    }

    async isUsernameFree(usernameToCheck: string): Promise<boolean> {
        const usernameInDB = await this.getCollection(CollectionType.USERACCOUNTS)?.findOne({ username: usernameToCheck });
        return Promise.resolve(usernameInDB === undefined || usernameInDB === null);
    }

    // eslint-disable-next-line max-len, prettier/prettier
    async addUserAccount(username: string, encryptedPassword: string, email: string, userAvatar: string, securityQuestion: Question): Promise<boolean> {
        let isAccountCreated = true;
        const accountInfo: AccountInfo = {
            username,
            encryptedPassword,
            email,
            userAvatar,
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
        await this.getCollection(CollectionType.USERACCOUNTS)?.deleteOne({ username });
    }

    async changeUserPassword(username: string, encryptedPassword: string): Promise<boolean> {
        let isChangeSuccess = true;
        await this.getCollection(CollectionType.USERACCOUNTS)
            ?.updateOne({ username }, { $set: { encryptedPassword } })
            .catch(() => {
                isChangeSuccess = false;
            });
        return isChangeSuccess;
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
        return Promise.resolve(chatId);
    }

    async joinChatCanal(userId: string, chatId: string): Promise<boolean> {
        let wasUserAddedToChat = false;
        if (!(await this.isUserInChat(userId, chatId))) {
            wasUserAddedToChat = true;
            await this.getCollection(CollectionType.CHATCANALS)
                ?.updateOne({ _id: chatId }, { $push: { usersIds: userId } })
                .catch(() => {
                    wasUserAddedToChat = false;
                });
        }
        return wasUserAddedToChat;
    }

    async isUserInChat(userId: string, chatId: string): Promise<boolean> {
        const thisChatWithUserInIt = await this.getCollection(CollectionType.CHATCANALS)?.findOne({ _id: chatId, usersIds: userId });
        return Promise.resolve(!(thisChatWithUserInIt === undefined || thisChatWithUserInIt === null));
    }

    async addScore(score: Score, gameType: GameType): Promise<void> {
        await this.getCollection(CollectionType.SCORE, gameType)?.insertOne(score).catch();
    }

    async getTopScores(resultCount: number, gameType: GameType): Promise<TopScores> {
        const dbResults = await (this.getCollection(CollectionType.SCORE, gameType) as Collection<Score>)
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

    private getCollection<T>(collectionType: CollectionType, gameType?: GameType): Collection<T> {
        return this.database?.collection(collectionType + (gameType ? gameType : ''));
    }

    private async fillScoreCollection(gameType: GameType): Promise<void> {
        if ((await this.getCollection(CollectionType.SCORE, gameType)?.countDocuments()) === 0) {
            await this.insertDefaultScores(this.getCollection(CollectionType.SCORE, gameType));
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
