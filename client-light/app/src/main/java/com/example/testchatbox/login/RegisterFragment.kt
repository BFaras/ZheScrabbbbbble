package com.example.testchatbox.login

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
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
    private var choosenAvatar = ""

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

        usernameEditText.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                hideKeyboard()
            }
        }
        emailEditText.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                hideKeyboard()
            }
        }
        passwordEditText.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                hideKeyboard()
            }
        }
        questionEditText.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                hideKeyboard()
            }
        }
        answerEditText.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                hideKeyboard()
            }
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

            //to be unlocked after
            avatar17.visibility = View.GONE //shark
            avatar14.visibility = View.GONE //panda
            avatar18.visibility = View.GONE //skeleton
            avatar19.visibility = View.GONE //tiger
            avatar4.visibility = View.GONE //bunny

            builder?.setView(alertView)
            avatar1.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.cat)
                choosenAvatar = "cat.png"
                builder?.dismiss()
            }
            avatar2.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.dog)
                choosenAvatar = "dog.png"
                builder?.dismiss()
            }
            avatar3.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.bear)
                choosenAvatar = "bear.png"
                builder?.dismiss()
            }
            avatar5.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.cow)
                choosenAvatar = "cow.png"
                builder?.dismiss()
            }
            avatar6.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.alien)
                choosenAvatar = "alien.png"
                builder?.dismiss()
            }
            avatar7.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.fox)
                choosenAvatar = "fox.png"
                builder?.dismiss()
            }
            avatar8.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.giraffe)
                choosenAvatar = "giraffe.png"
                builder?.dismiss()
            }
            avatar9.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.koala)
                choosenAvatar = "koala.png"
                builder?.dismiss()
            }
            avatar10.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.lion)
                choosenAvatar = "lion.png"
                builder?.dismiss()
            }
            avatar11.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.monkey)
                choosenAvatar = "monkey.png"
                builder?.dismiss()
            }
            avatar12.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.owl)
                choosenAvatar = "owl.png"
                builder?.dismiss()
            }
            avatar13.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.mouse)
                choosenAvatar = "mouse.png"
                builder?.dismiss()
            }

            avatar15.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.pig)
                choosenAvatar = "pig.png"
                builder?.dismiss()
            }
            avatar16.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.rooster)
                choosenAvatar = "rooster.png"
                builder?.dismiss()
            }
            avatar20.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.unicorn)
                choosenAvatar = "unicorn.png"
                builder?.dismiss()
            }
            avatar21.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.arnaud)
                choosenAvatar = "arnaud.PNG"
                builder?.dismiss()
            }
            avatar22.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.daria)
                choosenAvatar = "daria.PNG"
                builder?.dismiss()
            }
            avatar23.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.imane)
                choosenAvatar = "imane.PNG"
                builder?.dismiss()
            }
            avatar24.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.manuel)
                choosenAvatar = "manuel.PNG"
                builder?.dismiss()
            }
            avatar25.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.mohamed)
                choosenAvatar = "mohamed.PNG"
                builder?.dismiss()
            }
            avatar26.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.raphael)
                choosenAvatar = "raphael.PNG"
                builder?.dismiss()
            }
            avatar27.setOnClickListener {
                binding.playerInGameAvatar.setImageResource(R.drawable.ghost)
                choosenAvatar = "ghost.png"
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
                    choosenAvatar,
                    passwordEditText.text.toString(),
                    questionEditText.text.toString(),
                    answerEditText.text.toString()
                )
            }
            false
        }

        registerButton.setOnClickListener {
            if (choosenAvatar != "") {
                loadingProgressBar.visibility = View.VISIBLE
                registerViewModel.register(
                    usernameEditText.text.toString(),
                    emailEditText.text.toString(),
                    choosenAvatar,
                    passwordEditText.text.toString(),
                    questionEditText.text.toString(),
                    answerEditText.text.toString()
                )
            } else {
                Toast.makeText(context, getString(R.string.avatarError), Toast.LENGTH_LONG).show()
            }
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

    private fun hideKeyboard() {
        val imm = context!!.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.toggleSoftInput(InputMethodManager.HIDE_IMPLICIT_ONLY, 0)
    }
}
