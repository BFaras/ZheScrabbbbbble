package com.example.testchatbox

import android.util.Log
import com.example.testchatbox.login.model.LoggedInUser
import org.json.JSONArray

interface Observer{
    fun update()
}

interface Observable{
    val observers: ArrayList<Observer>

    fun addObserver(observer: Observer) {
        observers.add(observer)
    }

    fun removeObserver(observer: Observer) {
        observers.remove(observer)
    }

    fun notifyObserver() {
        observers.forEach { it.update() }
    }
}

object GameRoomModel :Observable{
    var gameRoom: GameRoom? = null;
    var joinRequest: ArrayList<String> = arrayListOf();
    override var observers: ArrayList<Observer> = arrayListOf();

    fun initialise(gameRoom: GameRoom){
        this.gameRoom = gameRoom;
        gameRoom.players=gameRoom.players.plus(LoggedInUser.getName())
        SocketHandler.getSocket().on("Room Player Update"){ args ->
            if(args[0] != null){
                gameRoom.players = arrayOf()
                val playersArray = args[0] as JSONArray;
                for(i in 0 until playersArray.length()){
                    gameRoom.players = gameRoom.players.plus(playersArray.getString(i))

                }
                notifyObserver()
            }
        }
        SocketHandler.getSocket().once("Game Started") {
            gameRoom.hasStarted=true;
            notifyObserver()
        }
        Log.i("Join", "init")
        SocketHandler.getSocket().on("Join Room Request") {args ->
            Log.i("Join", args[0] as String)
            if(args[0] != null){
                Log.i("Join", args[0] as String)
                joinRequest.add(args[0] as String)
                notifyObserver()
            }
        }
    }

    fun leaveRoom(){
        gameRoom=null;
        joinRequest= arrayListOf()
        observers = arrayListOf();
    }


}
