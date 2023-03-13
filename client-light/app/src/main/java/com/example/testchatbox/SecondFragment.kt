package com.example.testchatbox

import SocketHandler
import android.os.Bundle
import android.os.UserHandle
import android.text.method.ScrollingMovementMethod
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentSecondBinding
import com.example.testchatbox.login.model.LoggedInUser
import java.util.*

/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class SecondFragment : Fragment() {

    private var _binding: FragmentSecondBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentSecondBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState);
        SocketHandler.getSocket().on("New Message") { args ->
            if(args[0] != null){
                val message = args[0] as String
                binding.textView.append(message + System.getProperty("line.separator"));
                activity?.runOnUiThread {
                    binding.textView.invalidate()
                    binding.textView.requestLayout()
                }

            }
        }

        binding.inputText.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                sendMessage()
            }
            false
        }

        binding.send.setOnClickListener {
            sendMessage()
        }

    }
    private fun sendMessage() {
        var text = binding.inputText.text.toString().trim()
        if(text.isNotEmpty()){
            val currentDate = Calendar.getInstance().time.toString().split(' ')[3]
            val userName = LoggedInUser.getName()
            binding.inputText.setText("")
            text = "$currentDate | $userName : $text"
            SocketHandler.getSocket().emit("Message Sent", text)
            binding.scrollView.fullScroll(View.FOCUS_DOWN)
        }
    }

}
