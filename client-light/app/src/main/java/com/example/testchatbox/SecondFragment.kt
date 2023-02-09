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
        super.onViewCreated(view, savedInstanceState)

        SocketHandler.getSocket().on("New Message") { args ->
            if(args[0] != null){
                print(binding)
                val currentText = binding.textView.text.toString()
                val message = args[0] as String;
                binding.textView.text = currentText + System.getProperty("line.separator") + message;
            }
        }
        binding.send.setOnClickListener {
            var text = binding.inputText.text.toString();
            if(text.isNotEmpty()){
                val currentDate = Calendar.getInstance().time.toString();
                val userName = LoggedInUser.getName();
                binding.inputText.setText("");
                text = "$currentDate | $userName : $text";
                SocketHandler.getSocket().emit("Message Sent", text)
            }
        }
    }

}
