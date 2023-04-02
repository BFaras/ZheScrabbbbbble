package com.example.testchatbox.chat

import android.widget.ImageButton
import com.example.testchatbox.R

class ChatNotifier: ObserverChat {
    private lateinit var chatButton: ImageButton;

    public fun setChatButton(button: ImageButton) {
        this.chatButton = button;
    }

    fun startObserverChat() {
        ChatModel.addObserver(this);
    }

    fun stopObserverChat() {
        ChatModel.removeObserver(this);
    }

    override fun updateChannels() {
    }

    override fun updatePublicChannels() {
    }

    override fun updateMessage(chatCode: String, message: Message) {
        if (this.chatButton != null) {
            this.chatButton.setBackgroundResource(R.drawable.ic_chat_notif);
        }
    }
}
