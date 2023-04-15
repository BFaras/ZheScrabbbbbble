package com.example.testchatbox

import SocketHandler
import android.os.CountDownTimer
import android.util.Log
import androidx.navigation.fragment.findNavController
import org.json.JSONArray
import org.json.JSONObject

enum class GameStatus {
    PENDING,
    IN_PROGRESS,
    FINISHED;

    companion object {
        fun fromInt(value: Int) = GameStatus.values().first { it.ordinal == value }
    }
}

//Phase 0: Before round; Phase 1: In round; Phase 2: End of tournament
data class TournamentTimer (var timeRemaning:Int, var phase:Int)

//Type : {"Semi1", "Semi2", "Final1", "Final2"}; Lors du premier tour, seulement Semi1 et Semi2 sont reçus
// winnerIndex = -1 lorsque partie non jouée, sinon 0 ou 1 même avant que partie ne soit finie(afficher seulement lorsque GameStatue=finished)
data class GameData (val type: String, val status: GameStatus, val players: Array<String>, val winnerIndex: Int, val roomCode: String)

object TournamentModel :Observable{
    private var inQueue=false;
    override var observers: ArrayList<Observer> = arrayListOf()
    var gamesData : ArrayList<GameData> = arrayListOf()
    var tournamentTimer:TournamentTimer = TournamentTimer(0, 0)
    var inTournament =false;


    fun exitTournament(){
        SocketHandler.getSocket().emit("Exit Tournament");
        gamesData= arrayListOf();
        inQueue=false;
        inTournament=false;
        observers= arrayListOf();
        tournamentTimer = TournamentTimer(0, 0)
        SocketHandler.getSocket().off("Tournament Data Response")
        SocketHandler.getSocket().off("Tournament Found")
    }

    fun queueForTournament(){
        if(!inQueue){
            inQueue=true;
            SocketHandler.getSocket().emit("Enter Tournament Queue");
        }
        SocketHandler.getSocket().once("Tournament Found"){
            inQueue=false;
            inTournament=true;
            notifyObserver();
        }

        SocketHandler.getSocket().on("Tournament Data Response"){args->
            val gamesArray = args[0] as JSONArray;
            for(i in 0 until gamesArray.length()){
                val gameJSON = gamesArray.get(i) as JSONObject;
                val playersArray = gameJSON.get("players") as JSONArray;
                var players = arrayOf<String>();
                for (j in 0 until playersArray.length()){
                    players=players.plus(playersArray.get(j) as String)
                }
                gamesData.add(GameData(gameJSON.get("type") as String, GameStatus.fromInt(gameJSON.get("status") as Int), players, gameJSON.get("winnerIndex") as Int, gameJSON.get("roomCode") as String))
            }
            val timerJSON = args[1] as JSONObject;
            tournamentTimer= TournamentTimer(timerJSON.get("time") as Int,timerJSON.get("phase") as Int);
            notifyObserver();
        }

        SocketHandler.getSocket().on("Game Started"){args->
            val roomCode = args[1] as String;
            populateGameRoomModel(roomCode, false);
        }
    }



    fun populateGameRoomModel(gameId:String, observer: Boolean){
        GameRoomModel.leaveRoom()
        for(game in gamesData){
            if(game.roomCode==gameId)
                GameRoomModel.initialise(GameRoom(game.type, gameId, Visibility.Public, game.players, hasStarted = true, GameType.Classic, 0),observer)
        }
        Log.i("Update", "GameRoom")
    }

}
