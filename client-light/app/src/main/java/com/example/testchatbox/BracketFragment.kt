package com.example.testchatbox

import SocketHandler
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.os.Bundle
import android.os.CountDownTimer
import android.util.Log
import android.util.TypedValue
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.widget.AppCompatButton
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentBracketBinding
import com.example.testchatbox.databinding.FragmentQueueBinding
import java.text.DecimalFormat
import java.text.NumberFormat


class BracketFragment : Fragment(), Observer {

    private var _binding: FragmentBracketBinding? = null
    private val binding get() = _binding!!
    private lateinit var timer: CountDownTimer

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentBracketBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        WindowInsetsControllerCompat(requireActivity().window, requireActivity().window.decorView).apply {
            // Hide both the status bar and the navigation bar
            hide(WindowInsetsCompat.Type.systemBars())
            hide(WindowInsetsCompat.Type.statusBars())
            // Behavior of system bars
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }

        binding.buttonchat.setOnClickListener {
            findNavController().navigate(R.id.action_bracketFragment_to_ChatFragment)
        }
        binding.buttonfriends.setOnClickListener {
            findNavController().navigate(R.id.action_bracketFragment_to_friendsFragment)
        }
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
        SocketHandler.getSocket().emit("Get Tournament Data")
    }

    private fun leaveTournament(){
        val builder = context?.let { it -> AlertDialog.Builder(it, R.style.CustomAlertDialog).create() }
        val alertView = layoutInflater.inflate(R.layout.alert_abandon, null)
        val yesButton = alertView.findViewById<AppCompatButton>(R.id.dialogYes)
        val noButton = alertView.findViewById<AppCompatButton>(R.id.dialogNo)
        builder?.setView(alertView)
        yesButton.setOnClickListener {
            TournamentModel.exitTournament();
            findNavController().navigate(R.id.action_bracketFragment_to_MainMenuFragment)
        }
        noButton.setOnClickListener {
            builder?.dismiss()
        }
        builder?.show()
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
        activity?.runOnUiThread(Runnable {
            if(GameRoomModel.gameRoom!=null && GameRoomModel.gameRoom!!.hasStarted)
                findNavController().navigate(R.id.action_bracketFragment_to_fullscreenFragment);
            if(TournamentModel.tournamentTimer.phase==2)
                findNavController().navigate(R.id.action_bracketFragment_to_rankingFragment)
            timer = setTimer(TournamentModel.tournamentTimer.timeRemaning.toLong()*1000)
            timer.cancel()
            timer.start()
            for (game in TournamentModel.gamesData) {
                Log.d("GAME TOURNAMENT", game.toString())
                when (game.type) {
                    "Semi1" -> {
                        binding.semi1player1.text = game.players[0]
                        binding.semi1player2.text = game.players[1]
                        if (game.status == GameStatus.FINISHED) {
                            when (game.winnerIndex) {
                                0 -> {
                                    binding.semi1player1.typeface = Typeface.DEFAULT_BOLD
                                    binding.semi1player1.paintFlags = Paint.UNDERLINE_TEXT_FLAG
                                }
                                1 -> {
                                    binding.semi1player2.typeface = Typeface.DEFAULT_BOLD
                                    binding.semi1player2.paintFlags = Paint.UNDERLINE_TEXT_FLAG
                                }
                                else -> {}
                            }
                        }
                    }
                    "Semi2" -> {
                        binding.semi2player1.text = game.players[0]
                        binding.semi2player2.text = game.players[1]
                        if (game.status == GameStatus.FINISHED){
                            when (game.winnerIndex) {
                                0 -> {
                                    binding.semi1player1.typeface = Typeface.DEFAULT_BOLD
                                    binding.semi1player1.paintFlags = Paint.UNDERLINE_TEXT_FLAG
                                }
                                1 -> {
                                    binding.semi1player2.typeface = Typeface.DEFAULT_BOLD
                                    binding.semi1player2.paintFlags = Paint.UNDERLINE_TEXT_FLAG
                                }
                                else -> {}
                            }
                        }
                    }
                    "Final1" -> {
                        binding.finals.visibility = View.VISIBLE
                        binding.final1player1.text = game.players[0]
                        if(game.players.size==2)
                            binding.final1player2.text = game.players[1]
                        if (game.status == GameStatus.FINISHED) {
                            when (game.winnerIndex) {
                                0 -> {
                                    binding.final1player1.typeface = Typeface.DEFAULT_BOLD
                                    binding.final1player1.paintFlags = Paint.UNDERLINE_TEXT_FLAG
                                }
                                1 -> {
                                    binding.final1player2.typeface = Typeface.DEFAULT_BOLD
                                    binding.final1player2.paintFlags = Paint.UNDERLINE_TEXT_FLAG
                                }
                                else -> {}
                            }
                        }
                    }
                    "Final2" -> {
                        binding.finals.visibility = View.VISIBLE
                        binding.final2player1.text = game.players[0]
                        if(game.players.size==2)
                            binding.final2player2.text = game.players[1]
                        if (game.status == GameStatus.FINISHED) {
                            when (game.winnerIndex) {
                                0 -> {
                                    binding.final2player1.typeface = Typeface.DEFAULT_BOLD
                                    binding.final2player1.paintFlags = Paint.UNDERLINE_TEXT_FLAG
                                }
                                1 -> {
                                    binding.final2player2.typeface = Typeface.DEFAULT_BOLD
                                    binding.final2player2.paintFlags = Paint.UNDERLINE_TEXT_FLAG
                                }
                                else -> {}
                            }
                        }
                    }
                    else -> {}
                }
            }
        });
    }

    override fun onStart() {
        super.onStart()
        TournamentModel.addObserver(this);
    }

    override fun onStop() {
        super.onStop()
        TournamentModel.removeObserver(this);
    }
    private fun setTimer(timeRemaining: Long): CountDownTimer {
        return object : CountDownTimer(timeRemaining, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val f : NumberFormat = DecimalFormat("00")
                binding.timeMinutes.text = (f.format((millisUntilFinished/60000) % 60)).toString()
                binding.timeSeconds.text = (f.format((millisUntilFinished/1000) % 60)).toString()
            }
            override fun onFinish() {
                cancel()
            }
        }
    }

}
