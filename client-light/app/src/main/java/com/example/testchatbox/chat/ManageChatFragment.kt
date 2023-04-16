package com.example.testchatbox.chat

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.TextView
import androidx.cardview.widget.CardView
import androidx.core.widget.addTextChangedListener
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
    private var searchJoinTextWatcher: TextWatcher? = null
    private var searchLeaveTextWatcher: TextWatcher? = null


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
        ChatModel.updatePublicList()
        ChatModel.updateList()
        super.onViewCreated(view, savedInstanceState);
        binding.createChat.setOnClickListener {
            val name = binding.chatName.text.toString().trim()
            if(name.isNotEmpty()) {
                ChatModel.createPublicChat(name);
                binding.chatName.setText("");
                binding.chatName.clearFocus()
            }
        }

        binding.chatName.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                hideKeyboard()
            }
        }

        initializeSearchBars()
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
        freeSearchBarsResources()
        ChatModel.removeObserver(this);
    }

    @SuppressLint("MissingInflatedId")
    private fun loadList(){
        resetSearchBoxes()
        chatList = ChatModel.getList();
        Log.i("Chats", chatList.toString())
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
                    if(chat.isOwner==true) askDelete(chatList[i]._id);
                    else ChatModel.leaveChat(chatList[i]._id);
                }
                chatListView.addView(chatRoomLayout)
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
            }
        }
    }

    private fun initializeSearchBars() {
        searchJoinTextWatcher = createSearchJoinTextWatcher()
        searchLeaveTextWatcher = createSearchLeaveTextWatcher()
        binding.searchJoinChat.addTextChangedListener(searchJoinTextWatcher)
        binding.searchLeaveChat.addTextChangedListener(searchLeaveTextWatcher)
    }

    private fun freeSearchBarsResources() {
        binding.searchJoinChat.removeTextChangedListener(searchJoinTextWatcher)
        binding.searchLeaveChat.removeTextChangedListener(searchLeaveTextWatcher)
        searchJoinTextWatcher = null
        searchLeaveTextWatcher = null
    }

    private fun createSearchJoinTextWatcher(): TextWatcher {
        return object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
            }
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                searchChats(publicChatButtons, binding.searchJoinChat.text.toString())
            }
        }
    }

    private fun createSearchLeaveTextWatcher(): TextWatcher {
        return object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
            }
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                searchChats(chatButtons, binding.searchLeaveChat.text.toString())
            }
        }
    }

    private fun searchChats(chatRoomButtons: ArrayList<CardView>, chatSearchText: String) {
        val lowerCaseSearchText = chatSearchText.lowercase()

        for (chatRoomButton in chatRoomButtons) {
            val chatRoomName = chatRoomButton.findViewById<TextView>(R.id.chatbutton)
            val chatName: String = chatRoomName.text.toString().lowercase()

            if (chatName.contains(lowerCaseSearchText))
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
    private fun hideKeyboard() {
        val imm = context!!.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.toggleSoftInput(InputMethodManager.HIDE_IMPLICIT_ONLY, 0)
    }

    private fun askDelete(id:String){
        binding.deleteSection.visibility=View.VISIBLE;
        binding.rejectDelete.setOnClickListener {
            binding.deleteSection.visibility=View.GONE;
            binding.acceptDelete.setOnClickListener(null);
            binding.rejectDelete.setOnClickListener(null);
        }
        binding.acceptDelete.setOnClickListener {
            binding.deleteSection.visibility=View.GONE;
            binding.acceptDelete.setOnClickListener(null);
            binding.rejectDelete.setOnClickListener(null);
            ChatModel.leaveChat(id);
        }
    }

}
