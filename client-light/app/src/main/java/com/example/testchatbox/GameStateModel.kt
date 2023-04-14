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
    var timeLeft: Int,
    var message: PlayerMessage? = null
)

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
                var gameStateTemp = GameState(arrayOf(), arrayListOf(), -1, -1, false, -1, PlayerMessage("", arrayListOf()));

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
                gameStateTemp.timeLeft=gameJSON.get("timeLeft") as Int

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
                    gameStateTemp.message = null
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
}
