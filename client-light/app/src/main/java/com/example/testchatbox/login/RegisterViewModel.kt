package com.example.testchatbox.login

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import android.util.Patterns

import com.example.testchatbox.R
import java.io.Serializable

class RegisterViewModel() : ViewModel() {

    private val _registerForm = MutableLiveData<RegisterFormState>()
    val RegisterFormState: LiveData<RegisterFormState> = _registerForm

    private val _loginResult = MutableLiveData<LoginResult>()
    val loginResult: LiveData<LoginResult> = _loginResult

    fun register(username: String, email: String, password: String, question : String, answer : String) {
        SocketHandler.getSocket().once("Creation result"){ args ->
            if(args[0] != null){
                val result = args[0] as String;
                when(result.toInt()){
                    0 -> _loginResult.postValue(LoginResult(success = LoggedInUserView(displayName = username)))
                    1 -> _loginResult.postValue(LoginResult(error = R.string.USERNAME_INVALID ))
                    2 -> _loginResult.postValue(LoginResult(error = R.string.EMAIL_INVALID ))
                    3 -> _loginResult.postValue(LoginResult(error = R.string.PASSWORD_INVALID ))
                    4 -> _loginResult.postValue(LoginResult(error = R.string.USERNAME_TAKEN ))
                    5 -> _loginResult.postValue(LoginResult(error = R.string.DATABASE_UNAVAILABLE ))
                }
            }
        }
        class Question(val question: String, val answer: String) :Serializable{}
        SocketHandler.getSocket().emit("Create user account", username, password, email, "Avatar",  Question(question, answer));
    }




    fun loginDataChanged(username: String,email : String, password: String, question :String, answer : String) {
        if (!isTextValid(username)) {
            _registerForm.value = RegisterFormState(usernameError = R.string.invalid_username)
        } else if (!isEmailValid(email)) {
            _registerForm.value = RegisterFormState(emailError = R.string.invalid_email)
        } else if (!isPasswordValid(password)) {
            _registerForm.value = RegisterFormState(passwordError = R.string.invalid_password)
        }else if (!isTextValid(question)) {
            _registerForm.value = RegisterFormState(questionError = R.string.invalid_question)
        }else if (!isTextValid(answer)) {
            _registerForm.value = RegisterFormState(answerError = R.string.invalid_answer)
        } else {
            _registerForm.value = RegisterFormState(isDataValid = true)
        }
    }

    private fun isTextValid(text: String): Boolean {
        return text.isNotBlank()
    }

    private fun isEmailValid(email: String): Boolean {
        return Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }

    private fun isPasswordValid(password: String): Boolean {
        return password.length > 5
    }
}
