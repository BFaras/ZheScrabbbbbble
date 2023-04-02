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

data class Friend(val username:String, var connectionStatus: ConnectionStatus)


class FriendsFragment : Fragment() {

    private var friendList = arrayListOf<Friend>()

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
        updateFriendList()
        binding.friendCode.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                hideKeyboard()
            }
        }
        binding.add.setOnClickListener {
            if(binding.friendCode.text.isNotBlank())
                addFriend()
        }
        SocketHandler.getSocket().on("Update friend status"){args->
            if(args[0] != null && args[1] !=null){
                updateStatus(args[1] as String, ConnectionStatus.fromInt(args[0] as Int))
            }
        }
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
                        updateFriendList()
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

    private fun updateFriendList(){
        SocketHandler.getSocket().once("Friend List Response"){args->
            try{
                friendList = arrayListOf()
                Log.i("friend", args[0].toString())
                val friends = args[0] as JSONArray
                for (i in 0 until friends.length()){
                    val friend = friends.get(i) as JSONObject
                    friendList.add(Friend(friend.get("username") as String, ConnectionStatus.fromInt(friend.get("status") as Int)))
                }
            }catch(e:Exception){
                activity?.runOnUiThread(Runnable {
                    updateView()
                });
            }
        }
        SocketHandler.getSocket().emit("Get Friend List")
    }

    @SuppressLint("MissingInflatedId")
    private fun updateView(){
        val friendListView = binding.friendList;
        friendListView.removeAllViews()
        for(friend in friendList){
            val friendLayout = layoutInflater.inflate(R.layout.friend_layout, friendListView, false)
            val friendName = friendLayout.findViewById<TextView>(R.id.friendName)
            val friendStatus = friendName.findViewById<TextView>(R.id.friendStatus)

            friendName.text = friend.username
            friendStatus.text = friend.connectionStatus.toString()

//            val friendText = TextView((activity as MainActivity?)!!)
//            friendText.text = friend.username  +" | " +friend.connectionStatus;
//            friendText.textSize= 18F;
            friendListView.addView(friendLayout)
        }
    }
    private fun updateStatus(username: String, status: ConnectionStatus){
        for(friend in friendList){
            if(friend.username==username){
                friend.connectionStatus=status;
                break;
            }
        }
        activity?.runOnUiThread(Runnable {
            updateView()
        });
    }
    private fun hideKeyboard() {
        val imm = context!!.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.toggleSoftInput(InputMethodManager.HIDE_IMPLICIT_ONLY, 0)
    }
}
