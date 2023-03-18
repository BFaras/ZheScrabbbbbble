import { CollectionType, Dictionary, GameHistory, PlayerName, Score, VirtualPlayerDifficulty } from '@app/constants/database-interfaces';
import * as io from 'socket.io';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class SocketDatabaseService {
    private databaseService: DatabaseService;

    constructor() {
        this.databaseService = Container.get(DatabaseService);
    }

    databaseSocketRequests(socket: io.Socket) {
        socket.on('requestTopScores', (numberOfResults: number) => {
            this.sendTopScores(numberOfResults, socket);
        });
        socket.on('getDictionaryList', async () => {
            socket.emit('dictionaryList', await this.databaseService.getDictionaryList());
        });
        socket.on('deleteDictionary', async (name: string) => {
            await this.databaseService.deleteDictionary(name);
            socket.emit('dictionaryList', await this.databaseService.getDictionaryList());
        });
        socket.on('editDictionary', async (name: string, newDict: Dictionary) => {
            if (await this.databaseService.editDictionary(name, newDict))
                socket.emit('dictionaryList', await this.databaseService.getDictionaryList());
            else socket.emit('adminError', 'Impossible de modifier le dictionnaire. Un dictionnaire avec ce nom existe déjà');
        });
        socket.on('getVirtualPlayerNames', async (difficulty?: VirtualPlayerDifficulty) => {
            socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList(difficulty));
        });
        socket.on('editVirtualPlayerNames', async (name: string, newName: PlayerName) => {
            if (await this.databaseService.editPlayerName(name, newName))
                socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList());
            else socket.emit('adminError', 'Impossible de modifier le joueur virtuel. Un joueur virtuel avec ce nom existe déjà');
        });
        socket.on('addVirtualPlayerNames', async (name: PlayerName) => {
            if (await this.databaseService.addPlayerName(name)) socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList());
            else socket.emit('adminError', "Impossible d'ajouter le joueur virtuel. Un joueur virtuel avec ce nom existe déjà");
        });
        socket.on('deleteVirtualPlayerNames', async (name: string) => {
            await this.databaseService.deletePlayerName(name);
            socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList());
        });
        socket.on('getGameHistoryList', async () => {
            socket.emit('historyList', await this.databaseService.getGameHistoryList());
        });
        socket.on('resetDatabase', async () => {
            await this.databaseService.resetDB();
            socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList());
            socket.emit('dictionaryList', await this.databaseService.getDictionaryList());
            socket.emit('historyList', await this.databaseService.getGameHistoryList());
        });

        socket.on('resetCollection', async (type: CollectionType) => {
            await this.databaseService.resetCollection(type);
            await this.databaseService.initialiseDB();
            socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList());
            socket.emit('dictionaryList', await this.databaseService.getDictionaryList());
            socket.emit('historyList', await this.databaseService.getGameHistoryList());
        });
    }

    sendScoreToDatabase(yourScore: Score, opponentScore: Score, disconnect: boolean, isSolo: boolean) {
        if (!disconnect) this.databaseService.addScore(yourScore);
        if (!isSolo) this.databaseService.addScore(opponentScore);
    }

    sendGameHistoryToDatabase(gameHistory: GameHistory) {
        this.databaseService.addGameHistory(gameHistory);
    }

    async sendTopScores(numberOfResults: number, socket: io.Socket) {
        let topScores = {};
        topScores = await this.databaseService.getTopScores(numberOfResults).catch();
        socket.emit('topScores', topScores);
    }

    async getDictionary(name?: string): Promise<Dictionary> {
        let dict;
        if (name) dict = await this.databaseService.getDictionary(name);
        if (dict) return dict;
        return (await this.databaseService.getDictionary()) as Dictionary;
    }
}
