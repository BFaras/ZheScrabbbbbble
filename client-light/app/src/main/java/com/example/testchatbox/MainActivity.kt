package com.example.testchatbox

import android.content.Context
import android.content.res.Configuration
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import com.example.testchatbox.ThemeManager.setCustomizedThemes
import com.example.testchatbox.ThemeStorage.getThemeColor
import com.example.testchatbox.databinding.ActivityMainBinding
import com.example.testchatbox.login.model.LoggedInUser
import java.util.*


class MainActivity : AppCompatActivity() {

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setCustomizedThemes(this,getThemeColor(this));
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setLocale();

        setSupportActionBar(binding.toolbar)

        val navController = findNavController(R.id.nav_host_fragment_content_main)
        appBarConfiguration = AppBarConfiguration(navController.graph)
        setupActionBarWithNavController(navController, appBarConfiguration)
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        // Inflate the menu; this adds items to the action bar if it is present.
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        return when (item.itemId) {
            R.id.action_settings -> true
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment_content_main)
        return navController.navigateUp(appBarConfiguration)
            || super.onSupportNavigateUp()
    }

    private fun setLocale(){
        val locale = Locale(LoggedInUser.getLang())
        Locale.setDefault(locale)
        val config = Configuration()
        config.locale = locale
        baseContext.resources.updateConfiguration(
            config,
            baseContext.resources.displayMetrics
        )
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
    }
}

object ThemeStorage {
    fun setThemeColor(context: Context, themeColor: String?) {
        val sharedpreferences = context.getSharedPreferences("theme_data", Context.MODE_PRIVATE)
        val editor = sharedpreferences.edit()
        editor.putString("theme", themeColor)
        editor.apply()
    }

    fun getThemeColor(context: Context): String? {
        val sharedpreferences = context.getSharedPreferences("theme_data", Context.MODE_PRIVATE)
        return sharedpreferences.getString("theme", "grey")
    }
}

object ThemeManager {
    fun setCustomizedThemes(context: Context, theme: String?) {
        when (theme) {
            "classic" -> AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
            "inverted" -> {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
                context.setTheme(R.style.EclipseTheme)
            }
            "pink" -> {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
                context.setTheme(R.style.PinkTheme)
            }
            "green" -> {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
                context.setTheme(R.style.GreenTheme)
            }
            "blizzard" -> {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
                context.setTheme(R.style.BlizzardTheme)
            }
            else ->{
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
            }
        }
    }
}
