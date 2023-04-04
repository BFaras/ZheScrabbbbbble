package com.example.testchatbox

import SocketHandler
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.core.text.HtmlCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.chat.ChatModel
import com.example.testchatbox.databinding.FragmentMainMenuBinding
import com.example.testchatbox.databinding.FragmentQueueBinding
import com.example.testchatbox.login.model.LoggedInUser


class QueueFragment : Fragment(), Observer {

    private var _binding: FragmentQueueBinding? = null
    private val binding get() = _binding!!


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentQueueBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        WindowInsetsControllerCompat(requireActivity().window, requireActivity().window.decorView).apply {
            // Hide both the status bar and the navigation bar
            hide(WindowInsetsCompat.Type.systemBars())
            hide(WindowInsetsCompat.Type.statusBars())
            // Behavior of system bars
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
        binding.buttonchat.setOnClickListener {
            findNavController().navigate(R.id.action_queueFragment_to_ChatFragment)
        }
        binding.buttonfriends.setOnClickListener {
            findNavController().navigate(R.id.action_queueFragment_to_friendsFragment)
        }
        TournamentModel.queueForTournament()
        binding.annulerBtn.setOnClickListener{
            TournamentModel.exitTournament()
            findNavController().navigate(R.id.action_queueFragment_to_MainMenuFragment)
        }

    }

    override fun update() {
        activity?.runOnUiThread(Runnable {
            findNavController().navigate(R.id.action_queueFragment_to_bracketFragment)
        });
    }

    override fun onStart() {
        super.onStart()
        TournamentModel.addObserver(this);
    }

    override fun onStop() {
        super.onStop()
        TournamentModel.removeObserver(this);
    }

}
