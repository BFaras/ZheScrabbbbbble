package com.example.testchatbox

import com.example.testchatbox.Coordinates.COLUMNS
import com.example.testchatbox.Coordinates.ROWS

object GridConstants {
    const val DEFAULT_WIDTH = 675F
    const val DEFAULT_HEIGHT = 675F
    const val DEFAULT_SIDE = DEFAULT_HEIGHT/15
    const val DEFAULT_LINE_WIDTH = 1F
    const val ROW_COLUMN_COUNT = 15
    const val LAST_LETTER = -1

}

object LetterPoints {
    var letterPoints = mapOf(
        "A" to 1,
        "B" to 3,
        "C" to 3,
        "D" to 2,
        "E" to 1,
        "F" to 4,
        "G" to 2,
        "H" to 4,
        "I" to 1,
        "J" to 8,
        "K" to 10,
        "L" to 1,
        "M" to 2,
        "N" to 1,
        "O" to 1,
        "P" to 3,
        "Q" to 8,
        "R" to 1,
        "S" to 1,
        "T" to 1,
        "U" to 1,
        "V" to 4,
        "W" to 10,
        "X" to 10,
        "Y" to 10,
        "Z" to 10,
        "BLANK" to 0
    )
}


object Coordinates {
    var ROWS = sortedMapOf<String, Float>()
    var COLUMNS = sortedMapOf<Int, Float>()

    var rowsPos =  mutableListOf<Pair<Float, Float>>()
    var columnsPos =  mutableListOf<Pair<Float, Float>>()

    fun setCoordinates() {
        var squareSizeIncrement = 0F
        for (letter in 'A'.code..'O'.code) {
            val charLetter = letter.toChar()
            ROWS[charLetter.toString()] = squareSizeIncrement
            squareSizeIncrement += GridConstants.DEFAULT_SIDE
        }
        squareSizeIncrement = 0F
        for (num in 1..GridConstants.ROW_COLUMN_COUNT) {
            COLUMNS[num] = squareSizeIncrement
            squareSizeIncrement += GridConstants.DEFAULT_SIDE
        }
        rowsPos = ROWS.values.zipWithNext() as MutableList
        val lastRow = rowsPos.last().second

        columnsPos = COLUMNS.values.zipWithNext() as MutableList
        val lastElementCol = columnsPos.last().second

        rowsPos.add(Pair(lastRow,lastRow + GridConstants.DEFAULT_SIDE))
        columnsPos.add(Pair(lastElementCol,lastElementCol + GridConstants.DEFAULT_SIDE))
    }




    fun isCoordinateOf(colourCoords:  List<Pair<Float?, Float?>>, coord: Pair<Float, Float>): Boolean {
        for (square in colourCoords) {
           return square == coord
        }
        return false
    }
}


object ColorsCoordinates {
    val lightBlueCoordinates = listOf(
        ROWS["A"] to COLUMNS[4],
        ROWS["A"] to COLUMNS[12],
        ROWS["C"] to COLUMNS[7],
        ROWS["C"] to COLUMNS[9],
        ROWS["D"] to COLUMNS[1],
        ROWS["D"] to COLUMNS[8],
        ROWS["D"] to COLUMNS[15],
        ROWS["G"] to COLUMNS[3],
        ROWS["G"] to COLUMNS[7],
        ROWS["G"] to COLUMNS[9],
        ROWS["G"] to COLUMNS[13],
        ROWS["H"] to COLUMNS[4],
        ROWS["H"] to COLUMNS[12],
        ROWS["I"] to COLUMNS[3],
        ROWS["I"] to COLUMNS[7],
        ROWS["I"] to COLUMNS[9],
        ROWS["I"] to COLUMNS[13],
        ROWS["L"] to COLUMNS[1],
        ROWS["L"] to COLUMNS[8],
        ROWS["L"] to COLUMNS[15],
        ROWS["M"] to COLUMNS[7],
        ROWS["M"] to COLUMNS[9],
        ROWS["O"] to COLUMNS[4],
        ROWS["O"] to COLUMNS[12]
    )

    val blueCoordinates = listOf(
    ROWS["B"] to COLUMNS[6],
    ROWS["B"] to COLUMNS[10],
    ROWS["F"] to COLUMNS[2],
    ROWS["F"] to COLUMNS[6],
    ROWS["F"] to COLUMNS[10],
    ROWS["F"] to COLUMNS[14],
    ROWS["J"] to COLUMNS[2],
    ROWS["J"] to COLUMNS[6],
    ROWS["J"] to COLUMNS[10],
    ROWS["J"] to COLUMNS[14],
    ROWS["N"] to COLUMNS[6],
    ROWS["N"] to COLUMNS[10]
    )

    val pinkCoordinates = listOf(
        ROWS["B"] to COLUMNS[2],
        ROWS["B"] to COLUMNS[14],
        ROWS["C"] to COLUMNS[3],
        ROWS["C"] to COLUMNS[13],
        ROWS["D"] to COLUMNS[4],
        ROWS["D"] to COLUMNS[12],
        ROWS["E"] to COLUMNS[5],
        ROWS["E"] to COLUMNS[11],
        ROWS["H"] to COLUMNS[8],
        ROWS["K"] to COLUMNS[5],
        ROWS["K"] to COLUMNS[11],
        ROWS["L"] to COLUMNS[4],
        ROWS["L"] to COLUMNS[12],
        ROWS["M"] to COLUMNS[3],
        ROWS["M"] to COLUMNS[13],
        ROWS["N"] to COLUMNS[2],
        ROWS["N"] to COLUMNS[14]

    )
    val redCoordinates = listOf(
        ROWS["A"] to COLUMNS[1],
        ROWS["A"] to COLUMNS[8],
        ROWS["A"] to COLUMNS[15],
        ROWS["H"] to COLUMNS[1],
        ROWS["H"] to COLUMNS[15],
        ROWS["O"] to COLUMNS[1],
        ROWS["O"] to COLUMNS[8],
        ROWS["O"] to COLUMNS[15]
    )
}
