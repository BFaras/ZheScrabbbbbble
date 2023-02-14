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

        resetButton.setOnClickListener {
            val username= usernameEditText.text.toString()
            if(!isTextValid(username)) {
                usernameEditText.error =  getString(R.string.invalid_username)
            }else {
                try {
                    usernameSection.visibility = View.GONE
                    questionSection.visibility = View.VISIBLE

                    SocketHandler.getSocket().once("Authentification status"){ args ->
                        if(args[0] != null){
                            val question = args[0] as String;
                            questionText.text = question
                            usernameSection.visibility = View.GONE
                            questionSection.visibility = View.VISIBLE
                        }
                    }
                    SocketHandler.getSocket().emit("Reset User Password", username)
                }
                catch (e: java.lang.Exception){
                    val appContext = context?.applicationContext
                    Toast.makeText(appContext, "Error", Toast.LENGTH_LONG).show()
                }
            }
        }

        registerButton.setOnClickListener {
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
                            if(error.isEmpty()){
                                LoggedInUser.connectUser(usernameEditText.text.toString())
                                findNavController().navigate(R.id.action_resetFragment_to_FirstFragment)
                            }
                            val appContext = context?.applicationContext
                            Toast.makeText(appContext, "Error", Toast.LENGTH_LONG).show()
                        }
                    }
                    SocketHandler.getSocket().emit("Account Question Answer", answer, password)
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



}
