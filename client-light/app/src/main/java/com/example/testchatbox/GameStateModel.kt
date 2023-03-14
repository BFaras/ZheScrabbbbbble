package com.example.testchatbox

import SocketHandler
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

data class GameState (
    var board: Array<Array<String>>,
    var players: ArrayList<PlayersState>,
    var playerTurnIndex: Int,
    var reserveLength: Int,
    var gameOver: Boolean
)
    //val board: String[][];

data class Timer (
    var minute: Int,
    var second: Int
)

data class PlayersState (
    var username: String,
    var hand: ArrayList<String>,
    var score: Int,
)


class GameStateModel: ViewModel() {

    private lateinit var player2Mock : PlayersState

    private var _gameState = MutableLiveData<GameState>()
    val gameState: LiveData<GameState>
        get() = _gameState

    private var _timer = MutableLiveData<Timer>()
    val timer: LiveData<Timer>
        get() = _timer

    private var gameMock: GameState

    init {
//        SocketHandler.getSocket().once("Game State Update") { args ->
//            if(args[0] != null) {
//                _gameState.value = args[0] as GameState
//            }
//        }
//        SocketHandler.getSocket().emit("Request Game State")

        val player1Mock = PlayersState("player1Mock", arrayListOf("a", "c", "d", "e", "blank", "", "f"), 120)
        val player2Mock =  PlayersState("player2Mock", arrayListOf("b", "e", "f", "z", "", "j"), 20)
        gameMock = GameState(
            arrayOf(
                arrayOf("", "*", "c"),
                arrayOf("", "a", ""),
                arrayOf("", "", "b")
            ),
            arrayListOf(player1Mock, player2Mock),
            1,
            52,
            false
        )
        _gameState.value = gameMock
    }

    fun getGameState() {

//        SocketHandler.getSocket().emit("Request Game State")
//        SocketHandler.getSocket().on("Game State Update") { args ->
//            if(args[0] != null) {
//                _gameState.value = args[0] as GameState
//            }
//        }
//        gameMock.reserveLength = 10
//        _gameState.value = gameMock
    }

    fun getTimer() {
        SocketHandler.getSocket().once("hereIsTheTimer") { args ->
            if(args[0] != null) {
                _timer.value = args[0] as Timer
            }
        }
        SocketHandler.getSocket().emit("sendTimer")
    }

    private fun populateBoard(): Array<Array<String>> { //a supprimer seulement pour mock
        val rows = 15
        val cols = 15
        return Array(rows) { Array(cols) { "a" } }
    }

}


//
//interface ObserverGame {
//    fun updateState()
//}
//
//interface ObservableGame {
//    val observers: ArrayList<ObserverGame>
//
//    fun addObserver(observer: ObserverGame) {
//        observers.add(observer)
//    }
//
//    fun removeObserver(observer: ObserverGame) {
//        observers.remove(observer)
//    }
//
//}
//
//object GameStateModel: ObservableGame {
//    override val observers: ArrayList<ObserverGame> = arrayListOf()
//    private var playersList = ArrayList<PlayersState>()
//    lateinit var gameState: GameStateInterface
//
//    fun updateGameState() {
//        SocketHandler.getSocket().once("Request Game State") { args ->
//            if(args[0] != null) {
//                gameState = args[0] as GameStateInterface
//                playersList = gameState.players
//            }
//        }
//        SocketHandler.getSocket().emit("Game State Update")
//    }
//
//    fun getPlayers(): ArrayList<PlayersState> {
//        return playersList
//    }
//
//    fun getState(): GameStateInterface {
//        return gameState
//    }
//
//}



//class GameState//    constructor(socketManagerService: SocketHandler) {
////        val gameStateObservable = Observable((observer: Observer< GameStateInterface>) => {
////            socket.on("game-state", (state: GameStateInterface) => observer.next(state));
////        })
////    }
//    (socketManagerService: SocketHandler) {
//    //private gameStateObservable: Observable<GameStateInterface>;
//    private val socket = SocketHandler.getSocket()
//
//    init {
//        val gameStateObservable = object: Observable<GameStateInterface>() {
//
//        }
//    }
////
////    fun getPlayerNamesListener(): Observable<string[]> {
////        return new Observable((observer: Observer<string[]>) => {
////            this.socket.on('playerNames', (names: string[]) => observer.next(names));
////        });
////    }
////
////    fun getPlayerID(): Observable<string> {
////        return new Observable((observer: Observer<string>) => {
////            this.socket.on('sendID', (id: string) => observer.next(id));
////        });
////    }
////
////    fun getGameStateObservable(): Observable<GameState> {
////        return this.gameStateObservable;
////    }
////
////
////    fun getPlayerNames() {
////        socket.emit("getPlayerNames")
////    }
////
////    fun sendAbandonRequest() {
////        this.socket.emit("abandon")
////    }
////
////    fun notifyGameStateReceived() {
////        this.socket.emit("gameStateReceived")
////    }
////
////    fun reconnect(id: String) {
////        this.socket.emit("reconnect", id)
////    }
////
////    fun requestId() {
////        this.socket.emit("requestId")
////    }
//
//
//}

