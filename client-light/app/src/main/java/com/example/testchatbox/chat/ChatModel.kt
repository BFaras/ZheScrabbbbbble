package com.example.testchatbox.chat

import SocketHandler
import org.json.JSONObject


enum class  ChatType{
    PUBLIC,
    PRIVATE,
    GLOBAL,
}

class Chat(val chatType : ChatType, val chatName :String, val _id:String){
    var messages = arrayListOf<String>();

    fun pushMessage(message: String){
        this.messages.add(message);
    }
}

interface Observer {
    fun update(chatCode: String)
}

interface Observable{
    val observers: ArrayList<Observer>

    fun addObserver(observer: Observer) {
        observers.add(observer)
    }

    fun notifyObservers(chatCode:String) {
        observers.forEach { it.update(chatCode) }
    }
}

object ChatModel : Observable {
    private val chatList = LinkedHashMap<String,Chat> ();
    val publicChatList = LinkedHashMap<String,Chat> ();
    override val observers: ArrayList<Observer> = arrayListOf();

    fun updateList(){
        SocketHandler.getSocket().once("User Chat List Response") { args ->
            if(args[0] != null){
                val chats = args[0] as Array<JSONObject>;
                for (chat in chats)
                {
                    if(!chatList.containsKey(chat.get("_id")))
                        chatList[chat.get("_id") as String]=(Chat(chat.get("chatType") as ChatType,
                            chat.get("chatName") as String, chat.get("_id") as String))
                }
            }
        }
        SocketHandler.getSocket().emit("Get User Chat List")
    }

    fun updatePublicList(){
        SocketHandler.getSocket().once("Public Chat List Response") { args ->
            if(args[0] != null){
                val chats = args[0] as Array<JSONObject>;
                for (chat in chats)
                {
                    if(!publicChatList.containsKey(chat.get("_id")))
                        publicChatList[chat.get("_id") as String]=(Chat(chat.get("chatType") as ChatType,
                            chat.get("chatName") as String, chat.get("_id") as String))
                }
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

    fun joinPublicList(_id:String){
        SocketHandler.getSocket().on("Join Chat Response") { args ->
            if(args[0] != null && args[1] != null ){
                val errorMessage = args[0] as String;
                if(errorMessage == "0"){
                    updateList();
                    publicChatList.remove(_id);
                }
            }
        }
        SocketHandler.getSocket().emit("Join Public Chat", _id)
    }

    fun createPublicChat(name: String){
        SocketHandler.getSocket().on("Chat Creation Response") { args ->
            if(args[0] != null && args[1] != null ){
                val errorMessage = args[0] as String;
                if(errorMessage == "0"){
                    updateList();
                }
            }
        }
        SocketHandler.getSocket().emit("Create New Chat", name, ChatType.PUBLIC)
    }

    fun leaveChat(_id:String) :Boolean{
        SocketHandler.getSocket().emit("Leave Public Chat", _id)
        return (chatList.remove(_id) != null)
    }

    fun initialiseChat(){
        updateList();
        SocketHandler.getSocket().on("New Chat Message") { args ->
            if(args[0] != null && args[1] != null ){
                val chatCode = args[0] as String;
                val chatMessage = args[1] as String;
                if(chatList[chatCode] != null){
                    chatList[chatCode]?.pushMessage(chatMessage);
                } else {
                    updateList();
                    Thread.sleep(500);
                    chatList[chatCode]?.pushMessage(chatMessage);
                }
                notifyObservers(chatCode);
            }
        }
    }
}

