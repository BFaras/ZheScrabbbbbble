package com.example.testchatbox.chat

import SocketHandler
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.fragment.app.Fragment
import com.example.testchatbox.MainActivity
import com.example.testchatbox.databinding.FragmentChatBinding
import com.example.testchatbox.login.model.LoggedInUser
import java.util.*


/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class ChatFragment : Fragment(), Observer {

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
        ChatModel.addObserver(this);
        binding.send.setOnClickListener {
            var text = binding.inputText.text.toString().trim();
            if(text.isNotEmpty()){
                val currentDate = Calendar.getInstance().time.toString().split(' ')[3];
                val userName = LoggedInUser.getName();
                binding.inputText.setText("");
                text = "$currentDate | $userName : $text";
                SocketHandler.getSocket().emit("New Chat Message", text, chatsList[selectedChatIndex]._id)
            }
        }
    }

    private fun loadChatMessages(){
        val messagesBox = binding.textView
        messagesBox.text = "";
        for(message in chatsList[selectedChatIndex].messages){
            messagesBox.append(message + System.getProperty("line.separator"))
        }
    }

    private fun loadList(){
        chatsList = ChatModel.getList();
        val chatListView = binding.chatList;
        var i=0;
        for(chat in chatsList){
            val btn = Button((activity as MainActivity?)!!)
            btn.text = chat.chatName;
            btn.id = i;
            i++;
            btn.textSize= 30F;
            btn.setOnClickListener{
                if(selectedChatIndex!=btn.id){
                    selectedChatIndex=btn.id;
                    loadChatMessages();
                }
            }
            chatListView.addView(btn)
        }
    }

    override fun update(chatCode: String) {
        loadList();
        if(chatsList[selectedChatIndex]._id == chatCode)
            loadChatMessages();
    }

}
