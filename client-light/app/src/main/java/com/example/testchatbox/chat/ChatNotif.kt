import android.widget.ImageButton
import com.example.testchatbox.R
import com.example.testchatbox.chat.ChatModel
import com.example.testchatbox.chat.Message
import com.example.testchatbox.chat.ObserverChat

object NotificationInfoHolder: ObserverChat {
    private val chatsUnread : MutableSet<String> = mutableSetOf();
    private var selectedChatCode: String = "";

    fun startObserverChat() {
        ChatModel.addObserver(this);
    }

    fun stopObserverChat() {
        ChatModel.removeObserver(this);
    }

    fun changeSelectedChatCode(newVal: String)
    {
        selectedChatCode = newVal;
        if (chatsUnread.contains(selectedChatCode))
        {
            chatsUnread.remove(selectedChatCode);
        }
    }

    override fun updateChannels() {
    }

    override fun updatePublicChannels() {
    }

    override fun updateMessage(chatCode: String, message: Message) {
        if (chatCode != "" && chatCode != selectedChatCode && !chatsUnread.contains(chatCode))
        {
            chatsUnread.add(chatCode);
        }
    }
}

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
