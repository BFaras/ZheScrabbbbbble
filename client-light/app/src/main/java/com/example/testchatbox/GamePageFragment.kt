package com.example.testchatbox

import SocketHandler
import android.annotation.SuppressLint
import android.content.ClipData
import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.os.CountDownTimer
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.util.TypedValue
import android.view.*
import android.view.GestureDetector.SimpleOnGestureListener
import android.view.View.*
import android.view.animation.AnimationUtils
import android.view.inputmethod.InputMethodManager
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.cardview.widget.CardView
import androidx.core.text.HtmlCompat
import androidx.core.view.children
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Observer
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.Coordinates.COLUMNS
import com.example.testchatbox.Coordinates.ROWS
import com.example.testchatbox.Coordinates.columnsPos
import com.example.testchatbox.Coordinates.rowsPos
import com.example.testchatbox.LetterPoints.letterPoints
import com.example.testchatbox.databinding.FragmentFullscreenBinding
import com.example.testchatbox.login.model.LoggedInUser
import com.google.android.material.imageview.ShapeableImageView
import org.json.JSONArray
import org.json.JSONObject
import java.text.DecimalFormat
import java.text.NumberFormat
import java.util.*


class GamePageFragment : Fragment(), com.example.testchatbox.Observer {
    private val hideHandler = Handler(Looper.myLooper()!!)

    private val gameModel: GameStateModel by viewModels()

    @Suppress("InlinedApi")
    private val hidePart2Runnable = Runnable {
        // Delayed removal of status and navigation bar
        // Note that some of these constants are new as of API 16 (Jelly Bean)
        // and API 19 (KitKat). It is safe to use them, as they are inlined
        // at compile-time and do nothing on earlier devices.
        val flags =
            SYSTEM_UI_FLAG_LOW_PROFILE or
                SYSTEM_UI_FLAG_FULLSCREEN or
                SYSTEM_UI_FLAG_LAYOUT_STABLE or
                SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                SYSTEM_UI_FLAG_HIDE_NAVIGATION
        activity?.window?.decorView?.systemUiVisibility = flags
        (activity as? AppCompatActivity)?.supportActionBar?.hide()
    }
    private val showPart2Runnable = Runnable {
        // Delayed display of UI elements
        fullscreenContentControls?.visibility = VISIBLE
    }
    private var visible: Boolean = false
    private val hideRunnable = Runnable { hide() }
    private var fullscreenContent: View? = null
    private var fullscreenContentControls: View? = null
    private var _binding: FragmentFullscreenBinding? = null

    private val binding get() = _binding!!

    private var isSelected = ArrayList<Int>()
    private var isPlaced = mutableListOf<LetterInHand>()
    private var isInside = false
    private var isPlaying = 0
    private var isYourTurn = true
    private var chosenDirection = "h"
    private var gameOver = false
    private var toBeObserved = 0
    private var playersAvatars = mutableMapOf<String, String>()

    private lateinit var playerHand: ArrayList<String>
    private lateinit var lettersOnBoard: Array<Array<String>>
    private lateinit var gameObserver: Observer<GameState>
    private lateinit var activeTileObserver: Observer<Pair<String, Int>>
    private lateinit var deleteActiveTileObserver: Observer<Pair<String, Int>>
    private lateinit var emoteObserver: Observer<Pair<String, String>>
    private lateinit var avatarsObserver: Observer<MutableMap<String,String>>
    private lateinit var firstLetterPlaced: LetterInHand
    private lateinit var timer: CountDownTimer

