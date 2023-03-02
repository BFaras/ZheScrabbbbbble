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

object ChatModel {
    private val chatList = LinkedHashMap<String,Chat> ()



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

    fun getList() : ArrayList<Chat> {
        return ArrayList(chatList.values);
    }

    fun leaveChat(_id:String) :Boolean{
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
            }
        }
    }
}

