package com.example.testchatbox

import SocketHandler
import android.annotation.SuppressLint
import android.content.Context
import android.media.MediaPlayer
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
import com.google.android.material.imageview.ShapeableImageView
import org.json.JSONArray
import org.json.JSONObject
import java.util.*
import kotlin.collections.ArrayList


class GameRoomFragment : Fragment(), Observer {

    private var _binding: FragmentGameRoomBinding? = null
    private val binding get() = _binding!!
    private var isChatIconChanged = false;
    private var notifSound: MediaPlayer? = null;

    var avatars = mutableMapOf<String, String>()


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
        setupChatNotifs(view.context)
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
        binding.buttonfriends.setOnClickListener {
            findNavController().navigate(R.id.action_gameRoomFragment_to_friendsFragment)
        }
    }

    override fun onStart() {
        super.onStart()
        GameRoomModel.addObserver(this);
    }

    override fun onStop() {
        super.onStop()
        NotificationInfoHolder.setFunctionOnMessageReceived(null);
        NotificationInfoHolder.setFunctionOnChatDeleted(null);
        notifSound?.release()
        GameRoomModel.removeObserver(this);
    }

    override fun update() {
        SocketHandler.getSocket().emit("Get Avatars from Usernames", JSONArray(GameRoomModel.gameRoom?.players))
        activity?.runOnUiThread(Runnable {
            if(GameRoomModel.gameRoom!!.hasStarted)
                findNavController().navigate(R.id.action_gameRoomFragment_to_fullscreenFragment)
            if(GameRoomModel.joinRequest.isNotEmpty())
                showJoinSection()
            SocketHandler.getSocket().on("Avatars from Usernames Response") { args ->
                val avatarListJSON = args[0] as JSONObject
                Log.d("AVATARS JSON IN ROOM", args[0].toString())

                for (i in 0 until avatarListJSON.length()) {
                    avatars[avatarListJSON.names()?.getString(i) as String] = (avatarListJSON.names()?.getString(i)?.let { avatarListJSON.get(it) }) as String
                }
                activity?.runOnUiThread {
                    updateNames()
                }
            }
        });
    }

    @SuppressLint("MissingInflatedId")
    private fun updateNames(){
        binding.waitingPlayersList.removeAllViews()
        for (player in GameRoomModel.gameRoom!!.players) {
            val playerInfo =
                layoutInflater.inflate(R.layout.waiting_players, binding.waitingPlayersList, false)
            val playerName: TextView = playerInfo.findViewById(R.id.waitingPlayerName)
            val isOwner: ImageView = playerInfo.findViewById(R.id.isRoomOwner)
            val avatarPic = playerInfo.findViewById<ShapeableImageView>(R.id.avatar)
            isOwner.visibility = GONE
            playerName.text = player

            for ((name, avatar) in avatars) {
                if (name == player) {
                    if (resources.getIdentifier((avatar.dropLast(4)).lowercase(), "drawable", activity?.packageName) != 0) {
                        avatarPic.setImageResource(resources.getIdentifier((avatar.dropLast(4)).lowercase(), "drawable", activity?.packageName))
                    } else {
                        avatarPic.setImageResource(R.drawable.robot)
                    }
                }
            }

            if (player == GameRoomModel.gameRoom!!.players[0]) {
                isOwner.visibility = VISIBLE
            } else {
                isOwner.visibility = GONE
            }
            binding.waitingPlayersList.addView(playerInfo)
        }

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

    fun setupChatNotifs(context: Context) {
        isChatIconChanged = false;
        NotificationInfoHolder.startObserverChat();
        NotificationInfoHolder.setFunctionOnMessageReceived(::playNotifSoundAndChangeIcon);
        NotificationInfoHolder.setFunctionOnChatDeleted(::changeToNoNotifChatIcon);
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

    fun changeToNoNotifChatIcon() {
        if (isChatIconChanged) {
            binding.buttonchat.setBackgroundResource(R.drawable.ic_chat);
            isChatIconChanged = false;
        }
    }
}
