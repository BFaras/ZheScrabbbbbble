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
        val player = getRank()
        binding.Rank1.text=player[0]
        binding.Rank2.text=player[1]
        binding.Rank3.text=player[2]
        binding.Rank4.text=player[3]
    }

    fun getRank():Array<String>{
        val players = arrayOf<String>("","","","")
        for(game in TournamentModel.gamesData){
            if(game.type=="Final1"){
                players[0]= game.players[game.winnerIndex]
                players[1]=game.players[if(game.winnerIndex==1)0 else 1]
            }
            else if(game.type=="Final2"){
                players[2]= game.players[game.winnerIndex]
                players[3]=game.players[if(game.winnerIndex==1)0 else 1]
            }
        }
        return players
    }



}
