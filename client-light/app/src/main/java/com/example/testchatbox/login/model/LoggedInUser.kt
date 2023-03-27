package com.example.testchatbox.login.model

import SocketHandler
import android.util.Log
import com.example.testchatbox.ThemeManager
import com.example.testchatbox.ThemeStorage


data class User(val username:String) {
    var theme:String="";
    var lang:String="";
}

object LoggedInUser {

    private var user: User = User("")


    fun connectUser(userName : String){
        if(this.user.username==""){
            this.user = User(userName);
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
