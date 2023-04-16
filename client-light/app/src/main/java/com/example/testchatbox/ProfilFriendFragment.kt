package com.example.testchatbox

import SocketHandler
import android.annotation.SuppressLint
import android.content.Intent
import android.content.res.ColorStateList
import android.content.res.Configuration
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.widget.AppCompatButton
import androidx.core.app.ActivityCompat
import androidx.core.text.HtmlCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentMainMenuBinding
import com.example.testchatbox.databinding.FragmentProfilBinding
import com.example.testchatbox.databinding.FragmentProfilFriendBinding
import com.example.testchatbox.login.model.LoggedInUser
import com.google.android.material.imageview.ShapeableImageView
import org.json.JSONArray
import org.json.JSONObject
import java.math.RoundingMode
import java.util.*
import kotlin.collections.ArrayList


class ProfilFriendFragment : Fragment() {

    private var _binding: FragmentProfilFriendBinding? = null
    private val selectedColor = TypedValue()
    private val notSelectedColor = TypedValue()
    private lateinit var username:String;

    private val binding get() = _binding!!

    private lateinit var profile : ProfileInfo

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentProfilFriendBinding.inflate(inflater, container, false)
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

        arguments?.getString("username")?.let { username=it }
        if(username==null) findNavController().navigateUp();
        getProfile(username)


        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, selectedColor, true)
        context?.theme?.resolveAttribute(R.attr.buttonColor, notSelectedColor, true)

        binding.buttonConnectionLog.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
        binding.connectionScroll.visibility = View.VISIBLE
        binding.disconnectionScroll.visibility = View.GONE
        binding.buttonDisconnectionLog.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)

        binding.buttonConnectionLog.setOnClickListener {
            context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, selectedColor, true)
            context?.theme?.resolveAttribute(R.attr.buttonColor, notSelectedColor, true)
            binding.connectionScroll.visibility = View.VISIBLE
            binding.buttonConnectionLog.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
            binding.disconnectionScroll.visibility = View.GONE
            binding.buttonDisconnectionLog.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)
            binding.connectionScroll.post { binding.connectionScroll.fullScroll(View.FOCUS_DOWN) }
        }

        binding.buttonDisconnectionLog.setOnClickListener {
            context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, selectedColor, true)
            context?.theme?.resolveAttribute(R.attr.buttonColor, notSelectedColor, true)
            binding.connectionScroll.visibility = View.GONE
            binding.buttonConnectionLog.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)
            binding.disconnectionScroll.visibility = View.VISIBLE
            binding.buttonDisconnectionLog.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
            binding.disconnectionScroll.post { binding.disconnectionScroll.fullScroll(View.FOCUS_DOWN) }
        }

    }

    private  fun getProfile(username:String){
        SocketHandler.getSocket().once("User Profile Response"){args->
            if(args[0]!=null) {
                var profileTemp = ProfileInfo(
                    "",
                    LevelInfo(-1,-1,-1),
                    "",
                    arrayListOf(),
                    arrayListOf(),
                    arrayListOf(),
                    arrayListOf()
                )
                val profileJSON = args[0] as JSONObject
                profileTemp.avatar= profileJSON.get("avatar") as String;
                Log.d("AVATAR ", profileTemp.avatar)
                val levelJSON= profileJSON.get("levelInfo") as JSONObject;
                profileTemp.level= LevelInfo(levelJSON.get("level") as Int,levelJSON.get("xp") as Int,levelJSON.get("nextLevelXp") as Int)
                profileTemp.userCode= profileJSON.get("userCode") as String;
                Log.d("FRIEND CODE ", profileTemp.userCode)
                val tournamentWins = profileJSON.get("tournamentWins") as JSONArray
                for(i in 0 until tournamentWins.length()){
                    profileTemp.tournamentWins.add(tournamentWins.get(i) as Int)
                }
                Log.d("GAME tournamentWins", profileTemp.tournamentWins.toString())
                val stats = profileJSON.get("stats") as JSONArray
                for(i in 0 until stats.length()){
                    val stat= stats.get(i) as JSONObject
                    profileTemp.stats.add(Statistic(stat.get("name") as String, stat.get("statAmount") as Number))
                }
                Log.d("GAME stats", profileTemp.stats.toString())
                val connections = profileJSON.get("connectionHistory") as JSONArray
                for(i in 0 until connections.length()){
                    val connection= connections.get(i) as JSONObject
                    profileTemp.connectionHistory.add(ConnectionInfo(ConnectionType.fromInt(connection.get("connectionType") as Int), connection.get("date") as String,connection.get("time") as String))
                }
                val gamesHistory = profileJSON.get("gameHistory") as JSONArray
                for(i in 0 until gamesHistory.length()){
                    val gameHistory= gamesHistory.get(i) as JSONObject
                    profileTemp.gameHistory.add(GameHistoryInfo(gameHistory.get("date") as String,gameHistory.get("time") as String, gameHistory.get("isWinner") as Boolean))
                    Log.d("gameHistory ", gameHistory.toString())
                }
                profile=profileTemp;
                activity?.runOnUiThread(Runnable {
                    updateView()
                });
            }
        }
        SocketHandler.getSocket().emit("Get Profile Information", username)
    }

    //TODO:Change for real UI
    @SuppressLint("MissingInflatedId")
    private fun updateView(){

        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, selectedColor, true)
        context?.theme?.resolveAttribute(R.attr.buttonColor, notSelectedColor, true)
        binding.buttonConnectionLog.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
        binding.connectionScroll.visibility = View.VISIBLE
        binding.disconnectionScroll.visibility = View.GONE
        binding.buttonDisconnectionLog.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)


        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, selectedColor, true)
        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorPrimary, notSelectedColor, true)

        binding.playerName.text = username;
        binding.playerInGameAvatar.setImageResource(resources.getIdentifier((profile.avatar.dropLast(4)).lowercase(), "drawable", activity?.packageName))

        binding.level.text= "${profile.level.level}"
        binding.tournamentFirst.text = profile.tournamentWins[0].toString()
        binding.tournamentSecond.text = profile.tournamentWins[1].toString()
        binding.tournamentThird.text = profile.tournamentWins[2].toString()

        val neededXP = (profile.level.nextLevelXp - profile.level.xp).toString()
        binding.xpNeeded.setText(activity?.let { HtmlCompat.fromHtml(it.getString(R.string.xp_needed_till_next_level_00, neededXP), HtmlCompat.FROM_HTML_MODE_LEGACY) }, TextView.BufferType.SPANNABLE)
        binding.levelProgress.max = profile.level.nextLevelXp
        binding.levelProgress.progress = profile.level.xp
        Log.i("GAME HISTORY", profile.gameHistory.toString())
        for (game in profile.gameHistory) {
            val gameInfoHolder = layoutInflater.inflate(R.layout.game_history, binding.gameLog, false)
            val gameInfoDate = gameInfoHolder.findViewById<TextView>(R.id.dateGame)
            val gameInfoTime = gameInfoHolder.findViewById<TextView>(R.id.timeGame)
            val gameInfoWinner = gameInfoHolder.findViewById<TextView>(R.id.isWinner)
            gameInfoDate.text = game.date
            gameInfoTime.text = game.time
            if (game.isWinner) {
                if (LoggedInUser.getLang() == "en") {
                    gameInfoWinner.text = "Win"
                } else {
                    gameInfoWinner.text = "Victoire"
                }
                gameInfoWinner.setTextColor(Color.GREEN)
            } else {
                if (LoggedInUser.getLang() == "en") {
                    gameInfoWinner.text = "Loss"
                } else {
                    gameInfoWinner.text = "Défaite"
                }
                gameInfoWinner.setTextColor(Color.RED)
            }
            binding.gameLog.addView(gameInfoHolder)
        }
        if (binding.gameLog.childCount <= 0)binding.gameLogText.visibility = View.VISIBLE else  binding.gameLogText.visibility = View.GONE

        for (stat in profile.stats) {
            val statsHolder =  layoutInflater.inflate(R.layout.game_stats, binding.statsLog, false)
            val statName =  statsHolder.findViewById<TextView>(R.id.statName)
            val statValue = statsHolder.findViewById<TextView>(R.id.stats)
            if (LoggedInUser.getLang() == "en") {
                statName.text = stat.name.lowercase()
            } else {
                when (stat.name) {
                    "Wins" -> statName.text = "victoires"
                    "Games played" -> statName.text = "parties jouées"
                    "Points Average" -> statName.text = "moyenne points gagnés"
                    "Average Game Time" -> statName.text = "temps de jeu moyen"
                    else -> {}
                }
            }
            when (stat.name) {
                "Points Average" -> statValue.text = stat.statAmount.toFloat().toBigDecimal().setScale(1, RoundingMode.UP).toDouble().toString()
                "Average Game Time" -> statValue.text = stat.statAmount.toFloat().toBigDecimal().setScale(1, RoundingMode.UP).toDouble().toString()
                else -> statValue.text = stat.statAmount.toString()
            }
            binding.statsLog.addView(statsHolder)
        }
        Log.i("GAME stats", profile.stats.toString())
        for (connection in profile.connectionHistory) {
            val connectionHolder = layoutInflater.inflate(R.layout.game_connection, if (connection.connectionType == ConnectionType.CONNECTION) binding.connectionLog else binding.disconnectionLog, false)
            val connectionTime = connectionHolder.findViewById<TextView>(R.id.timeConnection)
            val connectionDate = connectionHolder.findViewById<TextView>(R.id.dateConnection)
            connectionTime.text = connection.time
            connectionDate.text = connection.date
            if (connection.connectionType == ConnectionType.CONNECTION) binding.connectionLog.addView(connectionHolder) else binding.disconnectionLog.addView(connectionHolder)
            binding.connectionScroll.post { binding.connectionScroll.fullScroll(View.FOCUS_DOWN) }
            binding.disconnectionScroll.post { binding.disconnectionScroll.fullScroll(View.FOCUS_DOWN) }
        }
        binding.friendcode.text= profile.userCode
    }
}
