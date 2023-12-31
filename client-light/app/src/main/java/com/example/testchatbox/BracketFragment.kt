package com.example.testchatbox

import SocketHandler
import android.content.Context
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.media.MediaPlayer
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
import org.json.JSONArray
import org.json.JSONObject
import java.text.DecimalFormat
import java.text.NumberFormat


class BracketFragment : Fragment(), Observer {

    private var _binding: FragmentBracketBinding? = null
    private val binding get() = _binding!!
    private lateinit var timer: CountDownTimer
    var avatars = mutableMapOf<String, String>()
    private var isChatIconChanged = false;
    private var notifSound: MediaPlayer? = null;

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentBracketBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupChatNotifs(view.context)
        WindowInsetsControllerCompat(requireActivity().window, requireActivity().window.decorView).apply {
            // Hide both the status bar and the navigation bar
            hide(WindowInsetsCompat.Type.systemBars())
            hide(WindowInsetsCompat.Type.statusBars())
            // Behavior of system bars
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }


        SocketHandler.getSocket().on("Avatars from Usernames Response") { args ->
            val avatarListJSON = args[0] as JSONObject
            for (i in 0 until avatarListJSON.length()) {
                avatars[avatarListJSON.names()?.getString(i) as String] = (avatarListJSON.names()?.getString(i)?.let { avatarListJSON.get(it) }) as String
            }
        }
        for (game in TournamentModel.getGameData()) {
            SocketHandler.getSocket().emit("Get Avatars from Usernames", JSONArray(game.players))
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
            for(game in TournamentModel.gamesData){
                if(game.type=="Semi1"){
                    if(game.status==GameStatus.IN_PROGRESS)
                        observeGame(game.roomCode)
                    break;
                }
            }
        }
        binding.Semi2.setOnClickListener {
            for(game in TournamentModel.gamesData){
                if(game.type=="Semi2"){
                    if(game.status==GameStatus.IN_PROGRESS)
                        observeGame(game.roomCode)
                    break;
                }
            }
        }

