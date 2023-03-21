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
            SocketHandler.getSocket().on("Theme and Language Response"){args ->
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
    fun getTheme():String{
        return this.user.theme
    }
    fun getLang():String{
        return this.user.lang
    }

    fun setTheme(theme: String){
        this.user.theme=theme;
    }

    fun setLang(lang: String){
        this.user.lang=lang;
    }

    fun disconnectUser(){
        this.user = User("");
        SocketHandler.getSocket().off("Theme and Language Response")
    }
}
