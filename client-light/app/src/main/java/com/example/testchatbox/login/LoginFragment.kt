package com.example.testchatbox.login

import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.annotation.StringRes
import androidx.core.app.ActivityCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.MainActivity
import com.example.testchatbox.R
import com.example.testchatbox.ThemeManager
import com.example.testchatbox.ThemeStorage
import com.example.testchatbox.chat.ChatModel
import com.example.testchatbox.databinding.FragmentLoginBinding
import com.example.testchatbox.login.model.LoggedInUser
import java.util.*
import kotlin.collections.ArrayList


class LoginFragment : Fragment() {

    private lateinit var loginViewModel: LoginViewModel
    private var _binding: FragmentLoginBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        loginViewModel = ViewModelProvider(this, LoginViewModelFactory())[LoginViewModel::class.java]

        val usernameEditText = binding.username
        val passwordEditText = binding.password
        val loginButton = binding.login
        var registerButton = binding.register
        var resetButton = binding.reset
        val loadingProgressBar = binding.loading

        val gameTest = binding.gameTest

        binding.darkTheme.setOnClickListener {
            activity?.applicationContext?.let { it1 -> ThemeStorage.setThemeColor(it1, "eclipse") };
            activity?.let { it1 ->
                ThemeManager.setCustomizedThemes(
                    it1.applicationContext,
                    "eclipse"
                )
            };
            activity?.let { it1 -> ActivityCompat.recreate(it1) }
        }

        binding.blizzard.setOnClickListener {
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
            activity?.applicationContext?.let { it1 ->
                ThemeStorage.setThemeColor(
                    it1,
                    "cremebrulee"
                )
            };
            activity?.let { it1 ->
                ThemeManager.setCustomizedThemes(
                    it1.applicationContext,
                    "cremebrulee"
                )
            };
            activity?.let { it1 -> ActivityCompat.recreate(it1) }
        }

        binding.astro.setOnClickListener {
            activity?.applicationContext?.let { it1 ->
                ThemeStorage.setThemeColor(
                    it1,
                    "astronaute"
                )
            };
            activity?.let { it1 ->
                ThemeManager.setCustomizedThemes(
                    it1.applicationContext,
                    "astronaute"
                )
            };
            activity?.let { it1 -> ActivityCompat.recreate(it1) }
        }


        WindowInsetsControllerCompat(requireActivity().window, requireActivity().window.decorView).apply {
            // Hide both the status bar and the navigation bar
            hide(WindowInsetsCompat.Type.systemBars())
            hide(WindowInsetsCompat.Type.statusBars())
            // Behavior of system bars
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }


        loginViewModel.loginFormState.observe(viewLifecycleOwner,
            Observer { loginFormState ->
                if (loginFormState == null) {
                    return@Observer
                }
                loginButton.isEnabled = loginFormState.isDataValid
                loginFormState.usernameError?.let {
                    usernameEditText.error = getString(it)
                }
                loginFormState.passwordError?.let {
                    passwordEditText.error = getString(it)
                }
            })

        loginViewModel.loginResult.observe(viewLifecycleOwner,
            Observer { loginResult ->
                loginResult ?: return@Observer
                loadingProgressBar.visibility = View.GONE
                loginResult.error?.let {
                    showLoginFailed(it)
                }
                loginResult.success?.let {
                    updateUiWithUser(it)
                }
            })

        val afterTextChangedListener = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence, start: Int, count: Int, after: Int) {
                // ignore
            }

            override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
                // ignore
            }

            override fun afterTextChanged(s: Editable) {
                loginViewModel.loginDataChanged(
                    usernameEditText.text.toString(),
                    passwordEditText.text.toString()
                )
            }
        }
        usernameEditText.addTextChangedListener(afterTextChangedListener)
        passwordEditText.addTextChangedListener(afterTextChangedListener)
        passwordEditText.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                loginViewModel.login(
                    usernameEditText.text.toString(),
                    passwordEditText.text.toString()
                )
            }
            false
        }

        loginButton.setOnClickListener {
            loadingProgressBar.visibility = View.VISIBLE
            loginViewModel.login(
                usernameEditText.text.toString(),
                passwordEditText.text.toString()
            )
        }
        registerButton.setOnClickListener {
            findNavController().navigate(R.id.action_loginFragment_to_registerFragment)
        }

        gameTest.setOnClickListener {
            findNavController().navigate(R.id.action_loginFragment_to_fullscreenFragment)
        }

        resetButton.setOnClickListener {
            findNavController().navigate(R.id.action_loginFragment_to_resetFragment)
        }

        binding.changeToFr.setOnClickListener { setLocale("fr") }
        binding.changeToEn.setOnClickListener { setLocale("en") }
    }

    private fun updateUiWithUser(model: LoggedInUserView) {
        ChatModel.initialiseChat();
        LoggedInUser.connectUser(model.displayName)
        findNavController().navigate(R.id.action_loginFragment_to_MainMenuFragment)
    }

    private fun showLoginFailed(@StringRes errorString: Int) {
        val appContext = context?.applicationContext ?: return
        Toast.makeText(appContext, errorString, Toast.LENGTH_LONG).show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun setLocale(language: String) {
        val locale = Locale(language)
        var res = resources
        var dm = res.displayMetrics
        var conf = res.configuration
        conf.locale = locale
        res.updateConfiguration(conf,dm)

        activity?.baseContext?.resources?.updateConfiguration(conf,
            activity?.baseContext?.resources!!.displayMetrics
        )
        var refresh = Intent(context, MainActivity::class.java)
        startActivity(refresh)
    }
}
