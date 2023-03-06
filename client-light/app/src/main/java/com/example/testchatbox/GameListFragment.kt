package com.example.testchatbox

import SocketHandler
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentGameListBinding
import com.example.testchatbox.databinding.FragmentMainMenuBinding
import com.example.testchatbox.login.model.LoggedInUser
import org.json.JSONArray

enum class Visibility{
    PUBLIC,
    PRIVATE,
    PROTECTED;

    companion object {
        fun fromInt(value: Int) = Visibility.values().first { it.ordinal == value }
    }

}

data class GameRoom(val name:String, val id:String, val visibility: Visibility, val players: Array<String>, val hasStarted : Boolean)


class GameListFragment : Fragment() {

    private var _binding: FragmentGameListBinding? = null
    private val binding get() = _binding!!

    private var gameList:ArrayList<GameRoom> = arrayListOf();

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        _binding = FragmentGameListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)


    }


    private fun updateGameList(){
        SocketHandler.getSocket().once("Game Room List Response"){ args ->
            if(args[0] != null){
                val list = args[0] as JSONArray;
                gameList= arrayListOf();
                for (i in 0 until list.length()) {
                    val gameRoom = list.getJSONObject(i)
                    gameList.add(GameRoom(gameRoom.get("name") as String, gameRoom.get("id") as String, Visibility.fromInt(gameRoom.get("visibility") as Int), gameRoom.get("players") as Array<String>, gameRoom.get("isStarted") as Boolean))
                }
                activity?.runOnUiThread(Runnable {
                    loadListView();
                });
            }
        }
        SocketHandler.getSocket().emit("Get Game Room List")
    }

    private fun loadListView(){
        val gameListView = binding.gameList;
        gameListView.removeAllViews()
        for((i, gameRoom) in gameList.withIndex()){
            val btn = Button((activity as MainActivity?)!!)
            btn.text = gameRoom.name +" | "+gameRoom.visibility + " | "+ gameRoom.players + " | " + gameRoom.hasStarted;
            btn.id = i;
            btn.textSize= 30F;
            btn.setOnClickListener{
                if(gameList[btn.id].visibility!=Visibility.PROTECTED) {
                    joinRoom(gameList[btn.id].id, null)
                }else{
                    binding.passwordSection.visibility=View.VISIBLE;
                    binding.joinBtn.setOnClickListener{
                        val password =binding.password.text.toString().trim()
                        if(password.isNotEmpty()){
                            binding.passwordSection.visibility=View.GONE;
                            joinRoom(gameList[btn.id].id, password)
                            binding.joinBtn.setOnClickListener(null);
                        }
                    }
                }
            }
            gameListView.addView(btn)
        }

    }

    private fun joinRoom(id: String, password : String?){

    }


}
