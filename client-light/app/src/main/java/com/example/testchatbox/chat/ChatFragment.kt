package com.example.testchatbox.chat

import NotificationInfoHolder
import SocketHandler
import android.content.Context
import android.graphics.Color
import android.media.MediaPlayer
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.*
import com.example.testchatbox.databinding.FragmentChatBinding
import com.example.testchatbox.login.model.LoggedInUser
import com.google.android.material.imageview.ShapeableImageView
import org.json.JSONArray
import org.json.JSONObject
import org.w3c.dom.Text
import java.util.*
import kotlin.collections.LinkedHashMap


/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class ChatFragment : Fragment(), ObserverChat , ObserverInvite{

    private var _binding: FragmentChatBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    private var selectedChatIndex : Int = 0;
    private var chatsList = ChatModel.getList();
    private var chatRoomsNotifBubble: LinkedHashMap<String, ImageView> = LinkedHashMap<String, ImageView>();
    private var notifSound: MediaPlayer? = null;

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentChatBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState);
        notifSound = MediaPlayer.create(view.context, R.raw.ding)
        loadList();
        verifyIfInviteRequest();
        if ((arguments?.getString("username")!=null)) {
            selectedChatIndex = findIndexByUsername(arguments?.getString("username")!!)
            binding.chatRoomName.text = arguments?.getString("username")!!
        } else {
            selectedChatIndex = findIndexByUsername("Global")
            binding.chatRoomName.text = "Global"
        }
        binding.inputText.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                sendMessage()
            }
            false
        }
        binding.inputText.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                hideKeyboard()
            }
        }

        binding.send.setOnClickListener {
            sendMessage()
        }
        binding.ManageChats.setOnClickListener {
            findNavController().navigate(R.id.action_ChatFragment_to_manageChatFragment)
        }
        loadChatMessages();
    }

    private fun sendMessage() {
        val text = binding.inputText.text.toString().trim()
        if(text.isNotEmpty()){
            binding.inputText.setText("")
            SocketHandler.getSocket().emit("New Chat Message", text, chatsList[selectedChatIndex]._id)
            binding.scrollView.post { binding.scrollView.fullScroll(View.FOCUS_DOWN) }
            binding.inputText.clearFocus()
        }
    }


    override fun onStart() {
        super.onStart()
        ChatModel.addObserver(this);
        InviteService.addObserver(this);
        NotificationInfoHolder.changeSelectedChatCode(chatsList[selectedChatIndex]._id);
    }

    override fun onStop() {
        super.onStop()
        SocketHandler.getSocket().off("Chat History Response");
        ChatModel.removeObserver(this);
        InviteService.removeObserver(this);
        notifSound?.release()
        NotificationInfoHolder.changeSelectedChatCode("");
    }

    private fun loadChatMessages(){
        binding.chatProgress.visibility = View.VISIBLE
        SocketHandler.getSocket().once("Chat History Response"){ args ->
            val messageArray= args[0] as JSONArray
            val messagesBox = binding.textView
            activity?.runOnUiThread(java.lang.Runnable {
                messagesBox.removeAllViews()
            });
            try {
            for(i in 0 until messageArray.length()){
                val messageJSON = messageArray.get(i) as JSONObject
                val message = Message(messageJSON.get("username") as String, messageJSON.get("timestamp") as String, messageJSON.get("message") as String, messageJSON.get("avatar") as String)

                val messageContainer : View = if (message.username == LoggedInUser.getName()) {
                    layoutInflater.inflate(R.layout.sent_message, messagesBox, false)
                } else {
                    layoutInflater.inflate(R.layout.received_message, messagesBox, false)
                }

                val messageText: TextView = messageContainer.findViewById(R.id.textMessage)
                val usernameMessage: TextView = messageContainer.findViewById(R.id.usernameMessage)
                val timeStampMessage: TextView = messageContainer.findViewById(R.id.textDateTime)
                val avatar = messageContainer.findViewById<ShapeableImageView>(R.id.avatarProfile)

                messageText.text = message.message
                usernameMessage.text = message.username
                timeStampMessage.text = message.timestamp

                if (activity?.resources?.getIdentifier((message.avatar.dropLast(4)).lowercase(), "drawable", activity?.packageName) != 0) {
                    Log.d("AVATAR", message.avatar)
                    activity?.resources?.getIdentifier((message.avatar.dropLast(4)).lowercase(), "drawable", activity?.packageName)
                        ?.let { avatar.setImageResource(it) }
                } else {
                    avatar.setImageResource(R.drawable.robot)
                }

                activity?.runOnUiThread(java.lang.Runnable {
                    messagesBox.removeAllViews()
                })
                for(i in 0 until messageArray.length()){
                    val messageJSON = messageArray.get(i) as JSONObject
                    val message = Message(messageJSON.get("username") as String, messageJSON.get("timestamp") as String, messageJSON.get("message") as String, messageJSON.get("avatar") as String)

                    val messageContainer : View = if (message.username == LoggedInUser.getName()) {
                        layoutInflater.inflate(R.layout.sent_message, messagesBox, false)
                    } else {
                        layoutInflater.inflate(R.layout.received_message, messagesBox, false)
                    }

                    val messageText: TextView = messageContainer.findViewById(R.id.textMessage)
                    val usernameMessage: TextView = messageContainer.findViewById(R.id.usernameMessage)
                    val timeStampMessage: TextView = messageContainer.findViewById(R.id.textDateTime)
                    val avatar = messageContainer.findViewById<ShapeableImageView>(R.id.avatarProfile)

                    messageText.text = message.message
                    usernameMessage.text = message.username
                    timeStampMessage.text = message.timestamp

                    if (resources.getIdentifier((message.avatar.dropLast(4)).lowercase(), "drawable", activity?.packageName) != 0) {
                        Log.d("AVATAR", message.avatar)
                        avatar.setImageResource(resources.getIdentifier((message.avatar.dropLast(4)).lowercase(), "drawable", activity?.packageName))
                    } else {
                        avatar.setImageResource(R.drawable.robot)
                    }

                    activity?.runOnUiThread(java.lang.Runnable {
                        binding.chatProgress.visibility = View.GONE
                        messagesBox.addView(messageContainer)
                        binding.scrollView.post { binding.scrollView.fullScroll(View.FOCUS_DOWN) }
                    })
                }
                activity?.runOnUiThread(Runnable {
                    messagesBox.invalidate();
                    messagesBox.requestLayout();
                });
            }
            }catch(e:Exception){
                val appContext = context?.applicationContext
                if(appContext!=null)
                    Toast.makeText(appContext, e.toString(), Toast.LENGTH_LONG).show();
            }
        }
        binding.chatProgress.visibility = View.GONE
        SocketHandler.getSocket().emit("Get Chat History", chatsList[selectedChatIndex]._id)
    }

    private fun loadList(){
        chatsList = ChatModel.getList();
        val chatListView = binding.chatList;
        chatListView.removeAllViews()
        chatRoomsNotifBubble = LinkedHashMap<String, ImageView>()
        for((i, chat) in chatsList.withIndex()){
            val btn = layoutInflater.inflate(R.layout.chat_rooms_button, chatListView, false)
            val btnText: TextView = btn.findViewById(R.id.roomName)
            val notifIcon : ImageView = btn.findViewById(R.id.chatNotifBubble);
            btnText.text = chat.chatName
            btn.id = i

            if (selectedChatIndex!=btn.id && NotificationInfoHolder.isChatUnread(chat._id))
                notifIcon.visibility = View.VISIBLE;

            btn.setOnClickListener{
                if(selectedChatIndex!=btn.id){
                    selectedChatIndex=btn.id;
                    NotificationInfoHolder.changeSelectedChatCode(chatsList[selectedChatIndex]._id);
                    notifIcon.visibility = View.INVISIBLE;
                    binding.chatRoomName.text = btnText.text
                    loadChatMessages();
                }
            }
            chatListView.addView(btn)
            chatRoomsNotifBubble.set(chat._id, notifIcon);
        }
    }
    private fun addMessage(message:Message){
        val messagesBox = binding.textView
        val messageContainer : View = if (message.username == LoggedInUser.getName()) {
            layoutInflater.inflate(R.layout.sent_message, messagesBox, false)
        } else {
            layoutInflater.inflate(R.layout.received_message, messagesBox, false)
        }
        val messageText: TextView = messageContainer.findViewById(R.id.textMessage)
        val usernameMessage: TextView = messageContainer.findViewById(R.id.usernameMessage)
        val timeStampMessage: TextView = messageContainer.findViewById(R.id.textDateTime)
        val avatar = messageContainer.findViewById<ShapeableImageView>(R.id.avatarProfile)

        messageText.text = message.message
        usernameMessage.text = message.username
        timeStampMessage.text = message.timestamp

        if (activity?.resources?.getIdentifier((message.avatar.dropLast(4)).lowercase(), "drawable", activity?.packageName) != 0) {
            activity?.resources?.let { avatar.setImageResource(it.getIdentifier((message.avatar.dropLast(4)).lowercase(), "drawable", activity?.packageName)) }
        } else {
            avatar.setImageResource(R.drawable.robot)
        }

        activity?.runOnUiThread(java.lang.Runnable {
            messagesBox.addView(messageContainer)
            binding.scrollView.post { binding.scrollView.fullScroll(View.FOCUS_DOWN) }
        })
        activity?.runOnUiThread(Runnable {
            messagesBox.invalidate();
            messagesBox.requestLayout();
        });
    }


    override fun updateMessage(chatCode: String, message: Message) {
        if (message.username != LoggedInUser.getName()) {
            notifSound?.start()
        }

        if(chatsList[selectedChatIndex]._id == chatCode)
        {
            addMessage(message);
        }
        else {
            activity?.runOnUiThread(Runnable {
                for (roomEntry in chatRoomsNotifBubble) {
                    if (NotificationInfoHolder.isChatUnread(roomEntry.key))
                    {
                        chatRoomsNotifBubble.get(roomEntry.key)?.visibility = View.VISIBLE;
                    }
                }
            })
        }
    }

    override fun updateChannels() {
        activity?.runOnUiThread(Runnable {
            loadList();
        });
    }

    override fun updatePublicChannels() {}

    private fun hideKeyboard() {
        val imm = context!!.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.toggleSoftInput(InputMethodManager.HIDE_IMPLICIT_ONLY, 0)
    }

    private fun findIndexByUsername(username:String):Int{
        for((i,chat) in chatsList.withIndex()){
            if(chat.chatName==username)
                return i;
        }
        return 0;
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
                                findNavController().navigate(R.id.action_ChatFragment_to_gameRoomFragment)
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
