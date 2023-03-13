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
import org.json.JSONArray
import java.util.*
import kotlin.collections.ArrayList


class GameRoomFragment : Fragment(), Observer {

    private var _binding: FragmentGameRoomBinding? = null
    private val binding get() = _binding!!

    private var players = arrayOf<String>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {
            players = it.getStringArray("players") as Array<String>
        }
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
        updateNames();
        binding.leave.setOnClickListener {
            SocketHandler.getSocket().emit("Leave Game Room")
            findNavController().navigate(R.id.action_gameRoomFragment_to_MainMenuFragment)
        }
        binding.startGame.setOnClickListener {
            SocketHandler.getSocket().emit("Start Game")
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
            //TODO : Go to game page
                Log.i("TODO", "Go to game page")
            updateNames()
        });
    }

    private fun updateNames(){
        val playerView = arrayOf(binding.player1,binding.player2, binding.player3, binding.player4)
        for(i in 0..3){
            if(i<players.size)
                playerView[i].text = players[i];
            else
                playerView[i].text = "";
        }
    }


}
