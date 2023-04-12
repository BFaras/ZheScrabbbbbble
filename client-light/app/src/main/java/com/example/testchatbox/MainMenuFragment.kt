package com.example.testchatbox

import NotificationInfoHolder
import SocketHandler
import android.content.Context
import android.media.MediaPlayer
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.core.text.HtmlCompat
import androidx.fragment.app.Fragment
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.chat.ChatModel
import com.example.testchatbox.chat.Message
import com.example.testchatbox.chat.ObserverChat
import com.example.testchatbox.databinding.FragmentMainMenuBinding
import com.example.testchatbox.login.model.LoggedInUser
import org.json.JSONArray


class MainMenuFragment : Fragment(), ObserverInvite {

private var _binding: FragmentMainMenuBinding? = null
    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    private var isChatIconChanged = false;
    private var notifSound: MediaPlayer? = null;

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
      _binding = FragmentMainMenuBinding.inflate(inflater, container, false)
      return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupChatNotifs(view.context)
        verifyIfInviteRequest();
        WindowInsetsControllerCompat(requireActivity().window, requireActivity().window.decorView).apply {
            // Hide both the status bar and the navigation bar
            hide(WindowInsetsCompat.Type.systemBars())
            hide(WindowInsetsCompat.Type.statusBars())
            // Behavior of system bars
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
        binding.textviewFirst.setText(HtmlCompat.fromHtml(getString(R.string.hello_message, LoggedInUser.getName()), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)

        binding.buttonchat.setOnClickListener {
            findNavController().navigate(R.id.action_MainMenuFragment_to_ChatFragment)
        }

        binding.buttonprofil.setOnClickListener {
            findNavController().navigate(R.id.action_MainMenuFragment_to_profileActivity)
        }

        binding.buttonfriends.setOnClickListener {
            findNavController().navigate(R.id.action_MainMenuFragment_to_friendsFragment)
        }

        binding.modeTournoi.setOnClickListener {
            findNavController().navigate(R.id.action_MainMenuFragment_to_queueFragment)
        }

        binding.modeClassique.setOnClickListener {
            findNavController().navigate(R.id.action_MainMenuFragment_to_gameListFragment)
        }

        binding.buttonDisconnect.setOnClickListener {
            SocketHandler.closeConnection();
            LoggedInUser.disconnectUser();
            NotificationInfoHolder.resetChatNotifs();
            ChatModel.resetChat()
            SocketHandler.establishConnection();
            findNavController().navigate(R.id.action_MainMenuFragment_to_loginActivity2)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    override fun onStart() {
        super.onStart()
        InviteService.addObserver(this);
    }

    override fun onStop() {
        super.onStop()
        NotificationInfoHolder.setFunctionOnMessageReceived(null);
        InviteService.removeObserver(this);
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

    private fun verifyIfInviteRequest(){
        val request = InviteService.getFirst() ?: return;
        if(binding.inviteSection.visibility==View.VISIBLE) return;
        binding.invitePrompt.text= request.username+ binding.invitePrompt.text;
        binding.inviteSection.visibility=View.VISIBLE;
        binding.rejectInvite.setOnClickListener {
            InviteService.rejectRequest();
            binding.inviteSection.visibility=View.GONE;
            verifyIfInviteRequest();
        }
        binding.acceptInvite.setOnClickListener {
            binding.inviteSection.visibility=View.GONE;
            SocketHandler.getSocket().emit("Join Friend Game", request.roomId)
            SocketHandler.getSocket().once("Join Room Response"){args->
                if(args[0]!=null){
                    val errorMessage = when(args[0] as String){
                        "0" -> R.string.NO_ERROR
                        "ROOM-4" -> R.string.ROOM_IS_FULL
                        "ROOM-5" -> R.string.ROOM_DELETED
                        "ROOM-6" -> R.string.GAME_STARTED
                        else -> R.string.ERROR
                    }
                    activity?.runOnUiThread(Runnable {
                        if(errorMessage == R.string.NO_ERROR ){
                            if(args[1]!=null){
                                var players= arrayOf<String>()
                                val playersArray = args[1] as JSONArray
                                for(i in 0 until playersArray.length()){
                                    players=players.plus(playersArray.getString(i))
                                }
                                InviteService.acceptRequest();
                                GameRoomModel.initialise(GameRoom("Name", request.roomId, Visibility.Public, players, hasStarted = false, request.gameType ,-1), false);
                                findNavController().navigate(R.id.action_MainMenuFragment_to_gameRoomFragment)
                            }
                        }else{
                            InviteService.rejectRequest();
                            val appContext = context?.applicationContext
                            Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                            verifyIfInviteRequest();
                        }
                    });
                }
            }

        }
    }

    override fun updateInvite() {
        activity?.runOnUiThread(Runnable {
            verifyIfInviteRequest();
        });
    }
}
