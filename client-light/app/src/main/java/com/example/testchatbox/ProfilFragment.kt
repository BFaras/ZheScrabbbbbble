package com.example.testchatbox

import SocketHandler
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentMainMenuBinding
import com.example.testchatbox.databinding.FragmentProfilBinding
import com.example.testchatbox.login.model.LoggedInUser
import org.json.JSONArray
import org.json.JSONObject

enum class ConnectionType {
    CONNECTION,
    DISCONNECTION;

    companion object {
        fun fromInt(value: Int) = ConnectionType.values().first { it.ordinal == value }
    }
}

data class Statistic(val name: String, val statAmount: Number)

data class ConnectionInfo (val connectionType: ConnectionType, val date: String, val time: String)

data class GameHistoryInfo (val date: String, val time: String, val isWinner: Boolean)

data class PlayerGameInfo (val name: String, val score: Int)

data class ProfileInfo (var avatar: String, var level: Int, var userCode: String, val stats: ArrayList<Statistic>, val tournamentWins: ArrayList<Int>, val connectionHistory: ArrayList<ConnectionInfo>, val gameHistory: ArrayList<GameHistoryInfo>)


class ProfilFragment : Fragment() {

    private var _binding: FragmentProfilBinding? = null
    private val binding get() = _binding!!

    private lateinit var profile : ProfileInfo

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentProfilBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        getProfile(LoggedInUser.getName())

    }

    private  fun getProfile(username:String){
        SocketHandler.getSocket().once("User Profile Response"){args->
            if(args[0]!=null) {
                var profileTemp = ProfileInfo(
                    "",
                    -1,
                    "",
                    arrayListOf(),
                    arrayListOf(),
                    arrayListOf(),
                    arrayListOf()
                )
                val profileJSON = args[0] as JSONObject
                profileTemp.avatar= profileJSON.get("avatar") as String;
                profileTemp.level= profileJSON.get("level") as Int;
                profileTemp.userCode= profileJSON.get("userCode") as String;
                val tournamentWins = profileJSON.get("tournamentWins") as JSONArray
                for(i in 0 until tournamentWins.length()){
                    profileTemp.tournamentWins.add(tournamentWins.get(i) as Int)
                }
                val stats = profileJSON.get("stats") as JSONArray
                for(i in 0 until stats.length()){
                    val stat= stats.get(i) as JSONObject
                    profileTemp.stats.add(Statistic(stat.get("name") as String, stat.get("statAmount") as Number))
                }
                val connections = profileJSON.get("connectionHistory") as JSONArray
                for(i in 0 until connections.length()){
                    val connection= connections.get(i) as JSONObject
                    profileTemp.connectionHistory.add(ConnectionInfo(ConnectionType.fromInt(connection.get("connectionType") as Int), connection.get("date") as String,connection.get("time") as String))
                }
                val gamesHistory = profileJSON.get("gameHistory") as JSONArray
                for(i in 0 until gamesHistory.length()){
                    val gameHistory= gamesHistory.get(i) as JSONObject
                    profileTemp.gameHistory.add(GameHistoryInfo(gameHistory.get("date") as String,gameHistory.get("time") as String, gameHistory.get("isWinner") as Boolean))
                }
                profile=profileTemp;
            }
        }
        SocketHandler.getSocket().emit("Get Profile Information")
    }

    private fun changeAvatar(newAvatar:String){
        SocketHandler.getSocket().once("Avatar Change Response"){args->
            if(args[0]!=null){
                val errorMessage = when(args[0] as String){
                    "0" -> R.string.NO_ERROR
                    "5" -> R.string.DATABASE_UNAVAILABLE
                    else -> R.string.ERROR
                }
                activity?.runOnUiThread(Runnable {
                    if(errorMessage == R.string.NO_ERROR ){
                        binding.avatar.text=newAvatar;
                        profile.avatar= "Avatar : $newAvatar";
                    }else{
                        val appContext = context?.applicationContext
                        Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Change Avatar", newAvatar)
    }

    private fun changeTheme(newTheme:String){
        SocketHandler.getSocket().once("Theme Change Response"){args->
            if(args[0]!=null){
                val errorMessage = when(args[0] as String){
                    "0" -> R.string.NO_ERROR
                    "5" -> R.string.DATABASE_UNAVAILABLE
                    else -> R.string.ERROR
                }
                activity?.runOnUiThread(Runnable {
                    if(errorMessage == R.string.NO_ERROR ){
                        binding.theme.text= "Theme : $newTheme";
                        LoggedInUser.setTheme(newTheme)
                    }else{
                        val appContext = context?.applicationContext
                        Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Change Theme", newTheme)
    }

    private fun changeLang(newLang:String){
        SocketHandler.getSocket().once("Language Change Response"){args->
            if(args[0]!=null){
                val errorMessage = when(args[0] as String){
                    "0" -> R.string.NO_ERROR
                    "5" -> R.string.DATABASE_UNAVAILABLE
                    else -> R.string.ERROR
                }
                activity?.runOnUiThread(Runnable {
                    if(errorMessage == R.string.NO_ERROR ){
                        binding.language.text= "Language : $newLang";
                        LoggedInUser.setLang(newLang)
                    }else{
                        val appContext = context?.applicationContext
                        Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Change Language", newLang)
    }

    //TODO:Change for real UI
    private fun updateView(){
        binding.language.text= "Language : ${LoggedInUser.getLang()}";
        binding.theme.text= "Theme : ${LoggedInUser.getTheme()}";
        binding.avatar.text= "Avatar : ${profile.avatar}";
        binding.avatar.text= "Level : ${profile.level}";
        binding.avatar.text= "Friend Code : ${profile.userCode}";
    }
}
