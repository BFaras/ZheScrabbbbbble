package com.example.testchatbox

import SocketHandler
import android.util.Log
import com.example.testchatbox.chat.ChatModel
import org.json.JSONArray
import org.json.JSONObject
import java.net.Socket


interface ObserverFriend{
    fun update();
    fun onModified(username: String, newUsername: String?);
}

interface ObservableFriend{
    val observers: ArrayList<ObserverFriend>

    fun addObserver(observer: ObserverFriend) {
        observers.add(observer)
    }

    fun removeObserver(observer: ObserverFriend) {
        observers.remove(observer)
    }

    fun notifyObserver() {
        observers.forEach { it.update() }
    }

    fun notifyObserverModified(username: String, newUsername: String?) {
        observers.forEach { it.onModified(username, newUsername) }
    }
}


object FriendModel : ObservableFriend{
    var friendList = arrayListOf<Friend>()
    override val observers: ArrayList<ObserverFriend> = ArrayList()

    init {
        SocketHandler.getSocket().on("Update friend status"){args->
            if(args[0] != null && args[1] !=null){
                updateStatus(args[1] as String, ConnectionStatus.fromInt(args[0] as Int))
            }
        }
        SocketHandler.getSocket().on("Friend removed you as friend"){args->
            if(args[0]!=null){
                removeFriend(args[0] as String)
            }
        }
        SocketHandler.getSocket().on("Friend Username Updated"){args->
            if(args[0]!=null && args[1] !=null){
                modifyFriend(args[0] as String, args[1] as String)
            }
        }
    }

    fun updateFriendList(){
        SocketHandler.getSocket().once("Friend List Response"){args->
            try{
                friendList = arrayListOf()
                Log.i("friend", args[0].toString())
                val friends = args[0] as JSONArray
                for (i in 0 until friends.length()){
                    val friend = friends.get(i) as JSONObject
                    friendList.add(Friend(friend.get("username") as String, ConnectionStatus.fromInt(friend.get("status") as Int)))
                }
                notifyObserver()
            }catch(e:Exception){
            }
        }
        SocketHandler.getSocket().emit("Get Friend List")
    }

    fun removeFriend(username: String){
        for(friend in friendList){
            if(friend.username==username)
                friendList.remove(friend);
        }
        ChatModel.removePrivateChat(username);
        notifyObserverModified(username, null);
    }

    private fun modifyFriend(oldUsername: String, newUsername:String){
        for(friend in friendList){
            if(friend.username==oldUsername)
                friend.username=newUsername;
        }
        ChatModel.modifyPrivateChat(oldUsername,newUsername);
        notifyObserverModified(oldUsername, newUsername);
    }

    private fun updateStatus(username: String, status: ConnectionStatus){
        for(friend in friendList){
            if(friend.username==username){
                friend.connectionStatus=status;
                break;
            }
        }
        notifyObserver()
    }

    fun isAvailable(username: String):Boolean{
        for(friend in friendList){
            if(friend.username==username)
                return friend.connectionStatus==ConnectionStatus.ONLINE
        }
        return false
    }

}
