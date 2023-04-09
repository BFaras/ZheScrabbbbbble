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
import com.example.testchatbox.login.model.LoggedInUser
import com.google.android.material.imageview.ShapeableImageView
import org.json.JSONArray
import org.json.JSONObject
import java.math.RoundingMode
import java.util.*
import kotlin.collections.ArrayList

enum class ConnectionType {
    CONNECTION,
    DISCONNECTION;

    companion object {
        fun fromInt(value: Int) = ConnectionType.values().first { it.ordinal == value }
    }
}

data class LevelInfo (
    val level: Int,
    val xp: Int,
    val nextLevelXp: Int,
    )

data class Statistic(val name: String, val statAmount: Number)

data class ConnectionInfo (val connectionType: ConnectionType, val date: String, val time: String)

data class GameHistoryInfo (val date: String, val time: String, val isWinner: Boolean)

data class ProfileInfo (var avatar: String, var level: LevelInfo, var userCode: String, val stats: ArrayList<Statistic>, val tournamentWins: ArrayList<Int>, val connectionHistory: ArrayList<ConnectionInfo>, val gameHistory: ArrayList<GameHistoryInfo>)


class ProfilFragment : Fragment() {

    private var _binding: FragmentProfilBinding? = null
    private val selectedColor = TypedValue()
    private val notSelectedColor = TypedValue()

    private val binding get() = _binding!!

    private lateinit var profile : ProfileInfo

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentProfilBinding.inflate(inflater, container, false)
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
        getProfile(LoggedInUser.getName())

