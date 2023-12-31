package com.example.testchatbox.login

/**
 * Data validation state of the login form.
 */
data class RegisterFormState(
    val usernameError: Int? = null,
    val passwordError: Int? = null,
    val emailError: Int?=null,
    val questionError: Int? = null,
    val answerError: Int?=null,
    val isDataValid: Boolean = false
)
