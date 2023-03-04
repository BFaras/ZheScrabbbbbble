package com.example.testchatbox.chat

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import com.example.testchatbox.MainActivity
import com.example.testchatbox.R
import com.example.testchatbox.databinding.FragmentManageChatBinding
import java.util.*


class ManageChatFragment : Fragment(), ObserverChat {

    private var _binding: FragmentManageChatBinding? = null
    private val binding get() = _binding!!

    private var chatList = ChatModel.getList();
    private var publicChatList = ChatModel.getPublicList();


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
        return inflater.inflate(R.layout.fragment_manage_chat, container, false)
    }


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState);
        ChatModel.addObserver(this);
        ChatModel.updatePublicList();
        binding.reloadChats.setOnClickListener{
            loadList()
        }
        binding.reloadPublicChat.setOnClickListener{
            loadPublicList()
        }
        binding.createChat.setOnClickListener {
            val name = binding.chatName.text.toString().trim()
            if(name !=null) {
                ChatModel.createPublicChat(name);
            }
        }
        loadList();
        loadPublicList();




    }

    private fun loadList(){
        chatList = ChatModel.getList();
        val chatListView = binding.chatList;
        chatListView.removeAllViews()
        for((i, chat) in chatList.withIndex()){
            if (chat.chatType==ChatType.PUBLIC){
                val btn = Button((activity as MainActivity?)!!)
                btn.text = chat.chatName;
                btn.id = i;
                btn.textSize= 30F;
                btn.setOnClickListener{
                    if(ChatModel.leaveChat(chatList[i]._id)) {
                        loadPublicList();
                        loadList();
                    }
                }
                chatListView.addView(btn)
            }
        }
    }

    private fun loadPublicList(){
        publicChatList = ChatModel.getList();
        val chatListView = binding.publicChatList;
        chatListView.removeAllViews()
        for((i, chat) in publicChatList.withIndex()){
            if (chat.chatType==ChatType.PUBLIC){
                val btn = Button((activity as MainActivity?)!!)
                btn.text = chat.chatName;
                btn.id = i;
                btn.textSize= 30F;
                btn.setOnClickListener{
                    ChatModel.joinPublicList(publicChatList[i]._id)
                }
                chatListView.addView(btn)
            }
        }
    }

    override fun updateMessage(chatCode: String) {}

    override fun updateChannels() {
        loadList();
    }

    override fun updatePublicChannels() {
        loadPublicList()
    }

}
