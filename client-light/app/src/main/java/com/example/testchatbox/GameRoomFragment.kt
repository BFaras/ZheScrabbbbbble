package com.example.testchatbox

import SocketHandler
import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.View.GONE
import android.view.View.VISIBLE
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.RelativeLayout
import android.widget.TextView
import androidx.core.text.HtmlCompat
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.chat.ChatModel
import com.example.testchatbox.databinding.FragmentGameListBinding
import com.example.testchatbox.databinding.FragmentGameRoomBinding
import com.example.testchatbox.login.model.LoggedInUser
import org.json.JSONArray
import java.util.*
import kotlin.collections.ArrayList


class GameRoomFragment : Fragment(), Observer {

    private var _binding: FragmentGameRoomBinding? = null
    private val binding get() = _binding!!
    private var isChatIconChanged = false;


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentGameRoomBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupChatNotifs()
        update();


        binding.leave.setOnClickListener {
            GameRoomModel.leaveRoom();
            SocketHandler.getSocket().emit("Leave Game Room")
            findNavController().navigate(R.id.action_gameRoomFragment_to_MainMenuFragment)
        }
        binding.startGame.setOnClickListener {
            SocketHandler.getSocket().emit("Start Game")
        }
        binding.buttonchat.setOnClickListener {
            findNavController().navigate(R.id.action_gameRoomFragment_to_ChatFragment)
        }
    }

    override fun onStart() {
        super.onStart()
        GameRoomModel.addObserver(this);
    }

    override fun onStop() {
        super.onStop()
        NotificationInfoHolder.setFunctionOnMessageReceived(null);
        GameRoomModel.removeObserver(this);
    }

    override fun update() {
        activity?.runOnUiThread(Runnable {
            if(GameRoomModel.gameRoom!!.hasStarted)
                findNavController().navigate(R.id.action_gameRoomFragment_to_fullscreenFragment)
            if(GameRoomModel.joinRequest.isNotEmpty())
                showJoinSection()
            updateNames()
        });
    }

    @SuppressLint("MissingInflatedId")
    private fun updateNames(){
        binding.roomName.text = GameRoomModel.gameRoom!!.name
        binding.waitingPlayersList.removeAllViews()
        for (player in GameRoomModel.gameRoom!!.players) {
            val playerInfo =
                layoutInflater.inflate(R.layout.waiting_players, binding.waitingPlayersList, false)
            val playerName: TextView = playerInfo.findViewById(R.id.waitingPlayerName)
            val isOwner: ImageView = playerInfo.findViewById(R.id.isRoomOwner)
            isOwner.visibility = GONE
            playerName.text = player

            if (player == GameRoomModel.gameRoom!!.players[0]) {
                isOwner.visibility = VISIBLE
            } else {
                isOwner.visibility = GONE
            }

            binding.waitingPlayersList.addView(playerInfo)
//            binding.startGame.visibility=View.VISIBLE
        }
//        for(i in 0..3){
//            if(i< GameRoomModel.gameRoom!!.players.size)
//                playerView[i].text = GameRoomModel.gameRoom!!.players[i];
//            else
//                playerView[i].text = "";
//        }
        if(LoggedInUser.getName()==GameRoomModel.gameRoom!!.players[0])
            binding.startGame.visibility = VISIBLE
    }

    private fun showJoinSection(){
        binding.joinSection.visibility=VISIBLE
        val playerJoin = GameRoomModel.joinRequest[0]
        binding.playerName.setText(HtmlCompat.fromHtml(getString(R.string.rejoindre, playerJoin), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
        //binding.playerName.text=GameRoomModel.joinRequest[0]+" "+binding.playerName.text
        binding.startGame.isClickable=false
        binding.leave.isClickable=false
        binding.cancelButton.setOnClickListener {
            hideJoinSection(false)
        }
        binding.acceptButton.setOnClickListener {
            hideJoinSection(true)
        }
    }
    private fun hideJoinSection(response: Boolean){
        SocketHandler.getSocket().emit("Join Request Response", response, GameRoomModel.joinRequest.removeAt(0))
        binding.joinSection.visibility=View.GONE
        binding.playerName.setText(R.string.rejoindre)
        binding.startGame.isClickable=true
        binding.cancelButton.setOnClickListener(null)
        binding.acceptButton.setOnClickListener(null)
        if (GameRoomModel.joinRequest.isNotEmpty()) showJoinSection()
    }

    fun setupChatNotifs() {
        isChatIconChanged = false;
        NotificationInfoHolder.startObserverChat();
        NotificationInfoHolder.setFunctionOnMessageReceived(::changeToNotifChatIcon);

        if(NotificationInfoHolder.areChatsUnread())
            changeToNotifChatIcon();
    }

    fun changeToNotifChatIcon() {
        if (!isChatIconChanged)
        {
            binding.buttonchat.setBackgroundResource(R.drawable.ic_chat_notif);
            isChatIconChanged = true;
        }
    }
}
