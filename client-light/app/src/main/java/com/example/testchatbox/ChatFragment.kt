package com.example.testchatbox

import SocketHandler
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.testchatbox.databinding.FragmentChatBinding
import com.example.testchatbox.login.model.LoggedInUser
import java.util.*

/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class ChatFragment : Fragment() {

    private var _binding: FragmentChatBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentChatBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState);
        SocketHandler.getSocket().on("New Message") { args ->
            if(args[0] != null){
                val message = args[0] as String;
                binding.textView.append(message + System.getProperty("line.separator"));
                activity?.runOnUiThread(Runnable {
                    binding.textView.invalidate();
                    binding.textView.requestLayout();
                });

            }
        }

        binding.send.setOnClickListener {
            var text = binding.inputText.text.toString().trim();
            if(text.isNotEmpty()){
                val currentDate = Calendar.getInstance().time.toString().split(' ')[3];
                val userName = LoggedInUser.getName();
                binding.inputText.setText("");
                text = "$currentDate | $userName : $text";
                SocketHandler.getSocket().emit("Message Sent", text)
            }
        }
    }

}
