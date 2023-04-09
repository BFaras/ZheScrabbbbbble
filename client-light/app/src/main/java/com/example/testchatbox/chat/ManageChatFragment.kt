package com.example.testchatbox.chat

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.cardview.widget.CardView
import com.example.testchatbox.MainActivity
import com.example.testchatbox.R
import com.example.testchatbox.databinding.FragmentManageChatBinding
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.LinkedHashMap


class ManageChatFragment : Fragment(), ObserverChat {

    private var _binding: FragmentManageChatBinding? = null
    private val binding get() = _binding!!

    private var chatList = ChatModel.getList();
    private var publicChatList = ChatModel.getPublicList();
    private var chatButtons: ArrayList<CardView> = arrayListOf()
    private var publicChatButtons: ArrayList<CardView> = arrayListOf()
    private var searchJoinHasFocus = false;
    private var searchLeaveHasFocus = false;


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {

        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentManageChatBinding.inflate(inflater, container, false)
        return binding.root
    }


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState);
        binding.createChat.setOnClickListener {
            val name = binding.chatName.text.toString().trim()
            if(name.isNotEmpty()) {
                ChatModel.createPublicChat(name);
                binding.chatName.setText("");
                binding.chatName.clearFocus()
            }
        }

        binding.searchJoinChatBtn.setOnClickListener { searchChats(publicChatButtons, binding.searchJoinChat.text.toString()) }
        binding.searchLeaveChatBtn.setOnClickListener { searchChats(chatButtons, binding.searchLeaveChat.text.toString()) }

        binding.reloadChats.setOnClickListener {
            ChatModel.updatePublicList()
        }
        loadList();
        loadPublicList();
    }

    override fun onStart() {
        super.onStart()
        ChatModel.addObserver(this);
    }

    override fun onStop() {
        super.onStop()
        ChatModel.removeObserver(this);
    }

    private fun searchChats(chatRoomButtons: ArrayList<CardView>, chatSearchText: String) {
        for (chatRoomButton in chatRoomButtons) {
            val chatRoomName = chatRoomButton.findViewById<TextView>(R.id.chatbutton)
            val chatName: String = chatRoomName.text.toString()

            if (chatName.contains(chatSearchText))
            {
                chatRoomButton.visibility = View.VISIBLE
            }
            else
            {
                chatRoomButton.visibility = View.GONE
            }
        }
    }

    fun resetSearchBoxes() {
        binding.searchJoinChat.setText("")
        binding.searchJoinChat.clearFocus()
        binding.searchLeaveChat.setText("")
        binding.searchLeaveChat.clearFocus()
    }

    @SuppressLint("MissingInflatedId")
    private fun loadList(){
        resetSearchBoxes()
        chatList = ChatModel.getList();
        chatButtons = arrayListOf()
        val chatListView = binding.chatList;
        chatListView.removeAllViews()
        for((i, chat) in chatList.withIndex()){
            if (chat.chatType==ChatType.PUBLIC){
                val chatRoomLayout = layoutInflater.inflate(R.layout.joined_chat, chatListView, false)
                chatButtons.add(chatRoomLayout.findViewById<CardView>(R.id.chatButtonParent))
                val chatRoomName = chatRoomLayout.findViewById<TextView>(R.id.chatbutton)
                chatRoomName.text = chat.chatName
                chatRoomLayout.id = i
                chatRoomLayout.setOnClickListener{
                    ChatModel.leaveChat(chatList[i]._id)
                }
                chatListView.addView(chatRoomLayout)

//                val btn = Button((activity as MainActivity?)!!)
//                btn.text = chat.chatName;
//                btn.id = i;
//                btn.textSize= 30F;
//                btn.setOnClickListener{
//                    ChatModel.leaveChat(chatList[i]._id)
//                }
//                chatListView.addView(btn)
            }
        }
    }

    private fun loadPublicList(){
        resetSearchBoxes()
        publicChatList = ChatModel.getPublicList();
        publicChatButtons = arrayListOf()
        Log.i("list", publicChatList.toString());
        val chatListView = binding.publicChatList;
        chatListView.removeAllViews()
        for((i, chat) in publicChatList.withIndex()){
            if (chat.chatType==ChatType.PUBLIC) {
                val chatRoomLayout = layoutInflater.inflate(R.layout.joined_chat, chatListView, false)
                val chatRoomName = chatRoomLayout.findViewById<TextView>(R.id.chatbutton)
                publicChatButtons.add(chatRoomLayout.findViewById<CardView>(R.id.chatButtonParent))
                chatRoomName.text = chat.chatName
                chatRoomLayout.id = i
                chatRoomLayout.setOnClickListener{
                    ChatModel.joinPublicList(publicChatList[i]._id)
                }
                chatListView.addView(chatRoomLayout)

//                val btn = Button((activity as MainActivity?)!!)
//                btn.text = chat.chatName;
//                btn.id = i;
//                btn.textSize= 30F;
//                btn.setOnClickListener{
//                    ChatModel.joinPublicList(publicChatList[i]._id)
//                }
//                chatListView.addView(btn)
            }
        }
    }

    override fun updateMessage(chatCode: String, message: Message) {}

    override fun updateChannels() {
        activity?.runOnUiThread(Runnable {
            loadList();
        });
    }

    override fun updatePublicChannels() {
        activity?.runOnUiThread(Runnable {
            loadPublicList()
        });
    }

}
