package com.example.testchatbox

import SocketHandler
import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.media.MediaPlayer
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.text.HtmlCompat
import androidx.fragment.app.Fragment
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

enum class GameType{
    Classic,
    Coop;

    companion object {
        fun fromInt(value: Int) = GameType.values().first { it.ordinal == value }
        fun fromViewId(id: Int): GameType {
            if(id == R.id.coopGame)
                return GameType.Coop
            return GameType.Classic
        }
        fun fromBool(isCoop:Boolean): GameType {
            if(isCoop)return GameType.Coop
            return  GameType.Classic
        }
        fun fromNameIgnoreCase(input: String) = values().first { it.name.equals(input, true) }
    }

}

class GameRoom(val name:String, val id:String, val visibility: Visibility, var players: Array<String>, var hasStarted : Boolean, val gameType: GameType, var nbObservers:Int){
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
    private var isChatIconChanged = false;
    private var notifSound: MediaPlayer? = null;

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
        setupChatNotifs(view.context)
        binding.buttonchat.setOnClickListener {
            findNavController().navigate(R.id.action_gameListFragment_to_ChatFragment)
        }
        binding.buttonfriends.setOnClickListener {
            findNavController().navigate(R.id.action_gameListFragment_to_friendsFragment)
        }
        binding.roomType.check(R.id.publicRoom)
        binding.gameType.check(R.id.classicGame)
        binding.roomType.setOnCheckedChangeListener { radioGroup, i ->
            Log.i("Radio", i.toString())
            when (radioGroup.checkedRadioButtonId) {
                R.id.publicRoom -> binding.createPassword.visibility=View.GONE
                R.id.privateRoom -> binding.createPassword.visibility=View.GONE
                R.id.protectedRoom -> binding.createPassword.visibility=View.VISIBLE
            }
        }
        val username = arguments?.getString("username");
        if(username!=null){
            binding.gameListSection.visibility=View.GONE;
            binding.createBtn.setOnClickListener{
                createRoom();
                SocketHandler.getSocket().emit("Invite Friend To Game", username);
            }
        }else{

            binding.createBtn.setOnClickListener{
                createRoom();
            }
            updateGameList();
            SocketHandler.getSocket().on("Game Room List Response"){ args ->
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
                        gameList.add(GameRoom(gameRoom.get("name") as String, gameRoom.get("id") as String, Visibility.fromNameIgnoreCase(gameRoom.get("visibility") as String), players , gameRoom.get("isStarted") as Boolean, GameType.fromBool(gameRoom.get("isCoop") as Boolean), gameRoom.get("nbObservers") as Int))
                    }
                    activity?.runOnUiThread(Runnable {
                        loadListView();
                    });
                }
            }
        }
    }


    private fun updateGameList(){
        SocketHandler.getSocket().emit("Get Game Room List")
    }

    @SuppressLint("MissingInflatedId")
    private fun loadListView(){
        val gameListView = binding.gameList;
        gameListView.removeAllViews()
        for((i, gameRoom) in gameList.withIndex()){
            var countPlayers = 0
            Log.d("PLAYERS IN ROOM", gameRoom.getPlayersNames())
            val gameRoomInfo = layoutInflater.inflate(R.layout.gameroom_info, gameListView, false)
            val roomName: TextView = gameRoomInfo.findViewById(R.id.gameRoomName)
            val roomVisibiliy: TextView = gameRoomInfo.findViewById(R.id.roomVisibility)
            val roomStatus: TextView = gameRoomInfo.findViewById(R.id.roomStatus)
            val roomHost: TextView = gameRoomInfo.findViewById(R.id.hostName)
            val numberOfPlayers: TextView = gameRoomInfo.findViewById(R.id.numberPlayers)

            roomName.text = gameRoom.name.lowercase()
            roomVisibiliy.text = gameRoom.visibility.toString().lowercase()
            when (roomVisibiliy.text) {
                "public" -> { roomVisibiliy.setTextColor(Color.GREEN) }
                "private" -> { roomVisibiliy.setTextColor(Color.RED) }
                "protected" -> { roomVisibiliy.setTextColor(Color.YELLOW) }
                else -> {}
            }
            when (LoggedInUser.getLang()) {
                "fr" -> roomStatus.text = if(gameRoom.hasStarted) "commencé" else "en attente de joueurs"
                "en" -> roomStatus.text = if(gameRoom.hasStarted) "started" else "waiting for players"
                else -> {}
            }
            val players = gameRoom.getPlayersNames().split(",".toRegex()).toTypedArray()
            roomHost.text = players[0]
            Log.d("ROOM ", players.toString())
            for (player in players) {
                if (player != " ") countPlayers++
            }
            numberOfPlayers.setText(HtmlCompat.fromHtml(getString(R.string.numberPlayers, countPlayers.toString()), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
//            for (playerInRoom in players){
//                if (playerInRoom != " ") {
//                    val player = TextView(context)
//                    player.text = playerInRoom
//                    roomPlayersList.addView(player)
//                }
//            }

            gameRoomInfo.id = i
            gameRoomInfo.setOnClickListener{
                askObserver(gameRoom)
            }
            gameListView.addView(gameRoomInfo)
//            val btn = Button((activity as MainActivity?)!!)
//            val status = if(gameRoom.hasStarted) "Started" else "Waiting for players"
//            btn.text = gameRoom.name +" | "+gameRoom.visibility + " | "+ gameRoom.getPlayersNames()+ " | " + status;
//            btn.id = i;
//            btn.textSize= 18F;
//            btn.setOnClickListener{
//                askObserver(gameRoom)
//            }
//            gameListView.addView(btn)
        }
    }


    private fun askObserver(gameRoom: GameRoom){
        binding.createSection.visibility = View.GONE
        binding.gameListSection.visibility = View.GONE;
        binding.observerSection.visibility = View.VISIBLE;
        if(gameRoom.hasStarted){
            binding.playerButton.visibility=View.GONE
        }
        else{
            binding.playerButton.visibility=View.VISIBLE
            binding.playerButton.setOnClickListener{
                binding.observerSection.visibility = View.GONE;
                binding.cancelObserverButton.setOnClickListener(null);
                binding.observerButton.setOnClickListener(null);
                binding.playerButton.setOnClickListener(null);
                binding.gameListSection.visibility = View.VISIBLE;
                binding.createSection.visibility = View.VISIBLE;
                if(gameRoom.visibility!=Visibility.Protected) {
                    joinRoom(gameRoom, false,null)
                }else{
                    showPasswordPrompt(gameRoom, false)
                }
            }
        }
        binding.cancelObserverButton.setOnClickListener {
            binding.observerSection.visibility = View.GONE;
            binding.cancelObserverButton.setOnClickListener(null);
            binding.observerButton.setOnClickListener(null);
            binding.playerButton.setOnClickListener(null);
            binding.gameListSection.visibility = View.VISIBLE;
            binding.createSection.visibility = View.VISIBLE;
        }
        binding.observerButton.setOnClickListener {
            binding.observerSection.visibility = View.GONE;
            binding.cancelObserverButton.setOnClickListener(null);
            binding.observerButton.setOnClickListener(null);
            binding.playerButton.setOnClickListener(null);
            binding.gameListSection.visibility = View.VISIBLE;
            binding.createSection.visibility = View.VISIBLE;
            if(gameRoom.visibility!=Visibility.Protected) {
                joinRoom(gameRoom, true,null)
            }else{
                showPasswordPrompt(gameRoom, true)
            }
        }
    }

    private fun joinRoom(gameRoom: GameRoom, observer:Boolean, password: String?){
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
                        GameRoomModel.initialise(gameRoom, observer)
                        findNavController().navigate(R.id.action_gameListFragment_to_gameRoomFragment)
                    }else{
                    val appContext = context?.applicationContext
                    Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Join Game Room", gameRoom.id, observer, password)
        if(gameRoom.visibility==Visibility.Private)
            showCancelPrompt();
    }

    private fun createRoom(){
        val roomType =  Visibility.fromViewId(binding.roomType.checkedRadioButtonId);
        val gameType =  GameType.fromViewId(binding.gameType.checkedRadioButtonId);
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
                        if(errorMessage == R.string.NO_ERROR && args[1]!=null){
                            GameRoomModel.initialise(GameRoom(roomName,args[1] as String, roomType, arrayOf(),false, gameType, 0), false)
                            findNavController().navigate(R.id.action_gameListFragment_to_gameRoomFragment )
                        }else{
                            val appContext = context?.applicationContext
                            Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                        }
                    });
                }
            }
            SocketHandler.getSocket().emit("Create Game Room", roomName, roomType, roomPassword.trim(), gameType)
        }
    }
    private fun showPasswordPrompt(gameRoom: GameRoom, observer: Boolean) {
        binding.createSection.visibility = View.GONE
        binding.gameListSection.visibility = View.GONE;
        binding.passwordSection.visibility = View.VISIBLE;
        binding.joinButton.setOnClickListener {
            val password = binding.password.text.toString().trim()
            if (password.isNotEmpty()) {
                binding.passwordSection.visibility = View.GONE;
                binding.joinButton.setOnClickListener(null);
                binding.cancelProtectedButton.setOnClickListener(null);
                binding.gameListSection.visibility = View.VISIBLE;
                binding.createSection.visibility = View.VISIBLE
                joinRoom(gameRoom, observer,password.trim())
            }
        }
        binding.cancelProtectedButton.setOnClickListener {
            binding.passwordSection.visibility = View.GONE;
            binding.joinButton.setOnClickListener(null);
            binding.cancelProtectedButton.setOnClickListener(null);
            binding.gameListSection.visibility = View.VISIBLE;
            binding.createSection.visibility = View.VISIBLE
        }
    }

    private fun showCancelPrompt(){
        binding.createSection.visibility = View.GONE
        binding.gameListSection.visibility = View.GONE;
        binding.cancelSection.visibility=View.VISIBLE;
        binding.cancelPrivateButton.setOnClickListener {
            binding.cancelSection.visibility=View.GONE;
            binding.cancelPrivateButton.setOnClickListener(null);
            binding.gameListSection.visibility=View.VISIBLE;
            binding.createSection.visibility=View.VISIBLE
            SocketHandler.getSocket().emit("Cancel Join Request")
            SocketHandler.getSocket().off("Join Room Response")
        }

    }

    override fun onStop() {
        super.onStop()
        NotificationInfoHolder.setFunctionOnMessageReceived(null);
        notifSound?.release()
    }

    fun setupChatNotifs(context: Context) {
        isChatIconChanged = false;
        NotificationInfoHolder.startObserverChat();
        NotificationInfoHolder.setFunctionOnMessageReceived(::playNotifSoundAndChangeIcon);
        notifSound = MediaPlayer.create(context, R.raw.ding)

        notifSound?.setOnCompletionListener { notifSound?.release() }

        if(NotificationInfoHolder.areChatsUnread())
            changeToNotifChatIcon();
    }

    fun playNotifSoundAndChangeIcon() {
        if (!isChatIconChanged) {
            changeToNotifChatIcon()
            notifSound?.start()
        }
    }

    fun changeToNotifChatIcon() {
        binding.buttonchat.setBackgroundResource(R.drawable.ic_chat_notif);
        isChatIconChanged = true;
    }
}