        binding.playerInGameAvatar.setOnClickListener {
            val builder = context?.let { it -> AlertDialog.Builder(it,R.style.CustomAlertDialog).create() }
            val alertView = layoutInflater.inflate(R.layout.alert_choose_avatar, null)
            val avatar1 = alertView.findViewById<ShapeableImageView>(R.id.avatar1)
            val avatar2 = alertView.findViewById<ShapeableImageView>(R.id.avatar2)
            val avatar3 = alertView.findViewById<ShapeableImageView>(R.id.avatar3)
            builder?.setView(alertView)
            avatar1.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.cat)
                changeAvatar("cat.jpg")
                builder?.dismiss()
            }
            avatar2.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.dog)
                changeAvatar("dog.jpg")
                builder?.dismiss()
            }
            avatar3.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.flower)
                changeAvatar("flower.jpg")
                builder?.dismiss()
            }
            builder?.show()
        }

        binding.darkTheme.setOnClickListener {
            binding.theme.text = "inverted"
            LoggedInUser.setTheme("inverted")
            changeTheme("inverted")
            activity?.applicationContext?.let { it1 -> ThemeStorage.setThemeColor(it1, "inverted") };

            activity?.let { it1 ->
                ThemeManager.setCustomizedThemes(
                    it1.applicationContext,
                    "inverted"
                )
            };
            activity?.let { it1 -> ActivityCompat.recreate(it1) }

        }

        binding.blizzard.setOnClickListener {
            binding.theme.text = "blizzard"
            LoggedInUser.setTheme("blizzard")
            changeTheme("blizzard")
            activity?.applicationContext?.let { it1 -> ThemeStorage.setThemeColor(it1, "blizzard") };
            activity?.let { it1 ->
                ThemeManager.setCustomizedThemes(
                    it1.applicationContext,
                    "blizzard"
                )
            };
            activity?.let { it1 -> ActivityCompat.recreate(it1) }

        }

        binding.lightTheme.setOnClickListener {
            binding.theme.text = "classic"
            LoggedInUser.setTheme("classic")
            changeTheme("classic")
            activity?.applicationContext?.let { it1 ->
                ThemeStorage.setThemeColor(
                    it1,
                    "classic"
                )
            };

            activity?.let { it1 ->
                ThemeManager.setCustomizedThemes(
                    it1.applicationContext,
                    "classic"
                )
            };
            activity?.let { it1 -> ActivityCompat.recreate(it1) }

        }

        binding.pink.setOnClickListener {
            binding.theme.text = "pink"
            LoggedInUser.setTheme("pink")
            changeTheme("pink")
            activity?.applicationContext?.let { it1 ->
                ThemeStorage.setThemeColor(
                    it1,
                    "pink"
                )
            };

            activity?.let { it1 ->
                ThemeManager.setCustomizedThemes(
                    it1.applicationContext,
                    "pink"
                )
            };
            activity?.let { it1 -> ActivityCompat.recreate(it1) }
        }

        binding.green.setOnClickListener {
            binding.theme.text = "green"
            LoggedInUser.setTheme("green")
            changeTheme("green")
            activity?.applicationContext?.let { it1 ->
                ThemeStorage.setThemeColor(
                    it1,
                    "green"
                )
            };

            activity?.let { it1 ->
                ThemeManager.setCustomizedThemes(
                    it1.applicationContext,
                    "green"
                )
            };
            activity?.let { it1 -> ActivityCompat.recreate(it1) }
        }

        binding.changeToFr.setOnClickListener { setLocale("fr"); changeLang("fr");refreshActivity() }
        binding.changeToEn.setOnClickListener { setLocale("en"); changeLang("en");refreshActivity() }


        binding.button2.setOnClickListener {
            findNavController().navigate(R.id.action_profilFragment_to_mainActivity2)
        }

        binding.editName.setOnClickListener {
            val builder = context?.let { it -> AlertDialog.Builder(it,R.style.CustomAlertDialog).create() }
            val alertView = layoutInflater.inflate(R.layout.alert_change_username, null)
            val dialogNo = alertView.findViewById<AppCompatButton>(R.id.dialogNo)
            val dialogYes = alertView.findViewById<AppCompatButton>(R.id.dialogYes)
            val username = alertView.findViewById<EditText>(R.id.username)
            builder?.setView(alertView)
            dialogNo.setOnClickListener {
                builder?.dismiss()
            }
            dialogYes.setOnClickListener {
                changeUsername(username.text.toString().trim())
                builder?.dismiss()
            }
            builder?.show()
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

    private fun changeAvatar(newAvatar:String){
        SocketHandler.getSocket().once("Avatar Change Response"){args->
            if(args[0]!=null){
                val errorMessage = when(args[0] as String){
                    "0" -> R.string.NO_ERROR
                    "5" -> R.string.DATABASE_UNAVAILABLE
                    else -> R.string.ERROR
                }
                activity?.runOnUiThread(Runnable {
                    if(errorMessage == R.string.NO_ERROR ){
                        profile.avatar= newAvatar;
                        when (newAvatar) {
                            "cat.jpg" -> binding.playerInGameAvatar.setImageResource(R.drawable.cat)
                            "dog.jpg" -> binding.playerInGameAvatar.setImageResource(R.drawable.dog)
                            "flower.jpg" -> binding.playerInGameAvatar.setImageResource(R.drawable.flower)
                            else -> {}
                        }
                    }else{
                        val appContext = context?.applicationContext
                        Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Change Avatar", newAvatar)
    }

    private fun changeUsername(newUsername:String){
        SocketHandler.getSocket().once("Username Change Response"){args->
            if(args[0]!=null){
                val errorMessage = when(args[0] as String){
                    "0" -> R.string.NO_ERROR
                    "4" -> R.string.USERNAME_TAKEN
                    "5" -> R.string.DATABASE_UNAVAILABLE
                    else -> R.string.ERROR
                }
                activity?.runOnUiThread(Runnable {
                    if(errorMessage == R.string.NO_ERROR ){
                        LoggedInUser.setName(newUsername)
                        binding.playerName.text= newUsername
                    }else{
                        val appContext = context?.applicationContext
                        Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Change Username", newUsername)
    }

    private fun changeTheme(newTheme:String){
        SocketHandler.getSocket().once("Theme Change Response"){args->
            if(args[0]!=null){
                val errorMessage = when(args[0] as String){
                    "0" -> R.string.NO_ERROR
                    "5" -> R.string.DATABASE_UNAVAILABLE
                    else -> R.string.ERROR
                }
                activity?.runOnUiThread(Runnable {
                    if(errorMessage == R.string.NO_ERROR ){
                        Log.d("THEME ", newTheme)
                        LoggedInUser.setTheme(newTheme)
                        binding.theme.text= newTheme.lowercase()
                    }else{
                        val appContext = context?.applicationContext
                        Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Change Theme", newTheme)
    }

    @SuppressLint("SetTextI18n")
    private fun changeLang(newLang:String){
        SocketHandler.getSocket().once("Language Change Response"){args->
            if(args[0]!=null){
                val errorMessage = when(args[0] as String){
                    "0" -> R.string.NO_ERROR
                    "5" -> R.string.DATABASE_UNAVAILABLE
                    else -> R.string.ERROR
                }
                activity?.runOnUiThread(Runnable {
                    if(errorMessage == R.string.NO_ERROR ){
                        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, selectedColor, true)
                        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorPrimary, selectedColor, true)
                        //binding.language.text= "Language : $newLang";
                        if (newLang == "fr") {
                            binding.frLangue.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
                            binding.enLangue.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)
                        } else {
                            binding.frLangue.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)
                            binding.enLangue.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
                        }
                        LoggedInUser.setLang(newLang)
                    }else{
                        val appContext = context?.applicationContext
                        Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                    }
                });
            }
        }
        SocketHandler.getSocket().emit("Change Language", newLang)
    }

    //TODO:Change for real UI
    @SuppressLint("MissingInflatedId")
    private fun updateView(){
        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, selectedColor, true)
        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorPrimary, notSelectedColor, true)

        binding.playerName.text = LoggedInUser.getName()
        when (profile.avatar) {
            "cat.jpg" -> binding.playerInGameAvatar.setImageResource(R.drawable.cat)
            "dog.jpg" -> binding.playerInGameAvatar.setImageResource(R.drawable.dog)
            "flower.jpg" -> binding.playerInGameAvatar.setImageResource(R.drawable.flower)
            else -> {}
        }
        if (LoggedInUser.getLang() == "fr") {
            binding.frLangue.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
            binding.enLangue.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)
        } else {
            binding.frLangue.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)
            binding.enLangue.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
        }
        binding.theme.text= LoggedInUser.getTheme()
        Log.d("USER THEME ", LoggedInUser.getTheme())
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
                gameInfoWinner.text = activity?.getString(R.string.iswinner)
                gameInfoWinner.setTextColor(Color.GREEN)
            } else {
                gameInfoWinner.text = activity?.getString(R.string.isloser)
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
            val connectionHolder = layoutInflater.inflate(R.layout.game_connection, binding.connectionLog, false)
            val connectionType =  connectionHolder.findViewById<TextView>(R.id.connectionType)
            val connectionTime = connectionHolder.findViewById<TextView>(R.id.timeConnection)
            val connectionDate = connectionHolder.findViewById<TextView>(R.id.dateConnection)
            connectionType.text = connection.connectionType.name
            connectionTime.text = connection.time
            connectionDate.text = connection.date
            binding.connectionLog.addView(connectionHolder)
            binding.connectionScroll.post { binding.connectionScroll.fullScroll(View.FOCUS_DOWN) }
        }
        binding.friendcode.text= profile.userCode;
    }

    private fun setLocale(lang:String){
        val locale = Locale(lang)
        Locale.setDefault(locale)
        val config = Configuration()
        config.locale = locale
        activity?.baseContext?.resources?.updateConfiguration(
            config,
            activity?.baseContext?.resources!!.displayMetrics
        )
    }
    private fun refreshActivity(){
        var refresh = Intent(context, ProfileActivity::class.java)
        startActivity(refresh)
    }
}
