package com.example.testchatbox

import SocketHandler
import android.os.Bundle
import android.os.UserHandle
import android.text.method.ScrollingMovementMethod
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentSecondBinding
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
        SocketHandler.getSocket().on("New Message") { args ->
            if(args[0] != null){
                val currentText = binding.textView.text.toString()
                val message = args[0] as String;
                binding.textView.text = currentText + System.getProperty("line.separator") + message;
            }

        }
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.send.setOnClickListener {
            var text = binding.inputText.text.toString();
            if(text.isNotEmpty()){
                val currentDate = Calendar.getInstance().time.toString()
                binding.inputText.setText("");
                text = "$currentDate : $text";
                SocketHandler.getSocket().emit("Message Sent", text)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
