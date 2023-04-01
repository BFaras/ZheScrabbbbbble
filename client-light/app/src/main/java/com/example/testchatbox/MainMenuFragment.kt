package com.example.testchatbox

import SocketHandler
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.text.HtmlCompat
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.chat.ChatModel
import com.example.testchatbox.databinding.FragmentMainMenuBinding
import com.example.testchatbox.login.model.LoggedInUser


class MainMenuFragment : Fragment() {

private var _binding: FragmentMainMenuBinding? = null
    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
      _binding = FragmentMainMenuBinding.inflate(inflater, container, false)
      return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.textviewFirst.setText(HtmlCompat.fromHtml(getString(R.string.hello_message, LoggedInUser.getName()), HtmlCompat.FROM_HTML_MODE_LEGACY), TextView.BufferType.SPANNABLE)

        binding.buttonchat.setOnClickListener {
            findNavController().navigate(R.id.action_MainMenuFragment_to_ChatFragment)
        }

        binding.buttonprofil.setOnClickListener {
            findNavController().navigate(R.id.action_MainMenuFragment_to_profileActivity)
        }

       // binding.buttonfriends.setOnClickListener {
        //    findNavController().navigate(R.id.action_MainMenuFragment_to_friendsFragment)
       // }

        binding.modeTournoi.setOnClickListener {
            findNavController().navigate(R.id.action_MainMenuFragment_to_queueFragment)
        }

        binding.modeClassique.setOnClickListener {
            findNavController().navigate(R.id.action_MainMenuFragment_to_gameListFragment)
        }

        binding.buttonDisconnect.setOnClickListener {
            SocketHandler.closeConnection();
            LoggedInUser.disconnectUser();
            ChatModel.resetChat()
            SocketHandler.establishConnection();
            findNavController().navigate(R.id.action_MainMenuFragment_to_loginActivity2)
        }
    }

override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
