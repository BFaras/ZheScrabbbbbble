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
import android.view.inputmethod.InputMethodManager
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.text.HtmlCompat
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
import org.json.JSONArray
import org.json.JSONObject
import java.text.DecimalFormat
import java.text.NumberFormat


/**
 * An example full-screen fragment that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 */
class GamePageFragment : Fragment() {
    private val hideHandler = Handler(Looper.myLooper()!!)

    private val gameModel: GameStateModel by viewModels()

    @Suppress("InlinedApi")
    private val hidePart2Runnable = Runnable {
        // Delayed removal of status and navigation bar

        // Note that some of these constants are new as of API 16 (Jelly Bean)
        // and API 19 (KitKat). It is safe to use them, as they are inlined
        // at compile-time and do nothing on earlier devices.
        val flags =
            View.SYSTEM_UI_FLAG_LOW_PROFILE or
                View.SYSTEM_UI_FLAG_FULLSCREEN or
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        activity?.window?.decorView?.systemUiVisibility = flags
        (activity as? AppCompatActivity)?.supportActionBar?.hide()
    }
    private val showPart2Runnable = Runnable {
        // Delayed display of UI elements
        fullscreenContentControls?.visibility = VISIBLE
    }
    private var visible: Boolean = false
    lateinit var timer: CountDownTimer
    private val hideRunnable = Runnable { hide() }

    /**
     * Touch listener to use for in-layout UI controls to delay hiding the
     * system UI. This is to prevent the jarring behavior of controls going away
     * while interacting with activity UI.
     */
    private val delayHideTouchListener = View.OnTouchListener { _, _ ->
        if (AUTO_HIDE) {
            delayedHide(AUTO_HIDE_DELAY_MILLIS)
        }
        false
    }

    private var dummyButton: Button? = null
    private var fullscreenContent: View? = null
    private var fullscreenContentControls: View? = null

    private var _binding: FragmentFullscreenBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    private var isSelected = ArrayList<Int>() //a changer pour ArrayList<Pair>()
    private var isPlaced = mutableListOf<LetterInHand>()
    private var isInside = false
    private var isPlaying = 0
    private var isYourTurn = true
    private var chosenDirection = "h"
    private var gameOver = false

