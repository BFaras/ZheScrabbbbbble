package com.example.testchatbox.login

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.annotation.StringRes
import androidx.appcompat.app.AlertDialog
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.MainActivity
import com.example.testchatbox.R
import com.example.testchatbox.chat.ChatModel
import com.example.testchatbox.databinding.FragmentRegisterBinding
import com.example.testchatbox.login.model.LoggedInUser
import com.google.android.material.imageview.ShapeableImageView
import java.util.*


class RegisterFragment : Fragment() {

    private lateinit var registerViewModel: RegisterViewModel
    private var _binding: FragmentRegisterBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentRegisterBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        registerViewModel = ViewModelProvider(this, RegisterViewModelFactory())
            .get(RegisterViewModel::class.java)

        val usernameEditText = binding.username
        val emailEditText = binding.email
        val passwordEditText = binding.password
        val questionEditText = binding.question
        val answerEditText = binding.answer
        val registerButton = binding.register
        val loadingProgressBar = binding.loading

        WindowInsetsControllerCompat(requireActivity().window, requireActivity().window.decorView).apply {
            // Hide both the status bar and the navigation bar
            hide(WindowInsetsCompat.Type.systemBars())
            hide(WindowInsetsCompat.Type.statusBars())
            // Behavior of system bars
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }

        registerViewModel.RegisterFormState.observe(viewLifecycleOwner,
            Observer { registerFormState ->
                if (registerFormState == null) {
                    return@Observer
                }
                registerButton.isEnabled = registerFormState.isDataValid
                registerFormState.usernameError?.let {
                    usernameEditText.error = getString(it)
                }
                registerFormState.emailError?.let {
                    emailEditText.error = getString(it)
                }
                registerFormState.passwordError?.let {
                    passwordEditText.error = getString(it)
                }
                registerFormState.questionError?.let {
                    questionEditText.error = getString(it)
                }
                registerFormState.answerError?.let {
                    answerEditText.error = getString(it)
                }
            })

        registerViewModel.loginResult.observe(viewLifecycleOwner,
            Observer { loginResult ->
                loginResult ?: return@Observer
                loadingProgressBar.visibility = View.GONE
                loginResult.error?.let {
                    showRegisterFailed(it)
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
                registerViewModel.loginDataChanged(
                    usernameEditText.text.toString(),
                    emailEditText.text.toString(),
                    passwordEditText.text.toString(),
                    questionEditText.text.toString(),
                    answerEditText.text.toString()
                )
            }
        }
        binding.playerInGameAvatar.setOnClickListener {
            val builder = context?.let { it -> AlertDialog.Builder(it,R.style.CustomAlertDialog).create() }
            val alertView = layoutInflater.inflate(R.layout.alert_choose_avatar, null)
            val avatar1 = alertView.findViewById<ShapeableImageView>(R.id.avatar1)
            val avatar2 = alertView.findViewById<ShapeableImageView>(R.id.avatar2)
            val avatar3 = alertView.findViewById<ShapeableImageView>(R.id.avatar3)
            builder?.setView(alertView)
            avatar1.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.cat)
                //socket
                builder?.dismiss()
            }
            avatar2.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.dog)
                //socket
                builder?.dismiss()
            }
            avatar3.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.flower)
                //socket
                builder?.dismiss()
            }
            builder?.show()
        }
        usernameEditText.addTextChangedListener(afterTextChangedListener)
        emailEditText.addTextChangedListener(afterTextChangedListener)
        passwordEditText.addTextChangedListener(afterTextChangedListener)
        questionEditText.addTextChangedListener(afterTextChangedListener)
        answerEditText.addTextChangedListener(afterTextChangedListener)
        answerEditText.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                registerViewModel.register(
                    usernameEditText.text.toString(),
                    emailEditText.text.toString(),
                    passwordEditText.text.toString(),
                    questionEditText.text.toString(),
                    answerEditText.text.toString()
                )
            }
            false
        }

        registerButton.setOnClickListener {
            loadingProgressBar.visibility = View.VISIBLE
            registerViewModel.register(
                usernameEditText.text.toString(),
                emailEditText.text.toString(),
                passwordEditText.text.toString(),
                questionEditText.text.toString(),
                answerEditText.text.toString()
            )
        }
    }

    private fun updateUiWithUser(model: LoggedInUserView) {
        LoggedInUser.connectUser(model.displayName)
        ChatModel.initialiseChat();
        findNavController().navigate(R.id.action_registerFragment_to_MainMenuFragment)
    }

    private fun showRegisterFailed(@StringRes errorString: Int) {
        val appContext = context?.applicationContext ?: return
        Toast.makeText(appContext, errorString, Toast.LENGTH_LONG).show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
