package com.example.testchatbox.login

import android.os.Bundle
import android.util.Patterns
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.R
import com.example.testchatbox.databinding.FragmentResetPasswordBinding
import com.example.testchatbox.login.model.LoggedInUser
import SocketHandler
import android.widget.Toast
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.example.testchatbox.ThemeStorage
import com.example.testchatbox.chat.ChatModel
import java.util.*


/**
 * A simple [Fragment] subclass.
 * Use the [ResetPasswordFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class ResetPasswordFragment : Fragment() {

    private var _binding: FragmentResetPasswordBinding? = null
    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentResetPasswordBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val questionSection = binding.questionSection
        val usernameSection = binding.usernameSection
        val usernameEditText = binding.username
        val passwordEditText = binding.password
        val questionText = binding.question
        val answerEditText = binding.answer
        val resetButton = binding.reset
        var registerButton = binding.registerNewPassword

        WindowInsetsControllerCompat(requireActivity().window, requireActivity().window.decorView).apply {
            // Hide both the status bar and the navigation bar
            hide(WindowInsetsCompat.Type.systemBars())
            hide(WindowInsetsCompat.Type.statusBars())
            // Behavior of system bars
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }

        resetButton.setOnClickListener {
            val username= usernameEditText.text.toString()
            if(!isTextValid(username)) {
                usernameEditText.error =  getString(R.string.invalid_username)
            }else {
                try {
                    SocketHandler.getSocket().once("User Account Question"){ args ->
                        if(args[0] != null){
                            val question = args[0] as String;
                            activity?.runOnUiThread(Runnable {
                                if(!question.isEmpty()){
                                    questionText.text = question
                                    usernameSection.visibility = View.GONE
                                    questionSection.visibility = View.VISIBLE
                                }
                                else{
                                    val appContext = context?.applicationContext
                                    Toast.makeText(appContext, "Error", Toast.LENGTH_LONG).show()
                                }
                            });
                        }
                    }
                    SocketHandler.getSocket().emit("Reset User Password", username.trim())
                }
                catch (e: java.lang.Exception){
                    val appContext = context?.applicationContext
                    Toast.makeText(appContext, "Error", Toast.LENGTH_LONG).show()
                }
            }
        }

        registerButton.setOnClickListener {
            val username= usernameEditText.text.toString()
            val answer= answerEditText.text.toString()
            val password = passwordEditText.text.toString()
            if(!isTextValid(answer)) {
                answerEditText.error =  getString(R.string.invalid_username)
            }else if(!isPasswordValid(password)){
                passwordEditText.error = getString(R.string.invalid_password)
            } else {
                try {
                    SocketHandler.getSocket().once("Password Reset response"){ args ->
                        if(args[0] != null){
                            val error = args[0] as String;
                            if(error.toInt() == 0){
                                activity?.runOnUiThread(Runnable {

                                    findNavController().navigate(R.id.action_resetFragment_to_MainMenuFragment)
                                });
                            }
                            val errorMessage = when(error.toInt()){
                                0 -> R.string.NO_ERROR
                                3 -> R.string.PASSWORD_INVALID
                                5 -> R.string.DATABASE_UNAVAILABLE
                                6 -> R.string.WRONG_SECURITY_ANSWER
                                else -> R.string.ERROR
                            }
                            activity?.runOnUiThread(Runnable {
                                if(errorMessage==R.string.NO_ERROR){
                                    LoggedInUser.connectUser(usernameEditText.text.toString())
                                    ChatModel.initialiseChat();
                                    SocketHandler.getSocket().on("Theme and Language Response"){args ->
                                        if(args[0]!=null && args[1]!=null){
                                            val theme = args[0] as String;
                                            val lang = args[1] as String;
                                            LoggedInUser.setTheme(theme);
                                            LoggedInUser.setLang(lang);
                                            activity?.applicationContext?.let { it1 ->
                                                ThemeStorage.setThemeColor(
                                                    it1,
                                                    theme
                                                )
                                            };
                                            activity?.runOnUiThread(Runnable {
                                                setLocale(lang)
                                                findNavController().navigate(R.id.action_loginFragment_to_MainMenuFragment)
                                            });
                                        }
                                    }
                                    SocketHandler.getSocket().emit("Get Theme and Language")
                                }
                                else {
                                val appContext = context?.applicationContext
                                Toast.makeText(appContext, errorMessage, Toast.LENGTH_LONG).show()
                                }
                            });
                        }
                    }
                    SocketHandler.getSocket().emit("Account Question Answer", username.trim(),answer.trim(), password.trim())
                }
                catch (e: java.lang.Exception){
                    val appContext = context?.applicationContext
                    Toast.makeText(appContext, "Error", Toast.LENGTH_LONG).show()
                }
            }
        }


    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }


    private fun isTextValid(text: String): Boolean {
        return text.isNotBlank()
    }


    private fun isPasswordValid(password: String): Boolean {
        return password.length > 5
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
    }

}
