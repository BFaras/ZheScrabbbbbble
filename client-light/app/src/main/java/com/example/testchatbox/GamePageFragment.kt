package com.example.testchatbox

import SocketHandler
import android.annotation.SuppressLint
import android.content.ClipData
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.TextUtils.indexOf
import android.util.Log
import android.util.TypedValue
import android.view.*
import android.view.GestureDetector.SimpleOnGestureListener
import android.view.View.*
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Observer
import com.example.testchatbox.Coordinates.COLUMNS
import com.example.testchatbox.Coordinates.ROWS
import com.example.testchatbox.Coordinates.columnsPos
import com.example.testchatbox.Coordinates.rowsPos
import com.example.testchatbox.LetterPoints.letterPoints
import com.example.testchatbox.databinding.FragmentFullscreenBinding


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

    private var playersList = ArrayList<PlayersState>()

    private var isSelected = ArrayList<Int>() //a changer pour ArrayList<Pair>()
    private var isInside = false
    private var isPlaying = 0
    val isYourTurn = true
    lateinit var playerHand: ArrayList<String>
    lateinit var gameObserver:Observer<GameState>


    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentFullscreenBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        //visible = true
        //gameModel.getGameState()
        gameObserver = Observer<GameState> { gameState ->
            // Update the UI.
            binding.reserveLength.text = gameState.reserveLength.toString()
            isPlaying = gameState.playerTurnIndex
            playerHand = gameState.players[0].hand
            updatePlayersInfo(gameState.players)
            updateRack(playerHand)
        }
        gameModel.gameState.observe(viewLifecycleOwner, gameObserver)

        //updateRack() //a déplacer dans observer
        //updatePlayersInfo() //a déplacer dans observer

        binding.apply {
            buttonPass.setOnClickListener {
                SocketHandler.getSocket().emit("Play Turn", "Pass", "")
            }

            abandonButton.setOnClickListener {
                gameModel.getGameState()
                SocketHandler.getSocket().emit("Abandon")
            }

            buttonExchange.setOnClickListener {
                SocketHandler.getSocket().emit("Play Turn", "Swap", "ae") //argument pour changer de lettre
            }

            buttonPlay.setOnClickListener {
                // val lettersAdded = binding.gameBoard.childCount
                // if(invalidePosition()) {
                SocketHandler.getSocket().emit("Play Turn", "Place", "") //a vérifier
                binding.gameBoard.removeAllViews()
                updateRack(playerHand)

                binding.buttonPlay.isEnabled = false
                binding.backInHand.visibility = GONE
                binding.buttonExchange.isEnabled = false
                gameModel.getGameState()
            }

            backInHand.setOnClickListener{
                binding.gameBoard.removeAllViews() //remplacer par updateBoard()
                //updateBoard()
                updateRack(playerHand)

                binding.buttonPlay.isEnabled = false
                binding.backInHand.visibility = GONE
                binding.buttonExchange.isEnabled = false
            }
        }


        val dragListener = OnDragListener {
                view, event ->
            val tag = "Drag and drop"
            val draggableItem = event.localState as View

            //val lettre = draggableItem.findViewById<TextView>(R.id.letter).text.toString()

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
                        //TODO - vérification de la positon en envoyant par socket


                        if (isYourTurn) {
                            val letterInHand = getPosition(event)
//                          letterInHand.letter = lettre

//                          SocketHandler.getSocket().emit("Play Turn", "Place", "") //letterInHand.col + letterInHand.row

                            when (draggableItem.parent) {
                                is LinearLayout -> {
                                    val index = (draggableItem.parent as LinearLayout).indexOfChild(draggableItem)
                                    Log.d(tag, "Index $index")
                                    isSelected.remove(index)
                                    Log.d(tag, "Nouveau $isSelected")
                                    (draggableItem.parent as LinearLayout).removeView(draggableItem)
                                }
                                is GameBoardView -> {
                                    (draggableItem.parent as GameBoardView).removeView(draggableItem)
                                }
                                else -> {

                                }
                            }

                            Log.d(tag, "DROPPED")
                                Log.d(tag, event.x.toString())
                                Log.d(tag, event.y.toString())
                                Log.d(tag, "Row pos : $rowsPos")
                                Log.d(tag, "Col pos : $columnsPos")
                                Log.d(tag, "Col pos : $columnsPos")

                                val params = RelativeLayout.LayoutParams(draggableItem.width, draggableItem.height)
                                params.leftMargin = letterInHand.xPosition.toInt() //x
                                params.topMargin = letterInHand.yPosition.toInt() //y

                                if (view is GameBoardView) {
                                    view.addView(draggableItem, params)
                                    isInside = true
                                    Log.d(tag, "#children " + view.childCount.toString())
                                }

//                        dropArea.drawLetterList.add(letterInHand)
                            true
                        } else {
                            false
                        }

                    }

                    DragEvent.ACTION_DRAG_ENDED -> {
                        if (binding.gameBoard.childCount > 0) {
                            binding.buttonPlay.isEnabled = true
                            binding.backInHand.visibility = VISIBLE
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

    override fun onDestroy() {
        super.onDestroy()
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
        fullscreenContentControls?.visibility = View.GONE
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
    private fun updateRack(playerHand : ArrayList<String>) {
        binding.letterRack.removeAllViews()
        isSelected.clear()

        val isSelectedColor = TypedValue()
        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorPrimaryVariant, isSelectedColor, true)

        for (letterInHand in playerHand) {
            isSelected.add(0)
            val letterTile = layoutInflater.inflate(R.layout.letter_tile, binding.letterRack, false)
            val letter : TextView = letterTile.findViewById(R.id.letter)
            val letterPoint: TextView = letterTile.findViewById(R.id.letterPoint)
            val background: CardView = letterTile.findViewById(R.id.letterTileBg)

            val initialBgcolor = background.cardBackgroundColor


            letter.text = letterInHand.uppercase()
            letterPoint.text = letterPoints[letterInHand.uppercase()].toString()

            if (letterInHand == "blank" || letterInHand == "") {
                letter.text = ""
                letterPoint.text = letterPoints["BLANK"].toString()
            }

            binding.letterRack.addView(letterTile)

            val gesture = GestureDetector(context, object : SimpleOnGestureListener()
            {
                override fun onDown(e: MotionEvent): Boolean {
                    return true
                }
                override fun onDoubleTap(e: MotionEvent): Boolean { //action pour swap
                    Log.d("myApp", "double tap" )
                    return if (binding.gameBoard.childCount <= 0 && isYourTurn){
                        val index = binding.letterRack.indexOfChild(letterTile)
                        if (isSelected[index] === 0) {
                            background.setCardBackgroundColor(isSelectedColor.data)
                            isSelected[index] = 1
                        } else {
                            background.setCardBackgroundColor(initialBgcolor)
                            isSelected[index] = 0
                        }
                        binding.buttonExchange.isEnabled = isSelected.contains(1)
                        true
                    } else false
                    Log.d("myApp", isSelected.toString())
                }

                override fun onLongPress(e: MotionEvent) {
                    if (!isSelected.contains(1) ) {
                        val data = ClipData.newPlainText("", "")
                        val shadowBuilder = DragShadowBuilder(letterTile)
                        letterTile?.startDragAndDrop(data, shadowBuilder, letterTile, DRAG_FLAG_OPAQUE)
                        letterTile?.visibility = INVISIBLE
                    } else false

                    super.onLongPress(e)
                }
            })
            letterTile.setOnTouchListener { _, event -> gesture.onTouchEvent(event) }


            //letterTile.setOnTouchListener(TouchListener())
        }
    }

    @SuppressLint("MissingInflatedId")
    private fun updatePlayersInfo(playersList : ArrayList<PlayersState>) {
        binding.playersInfoHolder.removeAllViews()
//        for (player in playersList) {
//            val playerInfo = layoutInflater.inflate(R.layout.player_info, binding.playersInfoHolder, false)
//            val playerName : TextView = playerInfo.findViewById(R.id.playerName)
//            val playerPoints : TextView = playerInfo.findViewById(R.id.playerPoints)
//            val playerTurn : RelativeLayout = playerInfo.findViewById(R.id.playerInfoHolder)
//
//            playerName.text = player.username
//            playerPoints.text = player.score.toString()
//            binding.playersInfoHolder.addView(playerInfo)
//        }
        for (player in playersList) {
            val playerInfo = layoutInflater.inflate(R.layout.player_info, binding.playersInfoHolder, false)
            val playerName : TextView = playerInfo.findViewById(R.id.playerName)
            val playerPoints : TextView = playerInfo.findViewById(R.id.playerPoints)
            val playerTurn : RelativeLayout = playerInfo.findViewById(R.id.playerInfoHolder)

            playerName.text = player.username
            playerPoints.text = player.score.toString()
            playerPoints.typeface = Typeface.DEFAULT_BOLD

            if (playersList.indexOf(player) == isPlaying) { //a changer pour playerTurn
                playerTurn.setBackgroundResource(R.drawable.player_turn_border)
            }
            binding.playersInfoHolder.addView(playerInfo)
        }
    }
    data class LetterInHand (
        var col: Int,
        var xPosition: Float,
        var row: String,
        var yPosition: Float,
        var letter: String
        )

    private fun getPosition(position: DragEvent): LetterInHand { //pour envoyer commande lettre, col, row lorsque bouton play et jouer
        val letter = LetterInHand(0, 0F, "", 0F, "")

        for(e in columnsPos) {
            if(position.x in e.first..e.second) {
                letter.col = COLUMNS.filter { e.first == it.value }.keys.first()
                letter.xPosition = COLUMNS.filter { e.first == it.value }.values.first()
            }
        }
        for(e in rowsPos) {
            if(position.y in e.first..e.second) {
                letter.row = ROWS.filter { e.first == it.value }.keys.first()
                letter.yPosition = ROWS.filter { e.first == it.value }.values.first()
            }
        }
        return letter
    }

    private fun updateBoard() {
        //TO IMPLEMENT
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
