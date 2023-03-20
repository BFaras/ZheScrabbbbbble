package com.example.testchatbox.login.model

import SocketHandler
import android.util.Log


data class User(val username:String) {
    var theme:String="";
    var lang:String="";
}

object LoggedInUser {

    private var user: User = User("")

    fun connectUser(userName : String){
        if(this.user.username==""){
            this.user = User(userName);
            SocketHandler.getSocket().once("Theme and Language Response"){args ->
                if(args[0]!=null && args[1]!=null){
                    this.user.theme = args[0] as String;
                    this.user.lang = args[1] as String;
                    //TODO: Match language and theme in app
                }
            }
            SocketHandler.getSocket().emit("Get Theme and Language")
        }
    }

    fun getName():String{
        return this.user.username
    }

    fun disconnectUser(){
        this.user = User("");
    }
}
