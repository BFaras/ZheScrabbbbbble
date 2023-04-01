package com.example.testchatbox

import SocketHandler
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentBracketBinding
import com.example.testchatbox.databinding.FragmentQueueBinding


class BracketFragment : Fragment(), Observer {

    private var _binding: FragmentBracketBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentBracketBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        update();
        binding.quitBtn.setOnClickListener {
             leaveTournament()
        }
        binding.Semi1.setOnClickListener {
            if(TournamentModel.gamesData[0].status==GameStatus.IN_PROGRESS)
                observeGame(TournamentModel.gamesData[0].roomCode)
        }
        binding.Semi2.setOnClickListener {
            if(TournamentModel.gamesData[1].status==GameStatus.IN_PROGRESS)
                observeGame(TournamentModel.gamesData[1].roomCode)
        }
        binding.Final1.setOnClickListener {
            if(TournamentModel.gamesData[2].status==GameStatus.IN_PROGRESS)
                observeGame(TournamentModel.gamesData[2].roomCode)
        }
        binding.Final2.setOnClickListener {
            if(TournamentModel.gamesData[3].status==GameStatus.IN_PROGRESS)
                observeGame(TournamentModel.gamesData[3].roomCode)
        }
    }

    private fun leaveTournament(){
        TournamentModel.exitTournament();
        findNavController().navigate(R.id.action_bracketFragment_to_MainMenuFragment)
    }

    private fun observeGame(gameId:String){
        SocketHandler.getSocket().once("Join Room Response"){args->
            if(args[0] != null){
                val errorMessage = when(args[0] as String){
                    "0" -> R.string.NO_ERROR
                    "ROOM-2" -> R.string.ROOM_PASSWORD_INCORRECT
                    "ROOM-3" -> R.string.JOIN_REQUEST_REFUSED
                    "ROOM-4" -> R.string.ROOM_IS_FULL
                    else -> R.string.ERROR
                }
                activity?.runOnUiThread(Runnable {
                    if(errorMessage == R.string.NO_ERROR){
                        TournamentModel.populateGameRoomModel(gameId,true)
                        findNavController().navigate(R.id.action_bracketFragment_to_fullscreenFragment)
                    }else{
                        val appContext = context?.applicationContext
                        Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Join Game Room", gameId, true)
    }

    override fun update() {
        if(GameRoomModel.gameRoom!=null && GameRoomModel.gameRoom!!.hasStarted)
            findNavController().navigate(R.id.action_bracketFragment_to_fullscreenFragment);
        if(TournamentModel.tournamentTimer.phase==2)
            findNavController().navigate(R.id.action_bracketFragment_to_rankingFragment)
        //TODO : Update UI
    }

    override fun onStart() {
        super.onStart()
        TournamentModel.addObserver(this);
    }

    override fun onStop() {
        super.onStop()
        TournamentModel.removeObserver(this);
    }

}
