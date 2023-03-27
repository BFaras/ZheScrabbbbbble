package com.example.testchatbox

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle

class ProfileActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ThemeManager.setCustomizedThemes(this, ThemeStorage.getThemeColor(this));
        setContentView(R.layout.activity_profile)
    }
}
