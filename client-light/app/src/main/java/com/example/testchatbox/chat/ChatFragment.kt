package com.example.testchatbox.chat

import SocketHandler
import android.content.Context
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.MainActivity
import com.example.testchatbox.R
import com.example.testchatbox.databinding.FragmentChatBinding
import com.example.testchatbox.login.model.LoggedInUser
import org.w3c.dom.Text
import java.util.*


/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class ChatFragment : Fragment(), ObserverChat {

    private var _binding: FragmentChatBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    private var selectedChatIndex : Int = 0;
    private var chatsList = ChatModel.getList();

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentChatBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState);
        loadList();
        selectedChatIndex=0;
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
    }

    override fun onStop() {
        super.onStop()
        ChatModel.removeObserver(this);
    }

    private fun loadChatMessages(){
        val messagesBox = binding.textView
        activity?.runOnUiThread(java.lang.Runnable {
            messagesBox.removeAllViews()
        })

        //messagesBox.text = "";
        for(message in chatsList[selectedChatIndex].messages){
            val messageContainer : View = if (message.username == LoggedInUser.getName()) {
                layoutInflater.inflate(R.layout.sent_message, messagesBox, false)
            } else {
                layoutInflater.inflate(R.layout.received_message, messagesBox, false)
            }

            val messageText: TextView = messageContainer.findViewById(R.id.textMessage)
            val usernameMessage: TextView = messageContainer.findViewById(R.id.usernameMessage)
            val timeStampMessage: TextView = messageContainer.findViewById(R.id.textDateTime)

            messageText.text = message.message
            usernameMessage.text = message.username
            timeStampMessage.text = message.timestamp

            activity?.runOnUiThread(java.lang.Runnable {
                messagesBox.addView(messageContainer)
            })

            //messagesBox.append(message.toString() + System.getProperty("line.separator"))

        }
        activity?.runOnUiThread {
            messagesBox.invalidate();
            messagesBox.requestLayout();
        };

    }

    private fun loadList(){
        chatsList = ChatModel.getList();
        val chatListView = binding.chatList;
        chatListView.removeAllViews()
        for((i, chat) in chatsList.withIndex()){
            val btn = layoutInflater.inflate(R.layout.chat_rooms_button, chatListView, false)
            val btnText: TextView = btn.findViewById(R.id.roomName)
            btnText.text = chat.chatName
            btn.id = i
            btn.setOnClickListener{
                if(selectedChatIndex!=btn.id){
                    selectedChatIndex=btn.id;
                    binding.chatRoomName.text = btnText.text
                    loadChatMessages();
                }
            }
            chatListView.addView(btn)
        }
    }

    override fun updateMessage(chatCode: String) {
        if(chatsList[selectedChatIndex]._id == chatCode)
            loadChatMessages();
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

}
