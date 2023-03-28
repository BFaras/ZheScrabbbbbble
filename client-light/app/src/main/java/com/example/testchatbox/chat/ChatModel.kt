package com.example.testchatbox.chat

import SocketHandler
import android.content.Context
import android.util.Log
import com.example.testchatbox.GameRoom
import com.example.testchatbox.R
import org.json.JSONArray
import org.json.JSONObject
import kotlin.system.exitProcess


enum class  ChatType{
    PUBLIC,
    PRIVATE,
    GLOBAL;

    companion object {
        fun fromInt(value: Int) = ChatType.values().first { it.ordinal == value }
    }
}

class Message(val username:String, val timestamp:String, val message: String, val avatar:String){
    override fun toString() : String{
        return "$timestamp | $username : $message"
    }
}

class Chat(val chatType : ChatType, val chatName :String, val _id:String)

interface ObserverChat {
    fun updateMessage(chatCode: String, message: Message)

    fun updateChannels()

    fun updatePublicChannels()
}

interface ObservableChat{
    val observers: ArrayList<ObserverChat>

    fun addObserver(observer: ObserverChat) {
        observers.add(observer)
    }

    fun removeObserver(observer: ObserverChat) {
        observers.remove(observer)
    }

    fun notifyNewMessage(chatCode:String, message: Message) {
        observers.forEach { it.updateMessage(chatCode, message) }
    }

    fun notifyNewChanel() {
        observers.forEach { it.updateChannels() }
    }

    fun notifyNewPublicChanel() {
        observers.forEach { it.updatePublicChannels() }
    }
}

object ChatModel : ObservableChat {
    private val chatList = LinkedHashMap<String,Chat>();
    private val publicChatList = LinkedHashMap<String,Chat> ();
    override val observers: ArrayList<ObserverChat> = arrayListOf();

    fun updateList(){
        SocketHandler.getSocket().once("User Chat List Response") { args ->
            if(args[0] != null){
                val chats = args[0] as JSONArray;
                var changed= false;
                for (i in 0 until chats.length()) {
                    val chat = chats.getJSONObject(i)
                    if(!chatList.containsKey(chat.get("_id"))){
                        chatList[chat.get("_id") as String]=(Chat(ChatType.fromInt(chat.get("chatType") as Int), chat.get("chatName") as String, chat.get("_id") as String))
                        changed=true;
                    }
                }
                if(changed) notifyNewChanel();
            }
        }
        SocketHandler.getSocket().emit("Get User Chat List")
    }

    fun updatePublicList(){
        SocketHandler.getSocket().once("Public Chat List Response") { args ->
            if(args[0] != null){
                val chats = args[0] as JSONArray;
                var changed= false
                for (i in 0 until chats.length()) {
                    val chat = chats.getJSONObject(i)
                    Log.i("JSON", chat.toString())
                    if(!publicChatList.containsKey(chat.get("_id"))){
                        publicChatList[chat.get("_id") as String]=(Chat(ChatType.fromInt(chat.get("chatType") as Int),
                            chat.get("chatName") as String, chat.get("_id") as String))
                            changed=true;
                    }
                }
                if(changed) notifyNewPublicChanel();
            }
        }
        SocketHandler.getSocket().emit("Public Chat List Response")
    }

    fun getList() : ArrayList<Chat> {
        return ArrayList(chatList.values);
    }

    fun getPublicList() : ArrayList<Chat> {
        return ArrayList(publicChatList.values);
    }

    fun addGameChat(gameRoom: GameRoom){
        chatList[gameRoom.id] = Chat(ChatType.GLOBAL, "GAME",  gameRoom.id)
    }

    fun removeGameChat(gameRoom: GameRoom){
        chatList.remove(gameRoom.id)
    }

    fun joinPublicList(_id:String){
        SocketHandler.getSocket().on("Join Chat Response") { args ->
            if(args[0] != null ){
                val errorMessage = args[0] as String;
                Log.i("Join", errorMessage)
                if(errorMessage == "0"){
                    updateList();
                    publicChatList.remove(_id);
                    notifyNewPublicChanel();
                }
            }
        }
        SocketHandler.getSocket().emit("Join Public Chat", _id)
    }

    fun createPublicChat(name: String){
        SocketHandler.getSocket().on("Chat Creation Response") { args ->
            if(args[0] != null){
                val errorMessage = args[0] as JSONObject;
                if(errorMessage.get("errorCode") == "0"){
                    updateList();
                }
            }
        }
        SocketHandler.getSocket().emit("Create New Chat", name, 0)
    }

    fun leaveChat(_id:String){
        Log.i("Leave", _id)
        SocketHandler.getSocket().on("Leave Chat Response") { args ->
            if(args[0] != null){
                val errorMessage = args[0] as String;
                Log.i("Leave", errorMessage)
                if(errorMessage == "0"){
                    chatList.remove(_id)
                    notifyNewChanel();
                    updatePublicList() ;
                    Log.i("Channels", chatList.toString())
                }
            }
        }
        SocketHandler.getSocket().emit("Leave Public Chat", _id)
    }

    fun initialiseChat(){
        updateList();
        updatePublicList();
        SocketHandler.getSocket().on("New Chat Message") { args ->
            if(args[0] != null && args[1] != null ){
                val chatCode = args[0] as String;
                val chatMessage = args[1] as JSONObject;
                val message = Message(chatMessage.get("username") as String,
                    chatMessage.get("timestamp") as String,
                    chatMessage.get("message") as String, chatMessage.get("avatar") as String
                )
                updateList();
                notifyNewMessage(chatCode, message);
            }
        }
    }
}

