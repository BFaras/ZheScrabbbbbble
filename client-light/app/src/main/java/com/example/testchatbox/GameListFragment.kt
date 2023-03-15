package com.example.testchatbox

import SocketHandler
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentGameListBinding
import com.example.testchatbox.login.model.LoggedInUser
import org.json.JSONArray

enum class Visibility{
    Private,
    Public,
    Protected;

    companion object {
        fun fromInt(value: Int) = Visibility.values().first { it.ordinal == value }
        fun fromViewId(id: Int): Visibility {
            if(id == R.id.publicRoom)
                return Visibility.Public
            if(id == R.id.privateRoom)
                return Visibility.Private
            return Visibility.Protected
        }
        fun fromNameIgnoreCase(input: String) = values().first { it.name.equals(input, true) }
    }

}

class GameRoom(val name:String, val id:String, val visibility: Visibility, var players: Array<String>, var hasStarted : Boolean){
    fun getPlayersNames():String {
        var names = ""
        for (player in players){
            names= "$names$player, "
        }
        return names
    }
}


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
        updateGameList();
        binding.roomType.check(R.id.publicRoom)
        binding.roomType.setOnCheckedChangeListener { radioGroup, i ->
            Log.i("Radio", i.toString())
            when (radioGroup.checkedRadioButtonId) {
                R.id.publicRoom -> binding.createPassword.visibility=View.INVISIBLE
                R.id.privateRoom -> binding.createPassword.visibility=View.INVISIBLE
                R.id.protectedRoom -> binding.createPassword.visibility=View.VISIBLE
            }
        }
        binding.createBtn.setOnClickListener{
            createRoom();
        }
    }


    private fun updateGameList(){
        SocketHandler.getSocket().once("Game Room List Response"){ args ->
            if(args[0] != null){
                val list = args[0] as JSONArray;
                gameList= arrayListOf();
                for (i in 0 until list.length()) {
                    val gameRoom = list.getJSONObject(i)
                    val playersArray = gameRoom.get("players") as JSONArray
                    var players = arrayOf<String>()
                    for (j in 0 until playersArray.length()){
                        players=players.plus(playersArray.get(j) as String)
                    }
                    gameList.add(GameRoom(gameRoom.get("name") as String, gameRoom.get("id") as String, Visibility.fromNameIgnoreCase(gameRoom.get("visibility") as String), players , gameRoom.get("isStarted") as Boolean))
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
            val status = if(gameRoom.hasStarted) "Started" else "Waiting for players"
            btn.text = gameRoom.name +" | "+gameRoom.visibility + " | "+ gameRoom.getPlayersNames()+ " | " + status;
            btn.id = i;
            btn.textSize= 18F;
            btn.setOnClickListener{
                if(gameRoom.visibility!=Visibility.Protected) {
                    joinRoom(gameRoom, null)
                }else{
                    showPasswordPrompt(gameRoom)
                }
            }
            gameListView.addView(btn)
        }
    }

    private fun joinRoom(gameRoom: GameRoom, password: String?){
        SocketHandler.getSocket().once("Join Room Response"){ args ->
            if(args[0] != null){
                val errorMessage = when(args[0] as String){
                    "0" -> R.string.NO_ERROR
                    "ROOM-2" -> R.string.ROOM_PASSWORD_INCORRECT
                    "ROOM-3" -> R.string.JOIN_REQUEST_REFUSED
                    "ROOM-4" -> R.string.ROOM_IS_FULL
                    else -> R.string.ERROR
                }
                activity?.runOnUiThread(Runnable {
                    if(errorMessage == R.string.NO_ERROR){
                        GameRoomModel.initialise(gameRoom)
                        findNavController().navigate(R.id.action_gameListFragment_to_gameRoomFragment)
                    }else{
                    val appContext = context?.applicationContext
                    Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Join Game Room", gameRoom.id, password)
        if(gameRoom.visibility==Visibility.Private)
            showCancelPrompt();
    }

    private fun createRoom(){
        val roomType =  Visibility.fromViewId(binding.roomType.checkedRadioButtonId);
        val roomName = binding.name.text.toString().trim();
        val roomPassword = binding.createPassword.text.toString().trim();
        if(roomName.isEmpty() || (roomType==Visibility.Protected && roomPassword.isEmpty())){
            val appContext = context?.applicationContext ?: return
            Toast.makeText(appContext, R.string.FIELD_EMPTY, Toast.LENGTH_LONG).show()
        }
        else{
            binding.name.setText("")
            binding.createPassword.setText("")
            SocketHandler.getSocket().once("Room Creation Response") {args ->
                if(args[0] != null){
                    val errorMessage = when(args[0] as String){
                        "0" -> R.string.NO_ERROR
                        "ROOM-1" -> R.string.ROOM_NAME_TAKEN;
                        else -> R.string.ERROR
                    }
                    activity?.runOnUiThread(Runnable {
                        if(errorMessage == R.string.NO_ERROR){
                            GameRoomModel.initialise(GameRoom(roomName,"-1", roomType, arrayOf(),false))
                            findNavController().navigate(R.id.action_gameListFragment_to_gameRoomFragment )
                        }else{
                            val appContext = context?.applicationContext
                            Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                        }
                    });
                }
            }
            SocketHandler.getSocket().emit("Create Game Room", roomName, roomType, roomPassword.trim())
        }
    }
    private fun showPasswordPrompt(gameRoom: GameRoom) {
        binding.createSection.visibility = View.GONE
        binding.gameListSection.visibility = View.GONE;
        binding.passwordSection.visibility = View.VISIBLE;
        binding.joinButton.setOnClickListener {
            val password = binding.password.text.toString().trim()
            if (password.isNotEmpty()) {
                binding.passwordSection.visibility = View.GONE;
                binding.joinButton.setOnClickListener(null);
                binding.gameListSection.visibility = View.VISIBLE;
                binding.createSection.visibility = View.VISIBLE
                joinRoom(gameRoom, password.trim())
            }
        }
    }

    private fun showCancelPrompt(){
        binding.createSection.visibility = View.GONE
        binding.gameListSection.visibility = View.GONE;
        binding.cancelSection.visibility=View.VISIBLE;
        binding.cancelButton.setOnClickListener {
            binding.cancelSection.visibility=View.GONE;
            binding.cancelButton.setOnClickListener(null);
            binding.gameListSection.visibility=View.VISIBLE;
            binding.createSection.visibility=View.VISIBLE
            SocketHandler.getSocket().emit("Cancel Join Request")
            SocketHandler.getSocket().off("Join Room Response")
        }

    }


}
