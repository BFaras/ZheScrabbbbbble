package com.example.testchatbox

import SocketHandler
import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.widget.AppCompatButton
import androidx.core.os.bundleOf
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentFriendsBinding
import com.example.testchatbox.databinding.FragmentProfilBinding
import org.json.JSONArray
import org.json.JSONObject

enum class  ConnectionStatus{
    OFFLINE,
    ONLINE,
    INGAME;

    companion object {
        fun fromInt(value: Int) = ConnectionStatus.values().first { it.ordinal == value }
    }
}

data class Friend(var username:String, var connectionStatus: ConnectionStatus)


class FriendsFragment : Fragment(), ObserverFriend {

    private val friendList get() = FriendModel.friendList

    private var _binding: FragmentFriendsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentFriendsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        FriendModel.updateFriendList()

        binding.friendCode.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                hideKeyboard()
            }
        }
        binding.add.setOnClickListener {
            if(binding.friendCode.text.isNotBlank())
                addFriend()
        }

    }

    private fun updateView(){
        val friendListView = binding.friendListSection;
        friendListView.removeAllViews()
        val friends = friendList;
        Log.i("Friends", friends.toString())
        for(friend in friends){
            val friendText = AppCompatButton((activity as MainActivity?)!!)
            friendText.text = friend.username  +" | " +friend.connectionStatus.name;
            friendText.textSize= 18F;
            friendText.setOnClickListener {
                showActionMenu(friend.username);
            }
            friendListView.addView(friendText)
        }
    }

    override fun onStart() {
        super.onStart()
        FriendModel.addObserver(this);
    }

    override fun onStop() {
        super.onStop()
        FriendModel.removeObserver(this);
    }

    private fun addFriend() {
        SocketHandler.getSocket().once("Send Request Response"){args ->
            if(args[0] != null){
                val errorMessage = when(args[0] as String){
                    "0" -> R.string.NO_ERROR
                    "5" -> R.string.DATABASE_UNAVAILABLE
                    "FRIEND-1" -> R.string.WRONG_FRIEND_CODE
                    else -> R.string.ERROR
                }
                activity?.runOnUiThread(Runnable {
                    if(errorMessage == R.string.NO_ERROR ){
                        FriendModel.updateFriendList()
                        binding.friendCode.setText("")
                        binding.friendCode.clearFocus()
                    }else{
                        val appContext = context?.applicationContext
                        Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Send Friend Request", binding.friendCode.text.toString().trim())
    }

    private fun checkProfile(username: String){
        //TODO
    }

    private fun checkChat(username: String){
        val bundle = bundleOf("username" to username)
        findNavController().navigate(R.id.action_friendsFragment_to_ChatFragment, bundle)
    }

    private fun removeFriend(username: String){
        SocketHandler.getSocket().once("Remove Friend Response"){args ->
            if(args[0] != null){
                val errorMessage = when(args[0] as String){
                    "0" -> R.string.NO_ERROR
                    "5" -> R.string.DATABASE_UNAVAILABLE
                    else -> R.string.ERROR
                }
                activity?.runOnUiThread(Runnable {
                    if(errorMessage == R.string.NO_ERROR ){
                        FriendModel.removeFriend(username);
                        hideActionMenu();
                    }else{
                        val appContext = context?.applicationContext
                        Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Remove Friend", username)
    }

    private fun inviteToGame(username: String){
        //TODO
    }

    private fun showActionMenu(username: String){
        binding.actionMenuUsername.text=username;
        binding.actionMenu.visibility=View.VISIBLE;
        binding.closeBtn.setOnClickListener{
            hideActionMenu();
        }
        binding.joinBtn.setOnClickListener {
            val appContext = context?.applicationContext;
            Toast.makeText(appContext, "NOT IMPLEMENTED", Toast.LENGTH_LONG).show();
            hideActionMenu();
        }
        binding.removeBtn.setOnClickListener {
            removeFriend(username);
        }
        binding.chatBtn.setOnClickListener {
            checkChat(username);
        }
        binding.profileBtn.setOnClickListener {
            val appContext = context?.applicationContext;
            Toast.makeText(appContext, "NOT IMPLEMENTED", Toast.LENGTH_LONG).show();
            hideActionMenu();
        }
    }

    private  fun hideActionMenu(){
        binding.actionMenu.visibility=View.GONE;
        binding.removeBtn.setOnClickListener(null);
        binding.joinBtn.setOnClickListener(null);
        binding.chatBtn.setOnClickListener(null);
        binding.profileBtn.setOnClickListener (null);
        binding.closeBtn.setOnClickListener(null);
    }

    override fun update() {
        activity?.runOnUiThread(Runnable {
            updateView()
        });
    }

    override fun onModified(username: String, newUsername: String?) {
        activity?.runOnUiThread(Runnable {
            if(newUsername==null){
                val appContext = context?.applicationContext;
                Toast.makeText(appContext, username+getString(R.string.friendRemoved), Toast.LENGTH_LONG).show();
                if(binding.actionMenu.visibility==View.VISIBLE && binding.actionMenuUsername.text==username){
                    hideActionMenu();
                }
            }
            else{
                val appContext = context?.applicationContext;
                Toast.makeText(appContext, username+getString(R.string.friendModified)+newUsername, Toast.LENGTH_LONG).show();
                if(binding.actionMenu.visibility==View.VISIBLE && binding.actionMenuUsername.text==username){
                    binding.actionMenuUsername.text==newUsername
                }
            }
            updateView()
        });
    }
    private fun hideKeyboard() {
        val imm = context!!.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.toggleSoftInput(InputMethodManager.HIDE_IMPLICIT_ONLY, 0)
    }
}