        binding.Final1.setOnClickListener {
            for(game in TournamentModel.gamesData){
                if(game.type=="Final1"){
                    if(game.status==GameStatus.IN_PROGRESS)
                        observeGame(game.roomCode)
                    break;
                }
            }
        }
        binding.Final2.setOnClickListener {
            for(game in TournamentModel.gamesData){
                if(game.type=="Final2"){
                    if(game.status==GameStatus.IN_PROGRESS)
                        observeGame(game.roomCode)
                    break;
                }
            }
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
            builder?.dismiss();
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
            try {
                for (game in TournamentModel.getGameData()) {
                    SocketHandler.getSocket().emit("Get Avatars from Usernames", JSONArray(game.players))
                }
                if(TournamentModel.tournamentTimer.phase==2){
                    binding.quitBtn.setOnClickListener {
                        findNavController().navigate(R.id.action_bracketFragment_to_rankingFragment)
                    }
                    binding.quitBtn.setText(R.string.TournamentResult)
                }
                else if(GameRoomModel.gameRoom!=null && GameRoomModel.gameRoom!!.hasStarted)
                    findNavController().navigate(R.id.action_bracketFragment_to_fullscreenFragment);
                if(::timer.isInitialized) timer.cancel()
                timer = setTimer(TournamentModel.tournamentTimer.timeRemaning.toLong()*1000)
                timer.start()
                for (game in TournamentModel.getGameData()) {
                    Log.d("GAME TOURNAMENT", game.toString())
                    when (game.type) {
                        "Semi1" -> {
                            binding.semi1player1.text = game.players[0]
                            binding.semi1player2.text = game.players[1]

                            binding.Semi1.setOnClickListener {
                                Log.i("Semi1", (game.status == GameStatus.IN_PROGRESS).toString())
                                if (game.status == GameStatus.IN_PROGRESS)
                                    observeGame(game.roomCode)
                            }
                            for ((name, avatar) in avatars) {
                                if (name == game.players[0]) {
                                    if (resources.getIdentifier(
                                            (avatar.dropLast(4)).lowercase(),
                                            "drawable",
                                            activity?.packageName
                                        ) != 0
                                    ) {
                                        binding.playerSemi1.setImageResource(
                                            resources.getIdentifier(
                                                (avatar.dropLast(4)).lowercase(),
                                                "drawable",
                                                activity?.packageName
                                            )
                                        )
                                    }
                                }
                                if (name == game.players[1]) {
                                    if (resources.getIdentifier(
                                            (avatar.dropLast(4)).lowercase(),
                                            "drawable",
                                            activity?.packageName
                                        ) != 0
                                    ) {
                                        binding.player2Semi1.setImageResource(
                                            resources.getIdentifier(
                                                (avatar.dropLast(4)).lowercase(),
                                                "drawable",
                                                activity?.packageName
                                            )
                                        )
                                    }
                                }
                            }

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

                            binding.Semi2.setOnClickListener {
                                Log.i("Semi2", (game.status == GameStatus.IN_PROGRESS).toString())
                                if (game.status == GameStatus.IN_PROGRESS)
                                    observeGame(game.roomCode)
                            }
                            for ((name, avatar) in avatars) {
                                if (name == game.players[0]) {
                                    if (resources.getIdentifier(
                                            (avatar.dropLast(4)).lowercase(),
                                            "drawable",
                                            activity?.packageName
                                        ) != 0
                                    ) {
                                        binding.player1Semi2.setImageResource(
                                            resources.getIdentifier(
                                                (avatar.dropLast(4)).lowercase(),
                                                "drawable",
                                                activity?.packageName
                                            )
                                        )
                                    }
                                }
                                if (name == game.players[1]) {
                                    if (resources.getIdentifier(
                                            (avatar.dropLast(4)).lowercase(),
                                            "drawable",
                                            activity?.packageName
                                        ) != 0
                                    ) {
                                        binding.player2Semi2.setImageResource(
                                            resources.getIdentifier(
                                                (avatar.dropLast(4)).lowercase(),
                                                "drawable",
                                                activity?.packageName
                                            )
                                        )
                                    }
                                }
                            }


                            if (game.status == GameStatus.FINISHED) {
                                when (game.winnerIndex) {
                                    0 -> {
                                        binding.semi2player1.typeface = Typeface.DEFAULT_BOLD
                                        binding.semi2player1.paintFlags = Paint.UNDERLINE_TEXT_FLAG
                                    }
                                    1 -> {
                                        binding.semi2player2.typeface = Typeface.DEFAULT_BOLD
                                        binding.semi2player2.paintFlags = Paint.UNDERLINE_TEXT_FLAG
                                    }
                                    else -> {}
                                }
                            }
                        }
                        "Final1" -> {
                            binding.final1player1.text = game.players[0]
                            binding.Final1.setOnClickListener {
                                if (game.status == GameStatus.IN_PROGRESS)
                                    observeGame(game.roomCode)
                            }
                            for ((name, avatar) in avatars) {
                                if (name == game.players[0]) {
                                    if (resources.getIdentifier(
                                            (avatar.dropLast(4)).lowercase(),
                                            "drawable",
                                            activity?.packageName
                                        ) != 0
                                    ) {
                                        binding.player1Final1.setImageResource(
                                            resources.getIdentifier(
                                                (avatar.dropLast(4)).lowercase(),
                                                "drawable",
                                                activity?.packageName
                                            )
                                        )
                                    }
                                }
                            }
                            if (game.players.size == 2) {
                                binding.final1player2.text = game.players[1]
                                for ((name, avatar) in avatars) {
                                    if (name == game.players[1]) {
                                        if (resources.getIdentifier(
                                                (avatar.dropLast(4)).lowercase(),
                                                "drawable",
                                                activity?.packageName
                                            ) != 0
                                        ) {
                                            binding.player2Final1.setImageResource(
                                                resources.getIdentifier(
                                                    (avatar.dropLast(4)).lowercase(),
                                                    "drawable",
                                                    activity?.packageName
                                                )
                                            )
                                        }
                                    }
                                }
                            }

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
                            binding.final2player1.text = game.players[0]
                            binding.Final2.setOnClickListener {
                                if (game.status == GameStatus.IN_PROGRESS)
                                    observeGame(game.roomCode)
                            }
                            for ((name, avatar) in avatars) {
                                if (name == game.players[0]) {
                                    if (resources.getIdentifier(
                                            (avatar.dropLast(4)).lowercase(),
                                            "drawable",
                                            activity?.packageName
                                        ) != 0
                                    ) {
                                        binding.player1Final2.setImageResource(
                                            resources.getIdentifier(
                                                (avatar.dropLast(4)).lowercase(),
                                                "drawable",
                                                activity?.packageName
                                            )
                                        )
                                    }
                                }
                            }
                            if (game.players.size == 2) {
                                binding.final2player2.text = game.players[1]
                                for ((name, avatar) in avatars) {
                                    if (name == game.players[1]) {
                                        if (resources.getIdentifier(
                                                (avatar.dropLast(4)).lowercase(),
                                                "drawable",
                                                activity?.packageName
                                            ) != 0
                                        ) {
                                            binding.player2Final2.setImageResource(
                                                resources.getIdentifier(
                                                    (avatar.dropLast(4)).lowercase(),
                                                    "drawable",
                                                    activity?.packageName
                                                )
                                            )
                                        }
                                    }
                                }
                            }
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
            }catch (e : Exception){
                SocketHandler.getSocket().emit("Get Tournament Data")
            }
        });
    }

    override fun onStart() {
        super.onStart()
        TournamentModel.addObserver(this);
    }

    override fun onStop() {
        super.onStop()
        NotificationInfoHolder.setFunctionOnMessageReceived(null);
        NotificationInfoHolder.setFunctionOnChatDeleted(null);
        notifSound?.release()
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

    fun setupChatNotifs(context: Context) {
        isChatIconChanged = false;
        NotificationInfoHolder.startObserverChat();
        NotificationInfoHolder.setFunctionOnMessageReceived(::playNotifSoundAndChangeIcon);
        NotificationInfoHolder.setFunctionOnChatDeleted(::changeToNoNotifChatIcon);
        notifSound = MediaPlayer.create(context, R.raw.ding)

        notifSound?.setOnCompletionListener { notifSound?.release() }

        if(NotificationInfoHolder.areChatsUnread())
            changeToNotifChatIcon();
    }

    fun playNotifSoundAndChangeIcon() {
        if (!isChatIconChanged) {
            changeToNotifChatIcon()
            notifSound?.start()
        }
    }

    fun changeToNotifChatIcon() {
        binding.buttonchat.setBackgroundResource(R.drawable.ic_chat_notif);
        isChatIconChanged = true;
    }

    fun changeToNoNotifChatIcon() {
        if (isChatIconChanged) {
            binding.buttonchat.setBackgroundResource(R.drawable.ic_chat);
            isChatIconChanged = false;
        }
    }

}
