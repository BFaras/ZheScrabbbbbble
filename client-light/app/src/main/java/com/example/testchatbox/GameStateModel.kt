package com.example.testchatbox

import SocketHandler
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import org.json.JSONArray
import org.json.JSONObject

data class GameState (
    var board: Array<Array<String>>,
    var players: ArrayList<PlayersState>,
    var playerTurnIndex: Int,
    var reserveLength: Int,
    var gameOver: Boolean,
    var message: PlayerMessage? = null
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

data class PlayerMessage (
    var messageType: String,
    var values: ArrayList<String>
)

class GameStateModel: ViewModel() {

    private var _gameState = MutableLiveData<GameState>()
    val gameState: LiveData<GameState>
        get() = _gameState

    private var _activeTile = MutableLiveData<Pair<String, Int>>()
    val activeTile: LiveData<Pair<String, Int>>
        get() = _activeTile

    private var _avatarsList =  MutableLiveData<MutableMap<String,String>>()
    val avatarsList: LiveData<MutableMap<String,String>>
        get() = _avatarsList


    private var _emote = MutableLiveData<Pair<String, String>>()
    val emote: LiveData<Pair<String, String>>
        get() = _emote

    private var _deleteActiveTile = MutableLiveData<Pair<String, Int>>()
    val deleteActiveTile: LiveData<Pair<String, Int>>
        get() = _deleteActiveTile

    private var _timer = MutableLiveData<Timer>()
    val timer: LiveData<Timer>
        get() = _timer

    //Valeur test, à retirer
    private lateinit var gameMock: GameState

    init {
        getAvatars()

        SocketHandler.getSocket().on("Avatars from Usernames Response") { args ->
            val avatarListJSON = args[0] as JSONObject
            val avatarListTemp = mutableMapOf<String, String>()
            Log.d("AVATARS JSON", args[0].toString())

            for (i in 0 until avatarListJSON.length()) {
                avatarListTemp[avatarListJSON.names()?.getString(i) as String] = (avatarListJSON.names()?.getString(i)?.let { avatarListJSON.get(it) }) as String
            }
            _avatarsList.postValue(avatarListTemp)
        }
        getAvatars()

        getGameState()

        SocketHandler.getSocket().on("Game State Update") { args ->
                val gameJSON = args[0] as JSONObject
                Log.i("gameState", gameJSON.toString())
                var gameStateTemp = GameState(arrayOf(), arrayListOf(), -1, -1, false, PlayerMessage("", arrayListOf()));

                for (i in 0..14){
                    gameStateTemp.board =gameStateTemp.board.plus(Array(15){""})
                    for (j in 0..14){
                        gameStateTemp.board[i][j]=((gameJSON.get("board") as JSONArray).get(i) as JSONArray).get(j) as String
                    }
                }

                val playerArray = gameJSON.get("players") as JSONArray
                for (i in 0 until playerArray.length()){
                    val playerState = playerArray.get(i) as JSONObject
                    val handArray = playerState.get("hand") as JSONArray
                    var hand : ArrayList<String> = arrayListOf()
                    for(j in 0 until handArray.length()){
                        hand.add(handArray.get(j) as String)
                    }
                    gameStateTemp.players.add(PlayersState(playerState.get("username") as String,hand ,playerState.get("score") as Int))
                }
                gameStateTemp.playerTurnIndex=gameJSON.get("playerTurnIndex") as Int
                gameStateTemp.reserveLength=gameJSON.get("reserveLength") as Int
                gameStateTemp.gameOver=gameJSON.get("gameOver") as Boolean

                try {
                    val messageJSON = gameJSON.get("message") as JSONObject
                    val messageArray = messageJSON.get("values") as JSONArray
                    val messages = arrayListOf<String>()
                    for (i in 0 until messageArray.length()) {
                        messages.add(messageArray.get(i) as String)
                    }
                    gameStateTemp.message = PlayerMessage(messageJSON.get("messageType") as String, messages)
                }catch (e:Exception){
                    Log.e("Game State", e.toString())
                }
                _gameState.postValue(gameStateTemp);
            }
        getGameState()

        SocketHandler.getSocket().on("Get First Tile") { args ->
            Log.i("args  ", args.toString())
            val firstTileJSON = args[0] as JSONObject
            Log.i("firstTileJSON ", firstTileJSON.toString())
            val firstTileTemp = Pair(firstTileJSON.get("x") as String, firstTileJSON.get("y") as Int)
            Log.i("firstTileTemp ", firstTileTemp.toString())
            _activeTile.postValue(firstTileTemp)
        }

        SocketHandler.getSocket().on("Remove Selected Tile Response") { args ->
            Log.i("args  ", args.toString())
            val firstTileJSON = args[0] as JSONObject
            Log.i("firstTileJSON ", firstTileJSON.toString())
            val firstTileTemp = Pair(firstTileJSON.get("x") as String, firstTileJSON.get("y") as Int)
            Log.i("firstTileTemp ", firstTileTemp.toString())
            _deleteActiveTile.postValue(firstTileTemp)
        }

        SocketHandler.getSocket().on("Emote Response") { args ->
            val emoteJSON = args[0] as JSONObject
            Log.i("emoteJSON  ", args[0].toString())
            _emote.postValue(Pair(emoteJSON.get("username") as String, emoteJSON.get("emote") as String))
        }


    }

    fun getGameState() {
        SocketHandler.getSocket().emit("Request Game State")
    }

    fun getAvatars() {
        SocketHandler.getSocket().emit("Get Avatars from Usernames", JSONArray((GameRoomModel.gameRoom?.players!!.filter { !it.contains("(V)") }).toTypedArray()))
    }

    fun getTimer() {
        SocketHandler.getSocket().emit("sendTimer")
    }

}

//
//
//class GameStateModel: ViewModel() {
//
//    private lateinit var player2Mock : PlayersState
//
//    private var _gameState = MutableLiveData<GameState>()
//    val gameState: LiveData<GameState>
//        get() = _gameState
//
//    private var _timer = MutableLiveData<Timer>()
//    val timer: LiveData<Timer>
//        get() = _timer
//
//    private var gameMock: GameState
//
//    init {
////        SocketHandler.getSocket().once("Game State Update") { args ->
////            if(args[0] != null) {
////                _gameState.value = args[0] as GameState
////            }
////        }
////        SocketHandler.getSocket().emit("Request Game State")
//
//        val player1Mock = PlayersState("player1Mock", arrayListOf("a", "c", "d", "e", "blank", "", "f"), 120)
//        val player2Mock =  PlayersState("player2Mock", arrayListOf("b", "e", "f", "z", "", "j"), 20)
//        val player3Mock =  PlayersState("player2Mock", arrayListOf("b", "e", "f", "z", "", "j"), 20)
//        val player4Mock =  PlayersState("player2Mock", arrayListOf("b", "e", "f", "z", "", "j"), 20)
//        gameMock = GameState(
//            arrayOf(
//                arrayOf("", "", "c"),
//                arrayOf("", "B", ""),
//                arrayOf("", "c", "b")
//            ),
//            arrayListOf(player1Mock, player2Mock, player3Mock,player4Mock),
//            1,
//            52,
//            false,
//            PlayerMessage("PLACE_MESSAGE", arrayListOf("Manuel", "mot", "10"))
//        )
//        _gameState.value = gameMock
//    }
//
//    fun getGameState() {
//
////        SocketHandler.getSocket().emit("Request Game State")
////        SocketHandler.getSocket().on("Game State Update") { args ->
////            if(args[0] != null) {
////                _gameState.value = args[0] as GameState
////            }
////        }
////        gameMock.reserveLength = 10
////        _gameState.value = gameMock
//    }
//
//    fun getTimer() {
//        SocketHandler.getSocket().once("hereIsTheTimer") { args ->
//            if(args[0] != null) {
//                _timer.value = args[0] as Timer
//            }
//        }
//        SocketHandler.getSocket().emit("sendTimer")
//    }
//
//    private fun populateBoard(): Array<Array<String>> { //a supprimer seulement pour mock
//        val rows = 15
//        val cols = 15
//        return Array(rows) { Array(cols) { "a" } }
//    }
//
//}


//package com.example.testchatbox
//
//import SocketHandler
//import android.util.Log
//import androidx.lifecycle.LiveData
//import androidx.lifecycle.MutableLiveData
//import androidx.lifecycle.ViewModel
//import org.json.JSONArray
//import org.json.JSONObject
//
//data class GameState (
//    var board: Array<Array<String>>,
//    var players: ArrayList<PlayersState>,
//    var playerTurnIndex: Int,
//    var reserveLength: Int,
//    var gameOver: Boolean
//)
//    //val board: String[][];
//
//data class Timer (
//    var minute: Int,
//    var second: Int
//)
//
//data class PlayersState (
//    var username: String,
//    var hand: ArrayList<String>,
//    var score: Int,
//)
//
//
//class GameStateModel: ViewModel() {
//
//    private var _gameState = MutableLiveData<GameState>()
//    val gameState: LiveData<GameState>
//        get() = _gameState
//
//    private var _timer = MutableLiveData<Timer>()
//    val timer: LiveData<Timer>
//        get() = _timer
//
//    //Valeur test, à retirer
//    private lateinit var gameMock: GameState
//
//    init {
//        getGameState()
//        SocketHandler.getSocket().on("Game State Update") { args ->
//            try {
//                val gameJSON = args[0] as JSONObject
//                Log.i("gameState", gameJSON.toString())
//                var gameStateTemp:GameState = GameState(arrayOf(), arrayListOf(), -1, -1, false);
//                for (i in 0..14){
//                    gameStateTemp.board =gameStateTemp.board.plus(Array(15){""})
//                    for (j in 0..14){
//                        gameStateTemp.board[i][j]=((gameJSON.get("board") as JSONArray).get(i) as JSONArray).get(j) as String
//                    }
//                }
//                val playerArray = gameJSON.get("players") as JSONArray
//                for (i in 0 until playerArray.length()){
//                    val playerState = playerArray.get(i) as JSONObject
//                    val handArray = playerState.get("hand") as JSONArray
//                    var hand : ArrayList<String> = arrayListOf()
//                    for(j in 0 until handArray.length()){
//                        hand.add(handArray.get(j) as String)
//                    }
//                    gameStateTemp.players.add(PlayersState(playerState.get("username") as String,hand ,playerState.get("score") as Int))
//                }
//                gameStateTemp.playerTurnIndex=gameJSON.get("playerTurnIndex") as Int
//                gameStateTemp.reserveLength=gameJSON.get("reserveLength") as Int
//                gameStateTemp.gameOver=gameJSON.get("gameOver") as Boolean
//                _gameState.postValue(gameStateTemp);
//            }
//            catch (e:Exception){
//                Log.e("Game State", e.toString())
//            }
//        }
////        SocketHandler.getSocket().on("hereIsTheTimer") { args ->
// //           if(args[0] != null) {
// //               _timer.value = args[0] as Timer
//   //         }
//    //    }
//        getGameState()
////        getTimer()
//
//    }
//
//    fun getGameState() {
//        SocketHandler.getSocket().emit("Request Game State")
//    }
//
//    fun getTimer() {
//        SocketHandler.getSocket().emit("sendTimer")
//    }
//
//    private fun populateBoard(): Array<Array<String>> { //a supprimer seulement pour mock
//        val rows = 15
//        val cols = 15
//        return Array(rows) { Array(cols) { "a" } }
//    }
//
//}
//
//
////
////interface ObserverGame {
////    fun updateState()
////}
////
////interface ObservableGame {
////    val observers: ArrayList<ObserverGame>
////
////    fun addObserver(observer: ObserverGame) {
////        observers.add(observer)
////    }
////
////    fun removeObserver(observer: ObserverGame) {
////        observers.remove(observer)
////    }
////
////}
////
////object GameStateModel: ObservableGame {
////    override val observers: ArrayList<ObserverGame> = arrayListOf()
////    private var playersList = ArrayList<PlayersState>()
////    lateinit var gameState: GameStateInterface
////
////    fun updateGameState() {
////        SocketHandler.getSocket().once("Request Game State") { args ->
////            if(args[0] != null) {
////                gameState = args[0] as GameStateInterface
////                playersList = gameState.players
////            }
////        }
////        SocketHandler.getSocket().emit("Game State Update")
////    }
////
////    fun getPlayers(): ArrayList<PlayersState> {
////        return playersList
////    }
////
////    fun getState(): GameStateInterface {
////        return gameState
////    }
////
////}
//
//
//
////class GameState//    constructor(socketManagerService: SocketHandler) {
//////        val gameStateObservable = Observable((observer: Observer< GameStateInterface>) => {
//////            socket.on("game-state", (state: GameStateInterface) => observer.next(state));
//////        })
//////    }
////    (socketManagerService: SocketHandler) {
////    //private gameStateObservable: Observable<GameStateInterface>;
////    private val socket = SocketHandler.getSocket()
////
////    init {
////        val gameStateObservable = object: Observable<GameStateInterface>() {
////
////        }
////    }
//////
//////    fun getPlayerNamesListener(): Observable<string[]> {
//////        return new Observable((observer: Observer<string[]>) => {
//////            this.socket.on('playerNames', (names: string[]) => observer.next(names));
//////        });
//////    }
//////
//////    fun getPlayerID(): Observable<string> {
//////        return new Observable((observer: Observer<string>) => {
//////            this.socket.on('sendID', (id: string) => observer.next(id));
//////        });
//////    }
//////
//////    fun getGameStateObservable(): Observable<GameState> {
//////        return this.gameStateObservable;
//////    }
//////
//////
//////    fun getPlayerNames() {
//////        socket.emit("getPlayerNames")
//////    }
//////
//////    fun sendAbandonRequest() {
//////        this.socket.emit("abandon")
//////    }
//////
//////    fun notifyGameStateReceived() {
//////        this.socket.emit("gameStateReceived")
//////    }
//////
//////    fun reconnect(id: String) {
//////        this.socket.emit("reconnect", id)
//////    }
//////
//////    fun requestId() {
//////        this.socket.emit("requestId")
//////    }
////
////
////}
//
