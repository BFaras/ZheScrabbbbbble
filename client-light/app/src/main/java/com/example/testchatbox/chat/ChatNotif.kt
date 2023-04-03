import android.util.Log
import android.widget.ImageButton
import com.example.testchatbox.R
import com.example.testchatbox.chat.ChatModel
import com.example.testchatbox.chat.Message
import com.example.testchatbox.chat.ObserverChat

object NotificationInfoHolder: ObserverChat {
    private val chatsUnread : MutableSet<String> = mutableSetOf();
    private var selectedChatCode: String = "";
    private var isStarted = false;
    private var functionOnMessageReceived: (() -> Unit)? = null;

    fun startObserverChat() {
        if (!isStarted) {
            ChatModel.addObserver(this);
            isStarted = true;
        }
    }

    fun stopObserverChat() {
        if (isStarted) {
            ChatModel.removeObserver(this);
            isStarted = false;
        }
    }

    fun setFunctionOnMessageReceived(function : (() -> Unit)?){
        functionOnMessageReceived = function;
    }

    fun changeSelectedChatCode(newVal: String) {
        selectedChatCode = newVal;
        if (chatsUnread.contains(selectedChatCode)) {
            chatsUnread.remove(selectedChatCode);
        }
    }

    fun isChatUnread(chatCode: String): Boolean {
        return chatsUnread.contains(chatCode);
    }

    fun areChatsUnread(): Boolean {
        return !chatsUnread.isEmpty();
    }

    override fun updateChannels() {
    }

    override fun updatePublicChannels() {
    }

    override fun updateMessage(chatCode: String, message: Message) {
        Log.i("CHAT", selectedChatCode);
        if (chatCode != "" && chatCode != selectedChatCode && !chatsUnread.contains(chatCode))
        {
            functionOnMessageReceived?.invoke();
        }
    }
}