    private var oldPosRow: String = ""
    private var oldPosCol: Int = 0
    private var isSwap = false
    private var moveInfo: PlayerMessage = PlayerMessage("", arrayListOf())

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentFullscreenBinding.inflate(inflater, container, false)
        return binding.root
    }

    @SuppressLint("MissingInflatedId", "DiscouragedApi")
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Coordinates.setCoordinates()
        gameModel.getAvatars()
        timer = setTimer()

        avatarsObserver = Observer<MutableMap<String,String>> { avatarsList ->
            playersAvatars = avatarsList
        }
        gameModel.avatarsList.observe(viewLifecycleOwner, avatarsObserver)

        if (!GameRoomModel.isPlayer) {
            binding.apply {
                buttonPlay.visibility = GONE
                buttonExchange.visibility = GONE
                buttonHint.visibility = GONE
                buttonPass.visibility = GONE
                toggleSwapHolder.visibility = GONE
                abandonButton.text = getString(R.string.quit)
            }
        }

        if (GameRoomModel.gameRoom?.gameType == GameType.Coop) binding.timerHolder.visibility = GONE

        SocketHandler.getSocket().on("Game Started"){
            gameOver=false
        }

        gameObserver = Observer<GameState> { gameState ->
            timer.start()
            gameModel.getAvatars()
            binding.gameWinnerHolder.visibility = GONE
            binding.reserveLength.text = gameState.reserveLength.toString()
            isPlaying = gameState.playerTurnIndex
            isYourTurn = (gameState.players[isPlaying].username == LoggedInUser.getName())
            binding.coopHolder.visibility = GONE
            if (GameRoomModel.gameRoom?.gameType == GameType.Coop) isYourTurn = true

            if (gameState.gameOver) {
                gameOver = true
                timer.cancel()
                binding.abandonButton.text = getString(R.string.quit)
                isYourTurn = false
            }

            binding.buttonPlay.isEnabled = isYourTurn && (isPlaced.size > 0)
            binding.buttonPass.isEnabled = isYourTurn
            binding.buttonHint.isEnabled = isYourTurn
            binding.backInHand.visibility = GONE

            if (!GameRoomModel.isPlayer) {
                playerHand = gameState.players[toBeObserved].hand
                binding.nowObservingText.setText(HtmlCompat.fromHtml(getString(R.string.now_observing_player1, gameState.players[0].username), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                binding.observedPlayers.removeAllViews()
                binding.observedHolder.visibility = VISIBLE
                for (player in gameState.players) {
                    val btnPlayer = layoutInflater.inflate(R.layout.chat_rooms_button, binding.observedPlayers, false)
                    val playerObservedName = btnPlayer.findViewById<TextView>(R.id.roomName)
                    playerObservedName.text = player.username
                    btnPlayer.id = gameState.players.indexOf(player)
                    btnPlayer.setOnClickListener {
                        toBeObserved = btnPlayer.id
                        playerHand = gameState.players[toBeObserved].hand
                        binding.nowObservingText.setText(HtmlCompat.fromHtml(getString(R.string.now_observing_player1, player.username), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                        updateRack(player.hand)
                    }
                    binding.observedPlayers.addView(btnPlayer)
                }
            } else if (GameRoomModel.gameRoom?.gameType == GameType.Coop) {
                playerHand = gameState.players[0].hand
            } else {
                for (player in gameState.players) {
                    if (player.username == LoggedInUser.getName()) playerHand = player.hand
                }
            }

            lettersOnBoard = gameState.board

            moveInfo = gameState.message!!
            GameHistoryModel.addMoveInfo(moveInfo)

            updatePlayersInfo(gameState.players, playersAvatars)
            clearTurn()
        }
        gameModel.gameState.observe(viewLifecycleOwner, gameObserver)

        activeTileObserver = Observer<Pair<String, Int>> { activeTile ->
            binding.gameBoard.removeView(binding.gameBoard.findViewWithTag("activeTile"))
            val selectedTile = layoutInflater.inflate(R.layout.active_tile, binding.gameBoard, false)
            val columnCoordinates = columnsPos[activeTile.second-1].first
            val rowCoordinates = ROWS[activeTile.first.uppercase()]

            val params = RelativeLayout.LayoutParams(
                GridConstants.DEFAULT_SIDE.toInt(),
                GridConstants.DEFAULT_SIDE.toInt()
            )
            params.leftMargin = columnCoordinates.toInt() //x
            params.topMargin = rowCoordinates!!.toInt() //y
            selectedTile.tag = "activeTile"
            binding.gameBoard.addView(selectedTile, params)
        }
        gameModel.activeTile.observe(viewLifecycleOwner, activeTileObserver)

        deleteActiveTileObserver = Observer<Pair<String, Int>> {
            binding.gameBoard.removeView(binding.gameBoard.findViewWithTag("activeTile"))
        }
        gameModel.deleteActiveTile.observe(viewLifecycleOwner, deleteActiveTileObserver)

        emoteObserver = Observer<Pair<String, String>> { emote ->
            val username = emote.first
            val emoteName = emote.second
                for (element in binding.playersInfoHolder.children) {
                    if (element.tag == username) {
                        when (binding.playersInfoHolder.indexOfChild(element)) {
                            0 ->
                            {
                                binding.emotePlayer1.setImageResource(resources.getIdentifier(emoteName, "drawable", activity?.packageName))
                                binding.emotePlayer1.visibility = VISIBLE
                                val animation = AnimationUtils.loadAnimation(context, R.anim.fade_out)
                                binding.emotePlayer1.startAnimation(animation)
                                val handler = Handler()
                                handler.postDelayed({
                                    binding.emotePlayer1.visibility = INVISIBLE
                                }, 5000)
                            }
                            1 ->
                            {
                                binding.emotePlayer2.setImageResource(resources.getIdentifier(emoteName, "drawable", activity?.packageName))
                                binding.emotePlayer2.visibility = VISIBLE
                                val animation = AnimationUtils.loadAnimation(context, R.anim.fade_out)
                                binding.emotePlayer2.startAnimation(animation)
                                val handler = Handler()
                                handler.postDelayed({
                                    binding.emotePlayer2.visibility = INVISIBLE
                                }, 5000)
                            }
                            2 ->
                            {
                                binding.emotePlayer3.setImageResource(resources.getIdentifier(emoteName, "drawable", activity?.packageName))
                                binding.emotePlayer3.visibility = VISIBLE
                                val animation = AnimationUtils.loadAnimation(context, R.anim.fade_out)
                                binding.emotePlayer3.startAnimation(animation)
                                val handler = Handler()
                                handler.postDelayed({
                                    binding.emotePlayer3.visibility = INVISIBLE
                                }, 5000)
                            }
                            3 ->
                            {
                                binding.emotePlayer4.setImageResource(resources.getIdentifier(emoteName, "drawable", activity?.packageName))
                                binding.emotePlayer4.visibility = VISIBLE
                                val animation = AnimationUtils.loadAnimation(context, R.anim.fade_out)
                                binding.emotePlayer4.startAnimation(animation)
                                val handler = Handler()
                                handler.postDelayed({
                                    binding.emotePlayer4.visibility = INVISIBLE
                                }, 5000)
                            }
                        }
                    }
            }
        }
        gameModel.emote.observe(viewLifecycleOwner, emoteObserver)

        binding.apply {

            emoteNice.setOnClickListener {
                var username = LoggedInUser.getName()
                if (GameRoomModel.gameRoom?.gameType == GameType.Coop) username = ""
                SocketHandler.getSocket().emit("Send Emote", JSONObject(mapOf("username" to username, "emote" to "hmm")))
                showEmote("hmm")
                Log.d("EMOTE SEND", JSONObject(mapOf("username" to LoggedInUser.getName(), "emote" to "ic_good")).toString())
            }

            emoteCringe.setOnClickListener {
                var username = LoggedInUser.getName()
                if (GameRoomModel.gameRoom?.gameType == GameType.Coop) username = ""
                SocketHandler.getSocket().emit("Send Emote", JSONObject(mapOf("username" to username, "emote" to "cringe")))
                showEmote("cringe")
            Log.d("EMOTE SEND", JSONObject(mapOf("username" to LoggedInUser.getName(), "emote" to "hmm")).toString())
            }

            emoteWat.setOnClickListener {
                var username = LoggedInUser.getName()
                if (GameRoomModel.gameRoom?.gameType == GameType.Coop) username = ""
                SocketHandler.getSocket().emit("Send Emote", JSONObject(mapOf("username" to username, "emote" to "wat")))
                showEmote("wat")
                Log.d("EMOTE SEND", JSONObject(mapOf("username" to LoggedInUser.getName(), "emote" to "hmm")).toString())
            }

            buttonchat.setOnClickListener {
                findNavController().navigate(R.id.action_fullscreenFragment_to_ChatFragment)
            }
            friends.setOnClickListener {
                findNavController().navigate(R.id.action_fullscreenFragment_to_friendsFragment)
            }
            buttonPass.setOnClickListener {
                SocketHandler.getSocket().emit("Play Turn", "Pass", "")
                clearTurn()
            }
            toggleSwap.setOnCheckedChangeListener{ _, _ ->
                isSwap = !isSwap
                clearTurn()
            }

            buttonHint.setOnClickListener {
                cluesProgress.visibility = VISIBLE
                buttonHint.isEnabled = false
                isYourTurn = false
                toggleSwap.isEnabled = false
                buttonPass.isEnabled = false

                val hintList = arrayListOf<String>()

                SocketHandler.getSocket().emit("Request Clue", "")

                SocketHandler.getSocket().once("Clue Response") {args ->

                    Log.d("args", args[0].toString())
                    if (args[0] != null) {
                        val cluesListJSON = args[0] as JSONArray
                        for (i in 0 until cluesListJSON.length()) {
                            hintList.add(cluesListJSON.getString(i).drop(6))
                        }
                        Log.d("cluesListJSON", cluesListJSON.toString())
                        Log.d("hintList", hintList.toString())
                        activity?.runOnUiThread {
                            clearTurn()
                            toggleSwap.isEnabled = false
                            buttonPass.isEnabled = true
                            hintHolder.removeAllViews()
                            cluesProgress.visibility = GONE
                            hintPanel.visibility = VISIBLE
                            hintPanel.findViewById<FrameLayout>(R.id.noHelpHint).setOnClickListener {
                                clearTurn()
                                buttonHint.isEnabled = true
                            }
                            isYourTurn = true

                            for (clue in hintList) {
                                val hintButton = layoutInflater.inflate(R.layout.hint, hintHolder, false)
                                val hint: TextView = hintButton.findViewById(R.id.displayedHint)
                                hint.text = clue.uppercase()

                                Log.d("HINT", clue)

                                hintButton.setOnClickListener {
                                    isPlaced.clear()
                                    updateBoard(lettersOnBoard)
                                    updateRack(playerHand)

                                    val direction: String
                                    val m: Int
                                    var colInt: Int

                                    var col = (clue[1]).toString()
                                    var row = (clue[0])

                                    if (clue[2].isDigit()) {
                                        col += clue[2]
                                        colInt = col.toInt()
                                        direction = (clue[3]).toString()
                                        m = 5
                                    }
                                    else {
                                        colInt = col.toInt()
                                        direction = (clue[2]).toString()
                                        m = 4
                                    }

                                    Log.d("COL ", col)
                                    Log.d("ROW ", row.toString())
                                    Log.d("DIRECTION ", direction)

                                    for (i in m until clue.length) {
                                        Log.d("LETTER TO DRAW ", clue[i].toString())
                                        val letterTile = layoutInflater.inflate(R.layout.letter_tile, binding.gameBoard, false)
                                        val letter: TextView = letterTile.findViewById(R.id.letter)
                                        val letterPoint: TextView = letterTile.findViewById(R.id.letterPoint)

                                        letter.text = clue[i].uppercase()
                                        letterPoint.text = letterPoints[letter.text].toString()

                                        var columnCoordinates = columnsPos[colInt-1].first
                                        var rowCoordinates = ROWS[row.toString().uppercase()]

                                        Log.d("COL COORD ", columnCoordinates.toString())
                                        Log.d("ROW COORD ", rowCoordinates.toString())

                                        val params = RelativeLayout.LayoutParams(
                                            GridConstants.DEFAULT_SIDE.toInt(),
                                            GridConstants.DEFAULT_SIDE.toInt()
                                        )

                                        Log.d("LETTER ARLEARY ON  BOARD HINT", "$colInt${(row).uppercase()}")
                                        Log.d("IS ON BOARD?", ((binding.gameBoard.findViewWithTag<View>("$colInt${(row).uppercase()}") != null).toString()))
                                        when (direction) {
                                            "h" -> {
                                                if (binding.gameBoard.findViewWithTag<View>("$colInt${(row).uppercase()}") != null) {
                                                    Log.d("LETTER ARLEARY ON  BOARD HINT 1", "$colInt$row")
                                                    while (binding.gameBoard.findViewWithTag<View>("$colInt${(row).uppercase()}") != null) {
                                                        Log.d("FINDING NEXT COL", colInt.toString())
                                                        colInt++
                                                        Log.d("LETTER ARLEARY ON  BOARD HINT AFTER COL", "$colInt${(row).uppercase()}")
                                                    }
                                                    columnCoordinates = columnsPos[colInt-1].first
                                                    rowCoordinates = ROWS[row.toString().uppercase()]
                                                    params.leftMargin = (columnCoordinates.toInt()) //x
                                                    params.topMargin = rowCoordinates?.toInt()!!
                                                    gameBoard.addView(letterTile, params)
                                                    isPlaced.add(LetterInHand(colInt, params.leftMargin.toFloat(), row.toString().uppercase(), params.topMargin.toFloat(), clue[i].toString(), 0))
                                                    colInt++

                                                } else {
                                                    params.leftMargin = (columnCoordinates.toInt()) //x
                                                    params.topMargin = rowCoordinates?.toInt()!!
                                                    gameBoard.addView(letterTile, params)
                                                    isPlaced.add(LetterInHand(colInt, params.leftMargin.toFloat(), row.toString().uppercase(), params.topMargin.toFloat(), clue[i].toString(), 0))
                                                    colInt++
                                                }
                                            }
                                            "v" -> {
                                                if (binding.gameBoard.findViewWithTag<View>("$colInt${(row).uppercase()}") != null) {
                                                    Log.d("LETTER ARLEARY ON  BOARD HINT 1", "$colInt${(row).uppercase()}")
                                                    while (binding.gameBoard.findViewWithTag<View>("$colInt${(row).uppercase()}") != null) {
                                                        Log.d("FINDING NEXT ROW", row.toString())
                                                        row++
                                                        Log.d("LETTER ARLEARY ON  BOARD HINT AFTER ROW", "$colInt${(row).uppercase()}")
                                                    }
                                                    columnCoordinates = columnsPos[colInt-1].first
                                                    rowCoordinates = ROWS[row.toString().uppercase()]
                                                    params.leftMargin = columnCoordinates.toInt() //x
                                                    params.topMargin = (rowCoordinates?.toInt()!!)
                                                    gameBoard.addView(letterTile, params)
                                                    isPlaced.add(LetterInHand(colInt, params.leftMargin.toFloat(), row.toString().uppercase(), params.topMargin.toFloat(), clue[i].toString(), 0))
                                                    row++
                                                } else {
                                                    params.leftMargin = columnCoordinates.toInt() //x
                                                    params.topMargin = (rowCoordinates?.toInt()!!)
                                                    gameBoard.addView(letterTile, params)
                                                    isPlaced.add(LetterInHand(colInt, params.leftMargin.toFloat(), row.toString().uppercase(), params.topMargin.toFloat(), clue[i].toString(), 0))
                                                    row++
                                                }
                                            } else -> {}
                                        }
                                        for (tile in letterRack.children) { //effacer lettre du chevalet
                                            if (tile.findViewById<TextView>(R.id.letter).text == letter.text) {
                                                letterRack.removeView(tile)
                                            }
                                        }
                                        firstLetterPlaced = isPlaced[0]
                                        Log.d("ARE PLACED ", isPlaced.toString())
                                    }
                                    isInside = true
                                    buttonPlay.isEnabled = true
                                }
                                hintHolder.addView(hintButton)
                        }
                            if (hintList.size == 0) {
                                binding.noHintFound.visibility = VISIBLE
                            }
                    }
                    }
                }
            }
            confirmLetter.setOnClickListener {
                sendBlankLetter()
            }
            replaceLetterInput.onFocusChangeListener = OnFocusChangeListener { _, hasFocus ->
                if (!hasFocus) {
                    hideKeyboard()
                }
            }
            abandonButton.setOnClickListener {
                val builder = context?.let { it -> AlertDialog.Builder(it, R.style.CustomAlertDialog).create() }
                val alertView = layoutInflater.inflate(R.layout.alert_abandon, null)
                val yesButton = alertView.findViewById<AppCompatButton>(R.id.dialogYes)
                val noButton = alertView.findViewById<AppCompatButton>(R.id.dialogNo)
                builder?.setView(alertView)
                yesButton.setOnClickListener {
                    SocketHandler.getSocket().emit("Abandon")
                    GameRoomModel.leaveRoom()
                    if(TournamentModel.inTournament) {
                        findNavController().navigate(R.id.action_fullscreenFragment_to_bracketFragment2)
                    } else {
                        findNavController().navigate(R.id.action_fullscreenFragment_to_MainMenuFragment)
                    }
                    builder?.dismiss()
                }
                noButton.setOnClickListener {
                    builder?.dismiss()
                }
                builder?.show()
            }
            buttonExchange.setOnClickListener {
                var lettersToSwap = ""
                isSelected.forEachIndexed { index,i ->
                    if (i == 1) {
                        val letter = binding.letterRack.getChildAt(index).findViewById<TextView>(R.id.letter).text as String
                        lettersToSwap += if (letter == "") "*" else letter.lowercase() //A CHECK!!
                        Log.d(tag, "letters to swap $lettersToSwap")
                    }
                }
                SocketHandler.getSocket()
                    .emit("Play Turn", "Swap", lettersToSwap)
                clearTurn()
            }
            buttonPlay.setOnClickListener {
                var row = ""
                var col = 0
                var letters = ""
                for (i in 0 until isPlaced.size) {
                            if (isPlaced.size == 1) {
                                chosenDirection = "h"
                                row = isPlaced[0].row.lowercase()
                                col = isPlaced[0].col
                                letters += isPlaced[i].letter
                            }
                            else if (isHorizontalStick()) {
                                chosenDirection = "h"
                                row = isPlaced[0].row.lowercase()
                                col = isPlaced[0].col
                                letters += isPlaced[i].letter
                            } else if (isVerticalStick()){
                                chosenDirection = "v"
                                row = isPlaced[0].row.lowercase()
                                col = isPlaced[0].col
                                letters += isPlaced[i].letter
                            } else {
                                Log.d(tag, "INVALID MOVE - $letters")
                                break
                            }
                }
                if (letters != "") {
                    val playingArgs = "$row$col$chosenDirection $letters"
                    SocketHandler.getSocket().emit("Play Turn", "Place", playingArgs)
                    clearTurn()
                } else {
                    Toast.makeText(context, "INVALID MOVE!", Toast.LENGTH_SHORT).show()
                    clearTurn()
                }
            }
            backInHand.setOnClickListener {
                clearTurn()
            }

        }

        val dragListener = OnDragListener { view, event ->
            val draggableItem = event.localState as View
            val lettre = draggableItem.findViewById<TextView>(R.id.letter).text.toString()
            val lettrePoint = draggableItem.findViewById<TextView>(R.id.letterPoint).text.toString()

            event?.let {
                when (event.action) {
                    DragEvent.ACTION_DRAG_STARTED -> {
                        true
                    }
                    DragEvent.ACTION_DRAG_ENTERED -> {
                        true
                    }
                    DragEvent.ACTION_DRAG_EXITED -> {
                        view.invalidate()
                        true
                    }
                    DragEvent.ACTION_DROP -> {
                        if (isYourTurn) {
                            val letterInHand = getPosition(event)
                            if (lettrePoint == "0") letterInHand.letter = lettre.uppercase() else letterInHand.letter = lettre.lowercase()
                            val letterTagOnBoard = "${letterInHand.col}${letterInHand.row}"

                            if (binding.gameBoard.findViewWithTag<View>(letterTagOnBoard) == null)  { //does the place already taken?
                                val letterAlreadyInPosition = isPlaced.find { it.col == letterInHand.col && it.row == letterInHand.row }
                                if (letterAlreadyInPosition == null) {

                                    if (!isInside) {
                                        firstLetterPlaced = letterInHand
                                        oldPosCol = letterInHand.col
                                        oldPosRow = letterInHand.row
                                    }
                                    if (!isInside) SocketHandler.getSocket().emit("Remove Selected Tile", JSONObject(mapOf("x" to letterInHand.row, "y" to letterInHand.col)))
                                    if (letterInHand.viewTag == firstLetterPlaced.viewTag) SocketHandler.getSocket().emit("Remove Selected Tile", JSONObject(mapOf("x" to oldPosRow, "y" to oldPosCol)))

                                    letterInHand.viewTag = draggableItem.tag as Int

                                    when (draggableItem.parent) {
                                        is LinearLayout -> {
                                            isPlaced.add(letterInHand)
                                            (draggableItem.parent as LinearLayout).removeView(draggableItem)
                                        }
                                        is GameBoardView -> {
                                            (draggableItem.parent as GameBoardView).removeView(draggableItem)
                                            if (letterInHand.viewTag == firstLetterPlaced.viewTag) {
                                                SocketHandler.getSocket().emit("Remove Selected Tile", JSONObject(mapOf("x" to oldPosRow, "y" to oldPosCol)))
                                            }
                                        }
                                        else -> {}
                                    }
                                    if (view is GameBoardView) {
                                        val params = RelativeLayout.LayoutParams(
                                            draggableItem.width,
                                            draggableItem.height
                                        )
                                        params.leftMargin = letterInHand.xPosition.toInt() //x
                                        params.topMargin = letterInHand.yPosition.toInt() //y

                                        binding.gameBoard.addView(draggableItem, params)
                                        isPlaced.removeAll { it.viewTag == draggableItem.tag }
                                        isPlaced.add(letterInHand)

                                        if (letterInHand.viewTag == firstLetterPlaced.viewTag)  {
                                            SocketHandler.getSocket().emit("Share First Tile", JSONObject(mapOf("x" to letterInHand.row, "y" to letterInHand.col)))
                                            oldPosCol = letterInHand.col
                                            oldPosRow = letterInHand.row
                                        }
                                        if (letterInHand.letter == "") {
                                            binding.jokerDetected.visibility = VISIBLE
                                            binding.scrollMoveInfo.visibility = GONE
                                        }
                                        Log.d(tag, "LETTERS PLACED - $isPlaced")
                                        isInside = true
                                    } else {
                                        isPlaced.removeAll { it.viewTag == draggableItem.tag }
                                        if (isPlaced.size <= 0) {
                                            isInside = false
                                        } else {
                                            firstLetterPlaced = isPlaced[0]
                                            SocketHandler.getSocket().emit("Share First Tile", JSONObject(mapOf("x" to isPlaced[0].row, "y" to isPlaced[0].col)))
                                            oldPosCol = isPlaced[0].col
                                            oldPosRow = isPlaced[0].row
                                        }
                                        val lp = LinearLayout.LayoutParams(draggableItem.width, draggableItem.width)
                                        binding.letterRack.addView(draggableItem, lp)
                                    }
                                    true
                                } else {
                                    false
                                }
                            } else {
                                false
                            }
                        } else {
                            false
                        }
                    }
                    DragEvent.ACTION_DRAG_ENDED -> {
                        Log.d("IS PLACED?", isPlaced.toString())
                         if (isPlaced.size > 0) {
                             binding.buttonPlay.isEnabled = !isPlaced.any {it.letter == ""}
                             binding.backInHand.visibility = VISIBLE
                        } else {
                             binding.backInHand.visibility = GONE
                             binding.buttonPlay.isEnabled = false
                        }
                        draggableItem.visibility = VISIBLE
                        view.invalidate()
                        true
                        Log.d(tag, "ACTION_DRAG_ENDED")
                    }
                    else -> {
                        false
                    }
                }
            }
            true
        }
        if (GameRoomModel.isPlayer) {
            binding.gameBoard.setOnDragListener(dragListener)
            binding.letterRack.setOnDragListener(dragListener)
        }
    }

    override fun onResume() {
        super.onResume()
        activity?.window?.addFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS)
        // Trigger the initial hide() shortly after the activity has been
        // created, to briefly hint to the user that UI controls
        // are available.
        delayedHide(100)
    }

    override fun onPause() {
        super.onPause()
        activity?.window?.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS)
        // Clear the systemUiVisibility flag
        activity?.window?.decorView?.systemUiVisibility = 0
        show()
    }

    override fun onStop() {
        super.onStop()
        GameHistoryModel.removeObserver(this)
        timer.cancel()
    }

    override fun onStart() {
        super.onStart()
        GameHistoryModel.addObserver(this)
    }

    private fun hide() {
        // Hide UI first
        fullscreenContentControls?.visibility = GONE
        visible = false

        // Schedule a runnable to remove the status and navigation bar after a delay
        hideHandler.removeCallbacks(showPart2Runnable)
        hideHandler.postDelayed(hidePart2Runnable, UI_ANIMATION_DELAY.toLong())
    }

    @Suppress("InlinedApi")
    private fun show() {
        // Show the system bar
        fullscreenContent?.systemUiVisibility =
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        visible = true

        // Schedule a runnable to display UI elements after a delay
        hideHandler.removeCallbacks(hidePart2Runnable)
        hideHandler.postDelayed(showPart2Runnable, UI_ANIMATION_DELAY.toLong())
        (activity as? AppCompatActivity)?.supportActionBar?.show()
    }

    /**
     * Schedules a call to hide() in [delayMillis], canceling any
     * previously scheduled calls.
     */
    private fun delayedHide(delayMillis: Int) {
        hideHandler.removeCallbacks(hideRunnable)
        hideHandler.postDelayed(hideRunnable, delayMillis.toLong())
    }

    companion object {
        /**
         * Whether or not the system UI should be auto-hidden after
         * [AUTO_HIDE_DELAY_MILLIS] milliseconds.
         */
        private const val AUTO_HIDE = true

        /**
         * If [AUTO_HIDE] is set, the number of milliseconds to wait after
         * user interaction before hiding the system UI.
         */
        private const val AUTO_HIDE_DELAY_MILLIS = 3000

        /**
         * Some older devices needs a small delay between UI widget updates
         * and a change of the status and navigation bar.
         */
        private const val UI_ANIMATION_DELAY = 300
    }

    private fun showEmote(emote: String) {
        var username = LoggedInUser.getName()
        if (GameRoomModel.gameRoom?.gameType == GameType.Coop) username = ""
        when (binding.playersInfoHolder.indexOfChild(binding.playersInfoHolder.findViewWithTag(username))) {
            0 ->
            {
                val animation = AnimationUtils.loadAnimation(context, R.anim.fade_out)
                binding.emotePlayer1.startAnimation(animation)
                binding.emotePlayer1.setImageResource(resources.getIdentifier(emote, "drawable", activity?.packageName))
                binding.emotePlayer1.visibility = VISIBLE
                val handler = Handler()
                handler.postDelayed({
                    binding.emotePlayer1.visibility = INVISIBLE
                }, 2000)
            }
            1 ->
            {
                val animation = AnimationUtils.loadAnimation(context, R.anim.fade_out)
                binding.emotePlayer2.startAnimation(animation)
                binding.emotePlayer2.setImageResource(resources.getIdentifier(emote, "drawable", activity?.packageName))
                binding.emotePlayer2.visibility = VISIBLE
                val handler = Handler()
                handler.postDelayed({
                    binding.emotePlayer2.visibility = INVISIBLE
                }, 2000)
            }
            2 ->
            {
                val animation = AnimationUtils.loadAnimation(context, R.anim.fade_out)
                binding.emotePlayer3.startAnimation(animation)
                binding.emotePlayer3.setImageResource(resources.getIdentifier(emote, "drawable", activity?.packageName))
                binding.emotePlayer3.visibility = VISIBLE
                val handler = Handler()
                handler.postDelayed({
                    binding.emotePlayer3.visibility = INVISIBLE
                }, 2000)
            }
            3 ->
            {
                val animation = AnimationUtils.loadAnimation(context, R.anim.fade_out)
                binding.emotePlayer4.startAnimation(animation)
                binding.emotePlayer4.setImageResource(resources.getIdentifier(emote, "drawable", activity?.packageName))
                binding.emotePlayer4.visibility = VISIBLE
                val handler = Handler()
                handler.postDelayed({
                    binding.emotePlayer4.visibility = INVISIBLE
                }, 2000)
            }
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun updateRack(playerHand: ArrayList<String>) {
        binding.letterRack.removeAllViews()
        isSelected.clear()
        val isSelectedColor = TypedValue()
        context?.theme?.resolveAttribute(
            com.google.android.material.R.attr.colorPrimaryVariant,
            isSelectedColor,
            true
        )
        for ((i, letterInHand) in playerHand.withIndex()) {
            isSelected.add(0)
            val letterTile = layoutInflater.inflate(R.layout.letter_tile, binding.letterRack, false)
            val letter: TextView = letterTile.findViewById(R.id.letter)
            val letterPoint: TextView = letterTile.findViewById(R.id.letterPoint)
            val background: CardView = letterTile.findViewById(R.id.letterTileBg)
            val initialBgcolor = background.cardBackgroundColor

            letter.text = letterInHand.uppercase()
            letterPoint.text = letterPoints[letterInHand.uppercase()].toString()

            if (letterInHand == "blank" || letterInHand == "" || letterInHand == "*") {
                letter.text = ""
                letterPoint.text = letterPoints["BLANK"].toString()
            }
            letterTile.tag = i
            binding.letterRack.addView(letterTile)

            val gesture = GestureDetector(context, object : SimpleOnGestureListener() {
                override fun onDown(e: MotionEvent): Boolean {
                    if (!isSwap) {
                        if (!isSelected.contains(1)) {
                            val data = ClipData.newPlainText("", "")
                            val shadowBuilder = DragShadowBuilder(letterTile)
                            letterTile?.startDragAndDrop(
                                data,
                                shadowBuilder,
                                letterTile,
                                DRAG_FLAG_OPAQUE
                            )
                            letterTile?.visibility = INVISIBLE
                        } else false
                    }
                    return true
                }
                override fun onSingleTapUp(e: MotionEvent): Boolean { //action pour swap
                    Log.d("myApp", "double tap")
                    if (isSwap) {
                        return if (isYourTurn && !isInside) {
                            val index = binding.letterRack.indexOfChild(letterTile)
                            if (isSelected[index] == 0) {
                                background.setCardBackgroundColor(isSelectedColor.data)
                                isSelected[index] = 1
                            } else {
                                background.setCardBackgroundColor(initialBgcolor)
                                isSelected[index] = 0
                            }
                            binding.buttonExchange.isEnabled = isSelected.contains(1)
                            true
                        } else false
                    }
                    return false
                }
            })
            if (GameRoomModel.isPlayer) { letterTile.setOnTouchListener { _, event -> gesture.onTouchEvent(event) } }
        }
    }

    @SuppressLint("MissingInflatedId")
    private fun updatePlayersInfo(playersList: ArrayList<PlayersState>, listOfAvatars: MutableMap<String, String>) {
        val isYouColor = TypedValue()
        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, isYouColor, true)
        var isWinner: PlayersState? = null
        binding.playersInfoHolder.removeAllViews()
        var isHigher = playersList[0].score

        if (gameOver) {
            for (player in playersList) {
                if (player.score > isHigher) {
                    isHigher = player.score
                    Log.d("WINNER", player.toString())
                }
            }
        }

        for (player in playersList) {
            val playerInfo =
                layoutInflater.inflate(R.layout.player_info, binding.playersInfoHolder, false)
            val playerBackground = playerInfo.findViewById<CardView>(R.id.playerBackground)
            val playerName: TextView = playerInfo.findViewById(R.id.playerName)
            val playerPoints: TextView = playerInfo.findViewById(R.id.playerPoints)
            val playerTurn: RelativeLayout = playerInfo.findViewById(R.id.playerInfoHolder)
            val playerAvatar = playerInfo.findViewById<ShapeableImageView>(R.id.playerInGameAvatar)
            var currentAvatar = ""

            for ((name, avatar) in listOfAvatars) {
                if (name == player.username) currentAvatar = avatar
            }

            if (resources.getIdentifier((currentAvatar.dropLast(4)).lowercase(), "drawable", activity?.packageName) != 0) {
                playerAvatar.setImageResource(resources.getIdentifier((currentAvatar.dropLast(4)).lowercase(), "drawable", activity?.packageName))
            } else {
                playerAvatar.setImageResource(R.drawable.robot)
            }

            playerName.text = player.username
            if (player.username == "" && GameRoomModel.gameRoom?.gameType==GameType.Coop) {
                playerAvatar.visibility = GONE
                playerName.text = getString(
                    R.string.team)
            }
            playerPoints.text = player.score.toString()
            playerPoints.typeface = Typeface.DEFAULT_BOLD

            if (player.username == LoggedInUser.getName()) {
                playerName.setTextColor(isYouColor.data)
                playerPoints.setTextColor(isYouColor.data)
            }
            if (!gameOver) {
                if (playersList.indexOf(player) == isPlaying) {
                    playerTurn.setBackgroundResource(R.drawable.player_turn_border)
                }
            } else {
                if (player.score == isHigher) isWinner = player
                if (player == isWinner) {
                    playerBackground.setCardBackgroundColor(isYouColor.data)
                    playerName.setTextColor(Color.BLACK)
                    playerPoints.setTextColor(Color.BLACK)
                    binding.gameWinnerHolder.visibility = VISIBLE
                    binding.gameWinner.setText(HtmlCompat.fromHtml(getString(R.string.winnerName, player.username), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                }
            }
            playerInfo.tag = player.username
            binding.playersInfoHolder.addView(playerInfo)
        }
    }

    data class LetterInHand(
        var col: Int,
        var xPosition: Float,
        var row: String,
        var yPosition: Float,
        var letter: String,
        var viewTag: Int
    )

    private fun getPosition(position: DragEvent): LetterInHand { //pour envoyer commande lettre, col, row lorsque bouton play et jouer
        val letter = LetterInHand(0, 0F, "", 0F, "", 0)

        for (e in columnsPos) {
            if (position.x in e.first..e.second) {
                letter.col = COLUMNS.filter { e.first == it.value }.keys.first()
                letter.xPosition = COLUMNS.filter { e.first == it.value }.values.first()
            }
        }
        for (e in rowsPos) {
            if (position.y in e.first..e.second) {
                letter.row = ROWS.filter { e.first == it.value }.keys.first()
                letter.yPosition = ROWS.filter { e.first == it.value }.values.first()
            }
        }
        return letter
    }

    private fun updateBoard(gameBoardCoord: Array<Array<String>>) {
        val alreadyOnBoard = TypedValue()
        context?.theme?.resolveAttribute(R.attr.lettersOnBoard, alreadyOnBoard, true)

        binding.gameBoard.removeAllViews()
        for (row in gameBoardCoord.indices) { //row
            for (col in 0 until gameBoardCoord[row].size) { //col
                if (gameBoardCoord[row][col] != "") {
                    val columnCoordinates = columnsPos[col].first
                    val rowCoordinates = rowsPos[row].first
                    val trueColumn = col + 1
                    val trueRow = (row + 'A'.code).toChar()

                    val letterTile = drawLettersOnBoard(
                        binding.gameBoard,
                        gameBoardCoord[row][col],
                        alreadyOnBoard.data
                    )

                    val params = RelativeLayout.LayoutParams(
                        GridConstants.DEFAULT_SIDE.toInt(),
                        GridConstants.DEFAULT_SIDE.toInt()
                    )
                    params.leftMargin = columnCoordinates.toInt() //x
                    params.topMargin = rowCoordinates.toInt() //y

                    letterTile?.tag = "$trueColumn$trueRow"
                    binding.gameBoard.addView(letterTile, params)
                }
            }
        }
    }

    private fun drawLettersOnBoard(
        rootView: ViewGroup,
        letterToDraw: String,
        backgroundColor: Int
    ): View? {
        val letterTile = layoutInflater.inflate(R.layout.letter_tile, rootView, false)
        val letter: TextView = letterTile.findViewById(R.id.letter)
        val letterPoint: TextView = letterTile.findViewById(R.id.letterPoint)
        val background: CardView = letterTile.findViewById(R.id.letterTileBg)

        letter.text = letterToDraw.uppercase()
        letterPoint.text = letterPoints[letter.text].toString()
        background.setCardBackgroundColor(backgroundColor)

        if (letterToDraw.length > 4) {
            if (letterToDraw.substring(0,5) == "blank") {
                letter.text = letterToDraw.substring(5,6).uppercase()
                letterPoint.text = letterPoints["BLANK"].toString()
            }
        } else if (letterToDraw[0].isUpperCase()) {
            letter.text = letterToDraw[0].toString()
            letterPoint.text = letterPoints["BLANK"].toString()
        } else if (letterToDraw == "BLANK") {
            letter.text = letterToDraw
            letterPoint.text = letterPoints["BLANK"].toString()
        }
        return letterTile
    }

    private fun clearTurn() {
        updateBoard(lettersOnBoard)
        updateRack(playerHand)
        binding.gameBoard.removeView(binding.gameBoard.findViewWithTag("activeTile"))
        if (isInside) SocketHandler.getSocket().emit("Remove Selected Tile", JSONObject(mapOf("x" to oldPosRow, "y" to oldPosCol)))
        isPlaced.clear()
        binding.toggleSwap.isEnabled = true
        binding.buttonPlay.isEnabled = false
        binding.backInHand.visibility = GONE
        binding.buttonExchange.isEnabled = false
        binding.jokerDetected.visibility = GONE
        binding.hintPanel.visibility = GONE
        binding.scrollMoveInfo.visibility = VISIBLE
        isInside = false
    }

    private fun updateMoveInfo() {
        val messages = GameHistoryModel.getList()
        Log.d("MESSAGES", messages.toString())
        binding.moveInfoPanel.removeAllViews()
        for (moveInfo in messages) {
            when (moveInfo.messageType) {
                "MSG-1" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_1, if (moveInfo.values[0] == "") getString(R.string.team) else moveInfo.values[0], moveInfo.values[1], moveInfo.values[2]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-2" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_2, if (moveInfo.values[0] == "") getString(R.string.team) else moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-3" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_3, if (moveInfo.values[0] == "") getString(R.string.team) else moveInfo.values[0], moveInfo.values[1]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-4" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_4, if (moveInfo.values[0] == "") getString(R.string.team) else moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-5" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_5, if (moveInfo.values[0] == "") getString(R.string.team) else moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-6" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_6, if (moveInfo.values[0] == "") getString(R.string.team) else moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-7" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_7, moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-8" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_8), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-9" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_9, moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-10" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_10, if (moveInfo.values[0] == "") getString(R.string.team) else moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-11" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_11, if (moveInfo.values[0] == "") getString(R.string.team) else moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-12" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_12, if (moveInfo.values[0] == "") getString(R.string.team) else moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-13" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_13, if (moveInfo.values[0] == "") getString(R.string.team) else moveInfo.values[0], moveInfo.values[1]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-14" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_14), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                else -> {}
            }
        }
        binding.scrollMoveInfo.post { binding.scrollMoveInfo.fullScroll(FOCUS_DOWN) }
    }


    private fun isHorizontalStick(): Boolean {
        isPlaced.sortBy { it.col }
        Log.d(tag, "H SORTED - $isPlaced")
        var isHorizontalStick = false
        for (i in 0 until isPlaced.size - 1) {
            if ((kotlin.math.abs(
                    isPlaced[i].row.first() - isPlaced[i + 1].row.first()
                ) == 0)) //sur la meme rangee
            {
                Log.d("SUR LA MEME RANGÉE ", "YES")
                    if ((kotlin.math.abs(isPlaced[i].col - isPlaced[i + 1].col) == 1)) //tout collé p/r a col
                    {
                        isHorizontalStick = true
                        Log.d("TOUT COLLÉ? ", isHorizontalStick.toString())
                        break
                    } else {
                        val first = isPlaced[i].col
                        val end = isPlaced[i+1].col
                        val row = isPlaced[i].row
                        for (e in first+1 until end) {
                            Log.d("pos? ", "$e$row")
                            if (binding.gameBoard.findViewWithTag<View>("$e$row") != null) {
                                isHorizontalStick = true
                                Log.d("POSITION VALIDE? ", isHorizontalStick.toString())
                            } else {
                                isHorizontalStick = false
                                break
                            }
                        }
                        return isHorizontalStick
                     }
            }
        }
        Log.d(tag, "IS H STICK? - $isHorizontalStick")
        return isHorizontalStick
    }

    private fun isVerticalStick(): Boolean {
        isPlaced.sortBy { it.row }
        Log.d(tag, "V SORTED - $isPlaced")
        var isVerticalStick = false
        for (i in 0 until isPlaced.size - 1) {
            if ((kotlin.math.abs(isPlaced[i].col - isPlaced[i + 1].col) == 0))
            { //sur la meme colonne
                if ((kotlin.math.abs(
                    isPlaced[i].row.first() - isPlaced[i + 1].row.first()
                ) == 1)) { //tout collé p/r a row
                    isVerticalStick = true
                    break
                } else {
                    val first = (isPlaced[i].row[0].code - 64) //a check si mieux faire
                    val end = (isPlaced[i+1].row[0].code - 64)
                    val col = isPlaced[i].col
                    Log.d("FIRST ROW TO COMPARE", first.toString())
                    Log.d("LAST ROW TO COMPARE", end.toString())
                    Log.d("COL ", col.toString())
                    for (e in first+1 until end) {
                        Log.d("E ", e.toString())
                        val row = (e + 'A'.code - 1).toChar()
                        Log.d("POS LETTRE EXISTANTE? ", "$col$row")
                        if (binding.gameBoard.findViewWithTag<View>("$col$row") != null) {
                            isVerticalStick = true
                            Log.d("POSITION VALIDE? ", isVerticalStick.toString())
                        } else {
                            isVerticalStick = false
                            break
                        }
                    }
                    return isVerticalStick
                }
            }
        }
        Log.d(tag, "IS V STICK? - $isVerticalStick")
        return isVerticalStick
    }
    private fun setTimer(): CountDownTimer {
        return object : CountDownTimer(60000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val initialColor = TypedValue()
                context?.theme?.resolveAttribute(android.R.attr.textColor, initialColor, true)
                binding.secondsTimer.setTextColor(initialColor.data)
                val f : NumberFormat = DecimalFormat("00")
                if ((millisUntilFinished / 1000 % 60) < 10) {
                    binding.minutesTimer.text = f.format(millisUntilFinished / 60000 % 60)
                    binding.secondsTimer.text = f.format(millisUntilFinished / 1000 % 60)
                    binding.secondsTimer.setTextColor(Color.RED)
                } else {
                    binding.minutesTimer.text = f.format(millisUntilFinished / 60000 % 60)
                    binding.secondsTimer.text = f.format(millisUntilFinished / 1000 % 60)
                    binding.secondsTimer.setTextColor(initialColor.data)
                }

            }
            override fun onFinish() {
                val initialColor = TypedValue()
                context?.theme?.resolveAttribute(android.R.attr.textColor, initialColor, true)
                binding.minutesTimer.text = "00"
                binding.secondsTimer.text = "00"
                binding.secondsTimer.setTextColor(initialColor.data)
            }
        }
    }
    private fun hideKeyboard() {
        val imm = context!!.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.toggleSoftInput(InputMethodManager.HIDE_IMPLICIT_ONLY, 0)
    }

    private fun sendBlankLetter() {
        for (i in isPlaced) {
            if (i.letter == "") {
                val blankLetter = binding.gameBoard.findViewWithTag<View>(i.viewTag)
                val replacedLetter = blankLetter.findViewById<TextView>(R.id.letter)
                replacedLetter.text = binding.replaceLetterInput.text.toString().uppercase()
                i.letter = replacedLetter.text as String
                break
            }
        }
        if (isPlaced.any {it.letter == ""}) {
            binding.jokerDetected.visibility = VISIBLE
            binding.scrollMoveInfo.visibility = GONE
        } else {
            binding.jokerDetected.visibility = GONE
            binding.scrollMoveInfo.visibility = VISIBLE
        }
        binding.buttonPlay.isEnabled = !isPlaced.any {it.letter == ""}
        binding.replaceLetterInput.setText("")
        binding.replaceLetterInput.clearFocus()
    }

    override fun update() {
        Log.i("Update", GameHistoryModel.getList().toString())

        activity?.runOnUiThread {
            updateMoveInfo()
            binding.coopHolder.visibility = GONE
            binding.teamApproval.visibility = GONE
        }
        if (GameHistoryModel.playRequest!=null) {
            activity?.runOnUiThread {
                showCoopPlayPrompt()
            }
        } else {
            activity?.runOnUiThread {
                isYourTurn = true
                binding.buttonPass.isEnabled = true
                binding.buttonHint.isEnabled = true
                binding.coopHolder.visibility = GONE
                binding.teamApproval.visibility = GONE
            }
        }
    }

    //TODO : UI to call GameHistoryModel.sendCoopResponse(accept:boolean)
    private fun showCoopPlayPrompt() {
        if (GameHistoryModel.playRequest != null) {
            if (GameHistoryModel.playRequest!!.values[0] != LoggedInUser.getName()) {
                binding.coopHolder.visibility = VISIBLE
                clearTurn()
            }
            else {
                binding.teamApproval.visibility = VISIBLE
            }

            binding.buttonPass.isEnabled = false
            binding.buttonHint.isEnabled = false
            isYourTurn = false

            binding.proposedAction.setText(
                HtmlCompat.fromHtml(
                    getString(
                        R.string.MSG_13,
                        GameHistoryModel.playRequest!!.values[0],
                        GameHistoryModel.playRequest!!.values[1],
                    ), HtmlCompat.FROM_HTML_MODE_LEGACY
                ), TextView.BufferType.SPANNABLE
            )

            binding.acceptAction.setOnClickListener {
                GameHistoryModel.sendCoopResponse(true)
                Log.d("PLAYER REQUEST", GameHistoryModel.playRequest.toString())

            }
            binding.refuseAction.setOnClickListener {
                GameHistoryModel.sendCoopResponse(false)
                Log.d("PLAYER REQUEST", GameHistoryModel.playRequest.toString())

            }
        }
    }
}