    lateinit var playerHand: ArrayList<String>
    lateinit var lettersOnBoard: Array<Array<String>>
    lateinit var gameObserver: Observer<GameState>
    lateinit var activeTileObserver: Observer<Pair<String, Int>>
    lateinit var deleteActiveTileObserver: Observer<Pair<String, Int>>
    var firstLetterPlaced = false
    lateinit var firstLetterPlace: LetterInHand
    var oldPosRow: String = ""
    var oldPosCol: Int = 0
    var moveInfo: PlayerMessage = PlayerMessage("", arrayListOf())


    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentFullscreenBinding.inflate(inflater, container, false)
        return binding.root
    }

    @SuppressLint("MissingInflatedId")
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        Coordinates.setCoordinates()
        timer = setTimer()

        gameObserver = Observer<GameState> { gameState ->
            // Update the UI.)
            timer.start()
            binding.reserveLength.text = gameState.reserveLength.toString()
            isPlaying = gameState.playerTurnIndex
            isYourTurn = (gameState.players[isPlaying].username == LoggedInUser.getName())

            binding.buttonPlay.isEnabled = isYourTurn && (isPlaced.size > 0)
            binding.buttonPass.isEnabled = isYourTurn
            binding.buttonHint.isEnabled = isYourTurn
            binding.backInHand.visibility = GONE

            if (gameState.gameOver) {
                gameOver = true
                timer.cancel()
                binding.abandonButton.text = getString(R.string.quit)
                isYourTurn = false
                clearTurn()
            }
            for (player in gameState.players) {
                if (player.username == LoggedInUser.getName()) playerHand = player.hand
            }

            lettersOnBoard = gameState.board
            moveInfo = gameState.message!!
            updateMoveInfo(moveInfo)
            updatePlayersInfo(gameState.players)
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

        //val hintList = arrayListOf("h6h acd", "v2a h", "h3c je", "h8h go", "v15e lo")

        binding.apply {
            buttonchat.setOnClickListener {
                findNavController().navigate(R.id.action_fullscreenFragment_to_ChatFragment)
            }

            buttonPass.setOnClickListener {
                SocketHandler.getSocket().emit("Play Turn", "Pass", "")
                clearTurn()
            }

//            buttonHint.setOnClickListener {
//                updateTurn()
//                hintHolder.removeAllViews()
//                hintPanel.visibility = VISIBLE
//
//                for (str in hintList) {
//                    val hintButton = layoutInflater.inflate(R.layout.hint, hintHolder, false)
//                    val hint: TextView = hintButton.findViewById(R.id.displayedHint)
//                    hint.text = str.uppercase()
//                    hintButton.setOnClickListener {
//                        isPlaced.clear()
//                        updateBoard(lettersOnBoard)
//                        updateRack(playerHand)
//
//                        val direction = str[0].toString()
//                        var col = Character.digit(str[1], 10)
                        //if (str[2].isDigit()) col += str[2] col.toInt() var row = str[3] val m = 5
//                        else {var row = str[2] val m = 4}
//
//                        Log.d("COL ", col.toString())
//                        Log.d("ROW ", row.toString())
//                        Log.d("DIRECTION ", direction)
//
//                        val columnCoordinates = columnsPos[col-1].first
//                        val rowCoordinates = ROWS[row.toString().uppercase()]
//
//                        Log.d("COL COORD ", columnCoordinates.toString())
//                        Log.d("ROW COORD ", rowCoordinates.toString())
//                        var tileSize = 0
//                        for (i in m until str.length) {
//                            Log.d("LETTER TO DRAW ", str[i].toString())
//                            val letterTile = layoutInflater.inflate(R.layout.letter_tile, binding.gameBoard, false)
//                            val letter: TextView = letterTile.findViewById(R.id.letter)
//                            val letterPoint: TextView = letterTile.findViewById(R.id.letterPoint)
//
//                            letter.text = str[i].uppercase()
//                            letterPoint.text = letterPoints[letter.text].toString()
//
//                            val params = RelativeLayout.LayoutParams(
//                                GridConstants.DEFAULT_SIDE.toInt(),
//                                GridConstants.DEFAULT_SIDE.toInt()
//                            )
//
//
//                            when (direction) {
//                                "h" -> {
//                                    params.leftMargin = (columnCoordinates.toInt()+tileSize) //x
//                                    params.topMargin = rowCoordinates?.toInt()!!
//                                }
//                                "v" -> {
//                                    params.leftMargin = columnCoordinates.toInt() //x
//                                    params.topMargin = (rowCoordinates?.toInt()!!+tileSize)
//                                } else -> {}
//                            }
//
//                            gameBoard.addView(letterTile, params)
//
//                            for (tile in letterRack.children) {
//                                if (tile.findViewById<TextView>(R.id.letter).text == letter.text) {
//                                    letterRack.removeView(tile)
//                                }
//                            }
//
//                            isPlaced.add(LetterInHand(col, params.leftMargin.toFloat(), row.toString().uppercase(), params.topMargin.toFloat(), str[i].toString(), 0))
//
//                            if(direction=="h") col++ else row++
//                            Log.d("ARE PLACED ", isPlaced.toString())
//
//                            Log.d("TILE SIZE ", tileSize.toString())
//                            tileSize+=GridConstants.DEFAULT_SIDE.toInt()
//
//                        }
//                        isInside = true
//                        buttonPlay.isEnabled = true
//                    }
//                    hintHolder.addView(hintButton)
//                }
//
//            }

            binding.confirmLetter.setOnClickListener {
                sendBlankLetter()
            }

            binding.replaceLetterInput.onFocusChangeListener = OnFocusChangeListener { _, hasFocus ->
                if (!hasFocus) {
                    hideKeyboard()
                }
            }

            abandonButton.setOnClickListener {
                GameRoomModel.leaveRoom()
                SocketHandler.getSocket().emit("Abandon")
                findNavController().navigate(R.id.action_fullscreenFragment_to_MainMenuFragment)
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

                    Log.d(tag, "TO SEND - $letters")
                    Log.d(tag, "TO SEND - $playingArgs")
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


            SocketHandler.getSocket().on("Message Action History"){args->
                val messageJSON = args[0] as JSONObject
                val messageArray = messageJSON.get("values") as JSONArray
                val messages = arrayListOf<String>()
                for (i in 0 until messageArray.length()) {
                    messages.add(messageArray.get(i) as String)
                }
                updateMoveInfo(PlayerMessage(messageJSON.get("messageType") as String, messages))
            }

//            directionToggle.setOnCheckedChangeListener { _, isChecked ->
//                if (isChecked) {
//                    chosenDirection = "v"
//                    Log.d("", chosenDirection)
//                    verticalDirection.setTextColor(isChosenColor.data)
//                    horizontalDirection.setTextColor(isNotChosenColor.data)
//                } else {
//                    chosenDirection = "h"
//                    Log.d("", chosenDirection)
//                    horizontalDirection.setTextColor(isChosenColor.data)
//                    verticalDirection.setTextColor(isNotChosenColor.data)
//                }
//            }
        }

        val dragListener = OnDragListener { view, event ->
            val tag = "Drag and drop"
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
                        Log.d(tag, "ACTION_DRAG_ENTERED")
                    }
                    DragEvent.ACTION_DRAG_EXITED -> {
                        //view.invalidate()
                        true
                        Log.d(tag, "ACTION_DRAG_ENDED")
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
                                        firstLetterPlace = letterInHand
                                        oldPosCol = letterInHand.col
                                        oldPosRow = letterInHand.row
                                    }

                                    if (!isInside) SocketHandler.getSocket().emit("Remove Selected Tile", JSONObject(mapOf("x" to letterInHand.row, "y" to letterInHand.col)))

                                    if (letterInHand.viewTag == firstLetterPlace.viewTag) SocketHandler.getSocket().emit("Remove Selected Tile", JSONObject(mapOf("x" to oldPosRow, "y" to oldPosCol)))

                                    Log.d("NEW PLACEMENT ", letterTagOnBoard)
                                    Log.d("DOES IT EXIST? ",
                                        (binding.gameBoard.findViewWithTag<View>(letterTagOnBoard) == null).toString()
                                    )
                                    Log.d(tag, "letterPoints - $lettrePoint")
                                    letterInHand.viewTag = draggableItem.tag as Int
                                    Log.d(tag, "PLACED LETTER - $letterInHand")

                                    when (draggableItem.parent) {
                                        is LinearLayout -> {
                                            val index = (draggableItem.parent as LinearLayout).indexOfChild(
                                                draggableItem
                                            )
                                            isSelected.remove(index)
                                            isPlaced.add(letterInHand)
                                            (draggableItem.parent as LinearLayout).removeView(draggableItem)

                                        }
                                        is GameBoardView -> {
                                            (draggableItem.parent as GameBoardView).removeView(draggableItem)

                                            if (letterInHand.viewTag == firstLetterPlace.viewTag) {
                                                SocketHandler.getSocket().emit("Remove Selected Tile", JSONObject(mapOf("x" to oldPosRow, "y" to oldPosCol)))
                                            }

                                        }
                                        else -> {}
                                    }

                                    val params = RelativeLayout.LayoutParams(
                                        draggableItem.width,
                                        draggableItem.height
                                    )

                                    params.leftMargin = letterInHand.xPosition.toInt() //x
                                    params.topMargin = letterInHand.yPosition.toInt() //y

                                    binding.gameBoard.addView(draggableItem, params)
                                    isPlaced.removeAll { it.viewTag == draggableItem.tag }
                                    isPlaced.add(letterInHand)

                                    if (letterInHand.viewTag == firstLetterPlace.viewTag)  {
                                        SocketHandler.getSocket().emit("Share First Tile", JSONObject(mapOf("x" to letterInHand.row, "y" to letterInHand.col)))
                                        oldPosCol = letterInHand.col
                                        oldPosRow = letterInHand.row
                                    }

                                    if (letterInHand.letter == "") binding.jokerDetected.visibility = VISIBLE

                                    Log.d(tag, "LETTERS PLACED - $isPlaced")
                                    isInside = true
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
        binding.gameBoard.setOnDragListener(dragListener)

//
//        val rackDragListener = OnDragListener {
//                view, event ->
//            val tag = "Drag and drop"
//            val draggableItem = event.localState as View
//
//            //val lettre = draggableItem.findViewById<TextView>(R.id.letter).text.toString()
//
//            val parent = draggableItem.parent
//            if (parent is GameBoardView) {
//                event?.let {
//                    when (event.action) {
//                        DragEvent.ACTION_DRAG_STARTED -> {
//                            true
//                        }
//                        DragEvent.ACTION_DRAG_ENTERED -> {
//                            true
//
//                            Log.d(tag, "ACTION_DRAG_ENTERED")
//                        }
//                        DragEvent.ACTION_DRAG_EXITED -> {
//                            //view.invalidate()
//                            true
//
//                            Log.d(tag, "ACTION_DRAG_ENDED")
//                        }
//                        DragEvent.ACTION_DROP -> {
//
//                            parent.removeView(draggableItem)
//                            binding.letterRack.addView(draggableItem)
//                            view.invalidate()
//                            true
//
//                        }
//
//                        DragEvent.ACTION_DRAG_ENDED -> {
//                            //if (binding.gameBoard.childCount > 0) binding.buttonPlay.isEnabled = true
//                            draggableItem.visibility = VISIBLE
//                            view.invalidate()
//                            true
//
//                            Log.d(tag, "ACTION_DRAG_ENDED")
//                        }
//                        else -> {
//                            false
//                        }
//                    }
//                }
//                true
//            } else
//            false
//        }
//        binding.letterRack.setOnDragListener(rackDragListener)
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
        timer.cancel()
    }


    override fun onDestroy() {
        super.onDestroy()
        timer.cancel()

        dummyButton = null
        fullscreenContent = null
        fullscreenContentControls = null
    }

    private fun toggle() {
        if (visible) {
            hide()
        } else {
            show()
        }
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
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
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

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
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
                    return true
                }

                override fun onDoubleTap(e: MotionEvent): Boolean { //action pour swap
                    Log.d("myApp", "double tap")
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

                override fun onLongPress(e: MotionEvent) {
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
                    super.onLongPress(e)
                }
            })
            letterTile.setOnTouchListener { _, event -> gesture.onTouchEvent(event) }
        }
    }

    private fun updatePlayersInfo(playersList: ArrayList<PlayersState>) {
        val isYouColor = TypedValue()
        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, isYouColor, true)
        var isWinner: PlayersState? = null

        binding.playersInfoHolder.removeAllViews()
        if (gameOver) {
            var isHigher = playersList[0].score
            for (player in playersList) {
                if (player.score > isHigher) {
                    isHigher = player.score
                    isWinner = player
                }
            }
        }
        for (player in playersList) {
            val playerInfo =
                layoutInflater.inflate(R.layout.player_info, binding.playersInfoHolder, false)
            val playerName: TextView = playerInfo.findViewById(R.id.playerName)
            val playerPoints: TextView = playerInfo.findViewById(R.id.playerPoints)
            val playerTurn: RelativeLayout = playerInfo.findViewById(R.id.playerInfoHolder)

            playerName.text = player.username
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
                if (player == isWinner) playerTurn.setBackgroundColor(isYouColor.data)
                binding.gameWinnerHolder.visibility = VISIBLE
                binding.gameWinner.setText(HtmlCompat.fromHtml(getString(R.string.winnerName, player.username), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
            }

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
                    Log.d("LETTERS ON BOARD TAG ", letterTile?.tag as String)
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
        binding.buttonPlay.isEnabled = false
        binding.backInHand.visibility = GONE
        binding.buttonExchange.isEnabled = false
        binding.jokerDetected.visibility = GONE
        binding.hintPanel.visibility = GONE
        isInside = false
    }

    private fun updateMoveInfo(moveInfo: PlayerMessage?) {
        if (moveInfo != null) {
            when (moveInfo.messageType) {
                "MSG-1" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_1, moveInfo.values[0], moveInfo.values[1], moveInfo.values[2]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-2" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_2, moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-3" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_3, moveInfo.values[0], moveInfo.values[1]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-4" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_4, moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-5" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_5, moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-6" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_6, moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                "MSG-7" -> {
                    val moveInfoLayout = layoutInflater.inflate(R.layout.move_info, binding.moveInfoPanel, false)
                    val displayedMessage: TextView = moveInfoLayout.findViewById(R.id.displayedMoveMessage)
                    displayedMessage.setText(HtmlCompat.fromHtml(getString(R.string.MSG_7, moveInfo.values[0]), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)
                    binding.moveInfoPanel.addView(moveInfoLayout)
                }
                else -> {}
            }
            binding.scrollMoveInfo.post { binding.scrollMoveInfo.fullScroll(FOCUS_DOWN) }
        }
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
//            isHorizontalStick =
//                (kotlin.math.abs(isPlaced[i].col - isPlaced[i + 1].col) == 1) && (kotlin.math.abs(
//                    isPlaced[i].row.first() - isPlaced[i + 1].row.first()
//                ) == 0)
            //if (!isHorizontalStick) break
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
//            isVerticalStick =
//                ((kotlin.math.abs(isPlaced[i].col - isPlaced[i + 1].col) == 0) && (kotlin.math.abs(
//                    isPlaced[i].row.first() - isPlaced[i + 1].row.first()
//                ) == 1))
//            if (!isVerticalStick) break
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
                binding.timesup.visibility = GONE
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
                binding.timesup.visibility = VISIBLE
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
        if (isPlaced.any {it.letter == ""}) binding.jokerDetected.visibility = VISIBLE else binding.jokerDetected.visibility = GONE
        binding.buttonPlay.isEnabled = !isPlaced.any {it.letter == ""}
        binding.replaceLetterInput.setText("")
        binding.replaceLetterInput.clearFocus()
        Log.d(tag, "changement blanc $isPlaced")
    }

//
//    private class TouchListener : OnTouchListener {
//        override fun onTouch(view: View?, motionEvent: MotionEvent?): Boolean {
//            return if (motionEvent?.action == MotionEvent.ACTION_DOWN) {
//                val data = ClipData.newPlainText("", "")
//                val shadowBuilder = DragShadowBuilder(view)
//                view?.startDragAndDrop(data, shadowBuilder, view, DRAG_FLAG_OPAQUE)
//                view?.visibility = INVISIBLE
//                 true
//            } else {
//                false
//            }
//        }
//    }
}
