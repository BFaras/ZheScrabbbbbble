package com.example.testchatbox

import SocketHandler
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.chat.ChatModel
import com.example.testchatbox.databinding.FragmentGameListBinding
import com.example.testchatbox.databinding.FragmentGameRoomBinding
import com.example.testchatbox.login.model.LoggedInUser
import org.json.JSONArray
import java.util.*
import kotlin.collections.ArrayList


class GameRoomFragment : Fragment(), Observer {

    private var _binding: FragmentGameRoomBinding? = null
    private val binding get() = _binding!!


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentGameRoomBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        update();
        binding.leave.setOnClickListener {
            GameRoomModel.leaveRoom();
            SocketHandler.getSocket().emit("Leave Game Room")
            findNavController().navigate(R.id.action_gameRoomFragment_to_MainMenuFragment)
        }
        binding.startGame.setOnClickListener {
            SocketHandler.getSocket().emit("Start Game")
        }
        binding.buttonchat.setOnClickListener {
            findNavController().navigate(R.id.action_gameRoomFragment_to_ChatFragment)
        }
    }

    override fun onStart() {
        super.onStart()
        GameRoomModel.addObserver(this);
    }

    override fun onStop() {
        super.onStop()
        GameRoomModel.removeObserver(this);
    }

    override fun update() {
        activity?.runOnUiThread(Runnable {
            if(GameRoomModel.gameRoom!!.hasStarted)
                findNavController().navigate(R.id.action_gameRoomFragment_to_fullscreenFragment)
            if(GameRoomModel.joinRequest.isNotEmpty())
                showJoinSection()
            updateNames()
        });
    }

    private fun updateNames(){
        val playerView = arrayOf(binding.player1,binding.player2, binding.player3, binding.player4)
        for(i in 0..3){
            if(i< GameRoomModel.gameRoom!!.players.size)
                playerView[i].text = GameRoomModel.gameRoom!!.players[i];
            else
                playerView[i].text = "";
        }
        if(LoggedInUser.getName()==GameRoomModel.gameRoom!!.players[0])
            binding.startGame.visibility=View.VISIBLE
    }

    private fun showJoinSection(){
        binding.joinSection.visibility=View.VISIBLE
        binding.playerName.text=GameRoomModel.joinRequest[0]+" "+binding.playerName.text
        binding.startGame.isClickable=false
        binding.cancelButton.setOnClickListener {
            hideJoinSection(false)
        }
        binding.acceptButton.setOnClickListener {
            hideJoinSection(true)
        }
    }
    private fun hideJoinSection(response: Boolean){
        SocketHandler.getSocket().emit("Join Request Response", response, GameRoomModel.joinRequest.removeAt(0))
        binding.joinSection.visibility=View.GONE
        binding.playerName.setText(R.string.rejoindre)
        binding.startGame.isClickable=true
        binding.cancelButton.setOnClickListener(null)
        binding.acceptButton.setOnClickListener(null)
        if (GameRoomModel.joinRequest.isNotEmpty()) showJoinSection()
    }


}