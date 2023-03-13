package com.example.testchatbox

import android.content.ClipData
import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.util.TypedValue
import android.view.DragEvent
import android.view.View
import android.view.ViewGroup
import android.widget.RelativeLayout
import com.example.testchatbox.Coordinates.COLUMNS
import com.example.testchatbox.Coordinates.ROWS


class GameBoardView : RelativeLayout {
    var gridPaint = Paint()
    var textPaint = Paint()
    var letterPaint = Paint()
    var letterTextPaint = Paint()

    var isInside: Boolean = false
    var drawLetterList = ArrayList<GamePageFragment.LetterInHand>()

    private val boardState = Array(15) { IntArray(15) }

    private fun isStartSquare(column: Float?, row: Float?): Boolean {
        return column == COLUMNS[8] && row == ROWS["H"]
    }

    init {
        layoutParams =
            LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
    }

    private fun drawSquare(canvas: Canvas, column: Float?, row: Float?, colour: Int, word: String) {

        val bounds = Rect()

        gridPaint.color = colour
        textPaint.color = Color.BLACK
        textPaint.textSize = 20F
        textPaint.textAlign = Paint.Align.CENTER
        textPaint.typeface = Typeface.DEFAULT_BOLD

        if (row != null && column != null) {
            canvas.drawRect(
                column,
                row,
                column + GridConstants.DEFAULT_SIDE,
                row + GridConstants.DEFAULT_SIDE,
                gridPaint
            )
            if (this.isStartSquare(column, row)) {
                val startSymbol = "★"

                textPaint.textSize = 35F
                textPaint.color = Color.WHITE
                textPaint.getTextBounds(startSymbol, 0, startSymbol.length, bounds)

                val calculateBounds = (bounds.bottom - bounds.top) / 2

                canvas.drawText(
                    startSymbol,
                    column + GridConstants.DEFAULT_SIDE / 2F,
                    row + GridConstants.DEFAULT_SIDE / 2F + calculateBounds - 5f,
                    textPaint
                )
            } else {
                textPaint.alpha = 70
                textPaint.getTextBounds(word, 0, word.length, bounds)

                val calculateBounds = (bounds.bottom - bounds.top) / 2
                canvas.drawText(
                    word, column + GridConstants.DEFAULT_SIDE / 2F,
                    row + GridConstants.DEFAULT_SIDE / 2F + calculateBounds, textPaint
                )
            }
        }

    }

    private fun drawSquares(canvas: Canvas) {
//        Code suivant à utiliser pour les thèmes
        val typedValue = TypedValue()
        context.theme.resolveAttribute(com.google.android.material.R.attr.colorOnPrimary, typedValue, true)
        gridPaint.color = typedValue.data


        val redTile = TypedValue()
        context.theme.resolveAttribute(com.google.android.material.R.attr.colorPrimaryVariant, redTile, true)

        val pinkTile = TypedValue()
        context.theme.resolveAttribute(R.attr.pinkTile, pinkTile, true)

        val blueTile = TypedValue()
        context.theme.resolveAttribute(R.attr.blueTile, blueTile, true)

        val lightBlueTile = TypedValue()
        context.theme.resolveAttribute(R.attr.lightBlueTile, lightBlueTile, true)

        //gridPaint.color = ContextCompat.getColor(context, R.color.AntiqueWhite)
        gridPaint.style = Paint.Style.FILL
        canvas.drawRect(
            0F,
            0F,
            GridConstants.DEFAULT_WIDTH,
            GridConstants.DEFAULT_HEIGHT,
            gridPaint
        )

        for (square in ColorsCoordinates.lightBlueCoordinates) {
            this.drawSquare(
                canvas,
                square.second,
                square.first,
                lightBlueTile.data, //à changer pour le thème
                context.getString(R.string.doubleLetter)
            )
        }
        for (square in ColorsCoordinates.redCoordinates) {
            this.drawSquare(
                canvas,
                square.second,
                square.first,
                redTile.data,
                context.getString(R.string.tripleWord)
            )
        }
        for (square in ColorsCoordinates.pinkCoordinates) {
            this.drawSquare(
                canvas,
                square.second,
                square.first,
                pinkTile.data,
                context.getString(R.string.doubleWord)
            )
        }
        for (square in ColorsCoordinates.blueCoordinates) {
            this.drawSquare(
                canvas,
                square.second,
                square.first,
                blueTile.data,
                context.getString(R.string.tripleLetter)
            )
        }
    }


    private fun drawGridLines(canvas: Canvas) {
        //Coordinates.setCoordinates()
        drawSquares(canvas)

        gridPaint.color = Color.BLACK
        gridPaint.strokeWidth = GridConstants.DEFAULT_LINE_WIDTH
        gridPaint.style = Paint.Style.FILL
        gridPaint.isAntiAlias = true

        var x = 0F
        while (x <= GridConstants.DEFAULT_WIDTH + GridConstants.DEFAULT_SIDE) {
            canvas.drawLine(
                x,
                0F,
                x,
                GridConstants.DEFAULT_HEIGHT,
                gridPaint
            ) //vertical
            canvas.drawLine(
                0F,
                x,
                GridConstants.DEFAULT_WIDTH,
                x,
                gridPaint
            ) //horizontal
            x += GridConstants.DEFAULT_SIDE
        }
    }

