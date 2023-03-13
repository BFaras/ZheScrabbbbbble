package com.example.testchatbox.login.model

import android.util.Log

/**
 * Data class that captures user information for logged in users retrieved from LoginRepository
 */
object LoggedInUser {

    private var displayName: String = ""

    fun connectUser(userName : String){
        if(this.displayName=="")
            this.displayName = userName;
    }

    fun getName():String{
        return this.displayName
    }

    fun disconnectUser(){
        this.displayName=""
    }
}
