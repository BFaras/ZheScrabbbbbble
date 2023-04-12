package com.example.testchatbox

import SocketHandler
import android.annotation.SuppressLint
import android.content.Intent
import android.content.res.ColorStateList
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import android.widget.RelativeLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.widget.AppCompatButton
import androidx.core.app.ActivityCompat
import androidx.core.text.HtmlCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentProfilBinding
import com.example.testchatbox.login.model.LoggedInUser
import com.google.android.material.imageview.ShapeableImageView
import org.json.JSONArray
import org.json.JSONObject
import java.math.RoundingMode
import java.util.*


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
        }

        binding.buttonDisconnectionLog.setOnClickListener {
            context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, selectedColor, true)
            context?.theme?.resolveAttribute(R.attr.buttonColor, notSelectedColor, true)
            binding.connectionScroll.visibility = View.GONE
            binding.buttonConnectionLog.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)
            binding.disconnectionScroll.visibility = View.VISIBLE
            binding.buttonDisconnectionLog.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
        }

        binding.playerInGameAvatar.setOnClickListener {
            val builder = context?.let { it -> AlertDialog.Builder(it,R.style.CustomAlertDialog).create() }
            val alertView = layoutInflater.inflate(R.layout.alert_choose_avatar, null)

            val sharkLock = alertView.findViewById<ShapeableImageView>(R.id.sharkLock)
            val pandaLock = alertView.findViewById<ShapeableImageView>(R.id.pandaLock)
            val skeletonLock = alertView.findViewById<ShapeableImageView>(R.id.skeletonLock)
            val tigerLock = alertView.findViewById<ShapeableImageView>(R.id.tigerLock)
            val bunnyLock = alertView.findViewById<ShapeableImageView>(R.id.bunnyLock)

            val condShark = alertView.findViewById<TextView>(R.id.condShark)
            val condPanda = alertView.findViewById<TextView>(R.id.condPanda)
            val condSkeleton = alertView.findViewById<TextView>(R.id.condSkeleton)
            val condTiger = alertView.findViewById<TextView>(R.id.condTiger)
            val condBunny = alertView.findViewById<TextView>(R.id.condBunny)

            val avatar1 = alertView.findViewById<ShapeableImageView>(R.id.avatar1)
            val avatar2 = alertView.findViewById<ShapeableImageView>(R.id.avatar2)
            val avatar3 = alertView.findViewById<ShapeableImageView>(R.id.avatar3)
            val avatar4 = alertView.findViewById<ShapeableImageView>(R.id.avatar4)
            val avatar5 = alertView.findViewById<ShapeableImageView>(R.id.avatar5)
            val avatar6 = alertView.findViewById<ShapeableImageView>(R.id.avatar6)
            val avatar7 = alertView.findViewById<ShapeableImageView>(R.id.avatar7)
            val avatar8 = alertView.findViewById<ShapeableImageView>(R.id.avatar8)
            val avatar9 = alertView.findViewById<ShapeableImageView>(R.id.avatar9)
            val avatar10 = alertView.findViewById<ShapeableImageView>(R.id.avatar10)
            val avatar11 = alertView.findViewById<ShapeableImageView>(R.id.avatar11)
            val avatar12 = alertView.findViewById<ShapeableImageView>(R.id.avatar12)
            val avatar13 = alertView.findViewById<ShapeableImageView>(R.id.avatar13)
            val avatar14 = alertView.findViewById<ShapeableImageView>(R.id.avatar14)
            val avatar15 = alertView.findViewById<ShapeableImageView>(R.id.avatar15)
            val avatar16 = alertView.findViewById<ShapeableImageView>(R.id.avatar16)
            val avatar17 = alertView.findViewById<ShapeableImageView>(R.id.avatar17)
            val avatar18 = alertView.findViewById<ShapeableImageView>(R.id.avatar18)
            val avatar19 = alertView.findViewById<ShapeableImageView>(R.id.avatar19)
            val avatar20 = alertView.findViewById<ShapeableImageView>(R.id.avatar20)
            val avatar21 = alertView.findViewById<ShapeableImageView>(R.id.avatar21)
            val avatar22 = alertView.findViewById<ShapeableImageView>(R.id.avatar22)
            val avatar23 = alertView.findViewById<ShapeableImageView>(R.id.avatar23)
            val avatar24 = alertView.findViewById<ShapeableImageView>(R.id.avatar24)
            val avatar25 = alertView.findViewById<ShapeableImageView>(R.id.avatar25)
            val avatar26 = alertView.findViewById<ShapeableImageView>(R.id.avatar26)
            val avatar27 = alertView.findViewById<ShapeableImageView>(R.id.avatar27)


            //to be unlocked
            setDisabled(avatar4) //bunny
            if (profile.tournamentWins[0] >= 2) {
                avatar4.clearColorFilter()
                bunnyLock.visibility = View.GONE
                condBunny.visibility = View.GONE
                avatar4.setOnClickListener {
                    binding.playerInGameAvatar.setImageResource(R.drawable.bunny)
                    changeAvatar("bunny.png")
                    builder?.dismiss()
                }
            } //bunny

            setDisabled(avatar17)
            if (profile.level.level >= 2) {
                avatar17.clearColorFilter()
                sharkLock.visibility = View.GONE
                condShark.visibility = View.GONE
                avatar17.setOnClickListener {
                    binding.playerInGameAvatar.setImageResource(R.drawable.shark)
                    changeAvatar("shark.png")
                    builder?.dismiss()
                }
            } //shark

            setDisabled(avatar14) //panda
            if (profile.level.level >= 4) {
                avatar14.clearColorFilter()
                pandaLock.visibility = View.GONE
                condPanda.visibility = View.GONE
                avatar14.setOnClickListener {
                    binding.playerInGameAvatar.setImageResource(R.drawable.panda)
                    changeAvatar("panda.png")
                    builder?.dismiss()
                }
            } //panda

            setDisabled(avatar18) //skeleton
            if (profile.tournamentWins[0] >= 1) {
                avatar18.clearColorFilter()
                skeletonLock.visibility = View.GONE
                condSkeleton.visibility = View.GONE
                avatar18.setOnClickListener {
                    binding.playerInGameAvatar.setImageResource(R.drawable.skeleton)
                    changeAvatar("skeleton.png")
                    builder?.dismiss()
                }
            }

            setDisabled(avatar19) //tiger
            if (profile.level.level >= 6) {
                avatar19.clearColorFilter()
                tigerLock.visibility = View.GONE
                condTiger.visibility = View.GONE
                avatar19.setOnClickListener {
                    binding.playerInGameAvatar.setImageResource(R.drawable.tiger)
                    changeAvatar("tiger.png")
                    builder?.dismiss()
                }
            }

            builder?.setView(alertView)
            avatar1.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.cat)
                changeAvatar("cat.png")
                builder?.dismiss()
            }
            avatar2.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.dog)
                changeAvatar("dog.png")
                builder?.dismiss()
            }
            avatar3.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.bear)
                changeAvatar("bear.png")
                builder?.dismiss()
            }
            avatar5.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.cow)
                changeAvatar("cow.png")
                builder?.dismiss()
            }
            avatar6.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.alien)
                changeAvatar("alien.png")
                builder?.dismiss()
            }
            avatar7.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.fox)
                changeAvatar("fox.png")
                builder?.dismiss()
            }
            avatar8.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.giraffe)
                changeAvatar("giraffe.png")
                builder?.dismiss()
            }
            avatar9.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.koala)
                changeAvatar("koala.png")
                builder?.dismiss()
            }
            avatar10.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.lion)
                changeAvatar("lion.png")
                builder?.dismiss()
            }
            avatar11.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.monkey)
                changeAvatar("monkey.png")
                builder?.dismiss()
            }
            avatar12.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.owl)
                changeAvatar("owl.png")
                builder?.dismiss()
            }
            avatar13.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.mouse)
                changeAvatar("mouse.png")
                builder?.dismiss()
            }

            avatar15.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.pig)
                changeAvatar("pig.png")
                builder?.dismiss()
            }
            avatar16.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.rooster)
                changeAvatar("rooster.png")
                builder?.dismiss()
            }
            avatar20.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.unicorn)
                changeAvatar("unicorn.png")
                builder?.dismiss()
            }
            avatar21.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.arnaud)
                changeAvatar("arnaud.PNG")
                builder?.dismiss()
            }
            avatar22.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.daria)
                changeAvatar("daria.PNG")
                builder?.dismiss()
            }
            avatar23.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.imane)
                changeAvatar("imane.PNG")
                builder?.dismiss()
            }
            avatar24.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.manuel)
                changeAvatar("manuel.PNG")
                builder?.dismiss()
            }
            avatar25.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.mohamed)
                changeAvatar("mohamed.PNG")
                builder?.dismiss()
            }
            avatar26.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.raphael)
                changeAvatar("raphael.PNG")
                builder?.dismiss()
            }
            avatar27.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.ghost)
                changeAvatar("ghost.png")
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
                        profile.avatar= newAvatar
                        binding.playerInGameAvatar.setImageResource(resources.getIdentifier((newAvatar.dropLast(4)).lowercase(), "drawable", activity?.packageName))
                    } else{
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
                        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, selectedColor, true)
                        binding.theme.text= newTheme
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
                        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorPrimary, notSelectedColor, true)
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
        binding.profilHolder.visibility = View.VISIBLE
        binding.loadingProfil.visibility = View.GONE
        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, selectedColor, true)
        context?.theme?.resolveAttribute(R.attr.buttonColor, notSelectedColor, true)
        binding.buttonConnectionLog.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
        binding.connectionScroll.visibility = View.VISIBLE
        binding.disconnectionScroll.visibility = View.GONE
        binding.buttonDisconnectionLog.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)


        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorSecondary, selectedColor, true)
        context?.theme?.resolveAttribute(com.google.android.material.R.attr.colorPrimary, notSelectedColor, true)

        binding.playerName.text = LoggedInUser.getName()
        binding.playerInGameAvatar.setImageResource(resources.getIdentifier((profile.avatar.dropLast(4)).lowercase(), "drawable", activity?.packageName))

        if (LoggedInUser.getLang() == "fr") {
            binding.frLangue.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
            binding.enLangue.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)
        } else {
            binding.frLangue.backgroundTintList = ColorStateList.valueOf(notSelectedColor.data)
            binding.enLangue.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
        }

        when (LoggedInUser.getTheme()) {
            "pink" -> binding.pink.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
            "green" -> binding.green.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
            "blizzard" -> binding.blizzard.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
            "classic" -> binding.lightTheme.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
            "inverted" -> binding.darkTheme.backgroundTintList = ColorStateList.valueOf(selectedColor.data)
            else -> {}
        }

        binding.theme.text= LoggedInUser.getTheme()
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
    fun setDisabled(imageView: ShapeableImageView) {
        val grayscaleMatrix = ColorMatrix()
        grayscaleMatrix.setSaturation(0f)
        imageView.colorFilter = ColorMatrixColorFilter(grayscaleMatrix)
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
