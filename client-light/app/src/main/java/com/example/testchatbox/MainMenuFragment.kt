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


class MainMenuFragment : Fragment() {

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
        NotificationInfoHolder.setFunctionOnMessageReceived(null);
        _binding = null
    }

    fun setupChatNotifs(context: Context) {
        isChatIconChanged = false;
        NotificationInfoHolder.startObserverChat();
        NotificationInfoHolder.setFunctionOnMessageReceived(::changeToNotifChatIcon);
        notifSound = MediaPlayer.create(context, R.raw.ding)

        notifSound?.setOnCompletionListener { notifSound?.release() }

        if(NotificationInfoHolder.areChatsUnread())
            changeToNotifChatIcon();
    }

    fun changeToNotifChatIcon() {
        if (!isChatIconChanged)
        {
            binding.buttonchat.setBackgroundResource(R.drawable.ic_chat_notif);
            notifSound?.start()
            isChatIconChanged = true;
        }
    }
}
