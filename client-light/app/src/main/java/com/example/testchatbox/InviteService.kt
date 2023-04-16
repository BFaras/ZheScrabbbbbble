package com.example.testchatbox

import SocketHandler
import com.example.testchatbox.chat.Message
import com.example.testchatbox.chat.ObserverChat

data class InviteRequest(val username:String, val roomId : String, val gameType: GameType)

interface ObserverInvite{

    fun updateInvite()
}

interface ObservableInvite{
    val observers: ArrayList<ObserverInvite>

    fun addObserver(observer: ObserverInvite) {
        observers.add(observer)
    }

    fun removeObserver(observer: ObserverInvite) {
        observers.remove(observer)
    }

    fun notifyObservers() {
        observers.forEach { it.updateInvite() }
    }
}


object InviteService : ObservableInvite {
    private var request = arrayListOf<InviteRequest>();
    override val observers: ArrayList<ObserverInvite> = arrayListOf();

    init {
        SocketHandler.getSocket().on("Game Invite Request"){args->
            if(args[0]!=null && args[1]!=null && args[2]!=null){
                val name = args[0] as String;
                val id = args[1] as String;
                val isCoop = args[2] as Boolean;
                request.add(InviteRequest(name, id, if(isCoop) GameType.Coop else GameType.Classic));
                notifyObservers();
            }
        }
    }

    fun getFirst():InviteRequest?{
        if(request.isNotEmpty()) return request[0];
        return null;
    }

    fun acceptRequest(){
        request= arrayListOf()
    }

    fun rejectRequest(){
        request.removeAt(0);
    }

}
