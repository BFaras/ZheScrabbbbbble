package com.example.testchatbox

import SocketHandler
import android.util.Log
import com.example.testchatbox.login.model.LoggedInUser
import org.json.JSONArray
import org.json.JSONObject
import java.net.Socket

object GameHistoryModel : Observable {
    private var actionMessages = arrayListOf<PlayerMessage>()
    override val observers: ArrayList<Observer> = arrayListOf()
    var playRequest: PlayerMessage? = null;

    fun initialise(){
        reset();
        SocketHandler.getSocket().on("Message Action History"){ args->
            val messageJSON = args[0] as JSONObject
            val messageArray = messageJSON.get("values") as JSONArray
            val messages = arrayListOf<String>()
            for (i in 0 until messageArray.length()) {
                messages.add(messageArray.get(i) as String)
            }
            val messageType = messageJSON.get("messageType") as String
            if(messageType=="MSG-13") playRequest = PlayerMessage(messageType, messages);
            else actionMessages.add(PlayerMessage(messageType, messages));
            if (messageType=="MSG-12" || messageType=="MSG-14" || (messages[0] == LoggedInUser.getName() && messageType=="MSG-11")) clearPlayRequest();
            notifyObserver();
        }
    }

    fun addMoveInfo(moveInfo:PlayerMessage){
        actionMessages.add(moveInfo)
        notifyObserver();
    }

    fun sendCoopResponse(accept: Boolean){
        SocketHandler.getSocket().emit("Respond Coop Action", accept)
    }

    fun getList(): Array<PlayerMessage> {
        return actionMessages.toTypedArray();
    }

    fun reset(){
        actionMessages = arrayListOf<PlayerMessage>()
        SocketHandler.getSocket().off("Message Action History")
    }

    fun clearPlayRequest(){
        playRequest=null;
    }
}
