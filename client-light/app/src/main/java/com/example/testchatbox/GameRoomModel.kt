package com.example.testchatbox

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
    override var observers: ArrayList<Observer> = arrayListOf();

    fun initialise(gameRoom: GameRoom){
        this.gameRoom = gameRoom;
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
    }

    fun leaveRoom(){
        gameRoom=null;
        observers = arrayListOf();
    }


}