    private fun validLetter(letter: String): String {
        return if (letter >= "A" && letter <= "Z") letter
        //else if (letter.substring(0, letter.length - 1) === "blank") letter.uppercase()
        else if (letter.substring(0, letter.length) === "") "BLANK"
        else if (letter >= "a" && letter <= "z") letter.uppercase()
        else ""
    }

    private fun validRowColumn(column: Int, row: String): String {
        val validColumn = 1 <= column && GridConstants.ROW_COLUMN_COUNT >= column
        return if (validColumn && row >= "A" && row <= "O") row
        else if (validColumn && row >= "a" && row <= "o") row.uppercase()
        else ""
    }

//    private fun checkParamsValidity(column: Int, row: String, letter: String): Boolean {
//        return Boolean(this.validLetter(letter)) && Boolean(this.validRowColumn(column, row));
//    }

//    private fun manageBlank(letter: String): Pair<String, String> {
//        if (this.validLetter(letter).length > 1)
//            return Pair(
//                letter.substring(0, letter.length - 1),
//                letter.substring(letter.length - 1, letter.length)
//            )
//        //return { points: letter.substring(0, letter.length - 1), letter: letter.substring(letter.length - 1, letter.length) };
//        return Pair(letter, letter) //points,letter
//    }

    //TODO: drawLetter après réception du dropEvent
    private fun drawLetter(canvas: Canvas, column: Int, row: String, letter: String) {
//        if (this.checkParamsValidity(column, row, letter)) {
        var fullLetter = this.validLetter(letter)
        //val blankHandledLetter = this.manageBlank(fullLetter)
        val checkedRow: String = this.validRowColumn(column, row)
        val letterPoint: Int? = LetterPoints.letterPoints[fullLetter]
        if (fullLetter == "BLANK") {
            fullLetter = ""
        }

        //var letterPoint: number = LETTER_POINTS[blankHandledLetter.points as keyof typeof LETTER_POINTS];

        letterPaint.color = Color.WHITE
        letterPaint.style = Paint.Style.FILL
        letterPaint.setShadowLayer(2F, 0F, 0F, Color.BLACK)

        val col = COLUMNS[column]!!
        val row = ROWS[checkedRow]!!

        canvas.drawRect(
            col,
            row,
            col + GridConstants.DEFAULT_SIDE,
            row + GridConstants.DEFAULT_SIDE,
            letterPaint
        ) //draw letter tile

        letterPaint.color = Color.BLACK
        letterPaint.style = Paint.Style.STROKE
        canvas.drawRect(
            col,
            row,
            col + GridConstants.DEFAULT_SIDE,
            row + GridConstants.DEFAULT_SIDE,
            letterPaint
        )


        letterTextPaint.color = Color.BLACK
        letterTextPaint.textSize = 25F
        letterTextPaint.isAntiAlias = true
        letterTextPaint.textAlign = Paint.Align.CENTER
        letterTextPaint.typeface = Typeface.DEFAULT_BOLD

        val bounds = Rect()
        letterTextPaint.getTextBounds(fullLetter, 0, fullLetter.length, bounds)
        val calculateBounds = (bounds.bottom - bounds.top) / 2

        canvas.drawText(
            fullLetter,
            col + GridConstants.DEFAULT_SIDE / 2,
            row + GridConstants.DEFAULT_SIDE / 2 + calculateBounds,
            letterTextPaint
        ) //draw letter

        letterTextPaint.textSize = 12F
        letterTextPaint.textAlign = Paint.Align.LEFT
        letterTextPaint.typeface = Typeface.DEFAULT

        if (letterPoint == 10) {
            canvas.drawText(
                letterPoint.toString(),
                col + GridConstants.DEFAULT_SIDE / 1.7F,
                row + GridConstants.DEFAULT_SIDE / 1.15F,
                letterTextPaint
            )
        } else {
            canvas.drawText(
                letterPoint.toString(),
                col + GridConstants.DEFAULT_SIDE / 1.4F,
                row + GridConstants.DEFAULT_SIDE / 1.2F,
                letterTextPaint
            )
        } //draw points

    }

    constructor(context: Context) : super(context) {
        this.setWillNotDraw(false)
    }

    constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
        this.setWillNotDraw(false)
    }

//    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
//        val width = MeasureSpec.getSize(widthMeasureSpec)
//        val height = MeasureSpec.getSize(heightMeasureSpec)
//        val size = width.coerceAtMost(height)
//        val measureSpec = MeasureSpec.makeMeasureSpec(size, MeasureSpec.EXACTLY)
//        super.onMeasure(measureSpec, measureSpec)
//    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        Coordinates.setCoordinates()
        drawGridLines(canvas)

//        if (isInside) {
//            for(letter in drawLetterList) {
//                drawLetter(canvas, letter.col, letter.row, letter.letter)
//            }
//        }
    }


    //TODO: Drop and Drag event
    fun onDrop(v: View?, event: DragEvent) {
        when (event.action) {
            DragEvent.ACTION_DROP -> {
                // Gets the item containing the dragged data.
                val item: ClipData.Item = event.clipData.getItemAt(0)
                // Gets the text data from the item.
                val dragData = item.text

                val x = event.x
                val y = event.y
            }
        }
    }

}
