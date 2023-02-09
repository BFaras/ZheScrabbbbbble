package com.example.testchatbox

import SocketHandler
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentFirstBinding
import com.example.testchatbox.login.model.LoggedInUser

/**
 * A simple [Fragment] subclass as the default destination in the navigation.
 */
class FirstFragment : Fragment() {

private var _binding: FragmentFirstBinding? = null
    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

      _binding = FragmentFirstBinding.inflate(inflater, container, false)
      return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.textviewFirst.text = "Hello "+LoggedInUser.getName()

        binding.buttonchat.setOnClickListener {
            findNavController().navigate(R.id.action_FirstFragment_to_SecondFragment)
        }

        binding.buttonDisconnect.setOnClickListener {
            SocketHandler.closeConnection();
            LoggedInUser.disconnectUser();
            SocketHandler.establishConnection();
            findNavController().navigate(R.id.action_FirstFragment_to_loginFragment)
        }
    }

override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
