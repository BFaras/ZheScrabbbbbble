package com.example.testchatbox

import android.util.Log
import com.example.testchatbox.chat.ChatModel
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
    var isPlayer =true;
    var joinRequest: ArrayList<String> = arrayListOf();
    override var observers: ArrayList<Observer> = arrayListOf();

    fun initialise(gameRoom: GameRoom, observer: Boolean){
        this.gameRoom = gameRoom;
        ChatModel.addGameChat(gameRoom)
        isPlayer=!observer
        if(isPlayer)
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
        GameHistoryModel.initialise();
        SocketHandler.getSocket().once("Game Started") {
            gameRoom.hasStarted=true;
            notifyObserver()
        }
        SocketHandler.getSocket().on("Join Room Request") {args ->
            if(args[0] != null){
                joinRequest.add(args[0] as String)
                notifyObserver()
            }
        }
    }

    fun leaveRoom(){
        if (gameRoom !=null)
            ChatModel.removeGameChat(gameRoom as GameRoom)
        gameRoom=null;
        SocketHandler.getSocket().off("Join Room Request")
        SocketHandler.getSocket().off("Game Started")
        joinRequest= arrayListOf()
        observers = arrayListOf();
        GameHistoryModel.reset();
    }


}
