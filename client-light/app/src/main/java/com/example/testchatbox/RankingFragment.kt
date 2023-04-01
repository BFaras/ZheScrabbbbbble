package com.example.testchatbox

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.navigation.fragment.findNavController
import com.example.testchatbox.databinding.FragmentBracketBinding
import com.example.testchatbox.databinding.FragmentRankingBinding


class RankingFragment : Fragment() {

    private var _binding: FragmentRankingBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentRankingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.quitBtn.setOnClickListener {
            TournamentModel.exitTournament()
            findNavController().navigate(R.id.action_rankingFragment_to_MainMenuFragment)
        }
        binding.Rank1.text=TournamentModel.gamesData[3].players[TournamentModel.gamesData[3].winnerIndex]
        binding.Rank2.text=TournamentModel.gamesData[3].players[if(TournamentModel.gamesData[3].winnerIndex==1)0 else 1]
        binding.Rank3.text=TournamentModel.gamesData[4].players[TournamentModel.gamesData[4].winnerIndex]
        binding.Rank4.text=TournamentModel.gamesData[4].players[if(TournamentModel.gamesData[4].winnerIndex==1)0 else 1]
    }



}
