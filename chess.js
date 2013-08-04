Function.prototype.curry = function curry() {
  var fn = this, args = Array.prototype.slice.call(arguments);
  return function curryed() {
    return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
  };
};

// Piece:
PieceEnum = {
  KING  : 0,
  QUEEN : 1,
  ROOK  : 2,
  BISHOP: 3,
  KNIGHT: 4,
  PAWN  : 5
}

Board.emptyCellHTML  = '<span class="block" draggable="true"></span>';

Board.UpdateStateEnum = {
  ILLEGAL_MOVE      : 0,
  OK_MOVE           : 1,
  CASTLING_RIGHT    : 2,
  CASTLING_LEFT     : 3,
  PAWN_PROMOTION    : 4,
  GAME_OVER         : 5
}

// Player:
function Player(color) {
  this.color = color;
}

function Pos(x, y) {
  return {'x' : x, 'y' : y};
}

Player.prototype.getColor = function () {
  return this.color;
}

Player.ColorEnum = { BLACK : 0, WHITE : 1 }

// Board:
Board.prototype.isLegalMove = function(piece, playerColor, pos1, pos2) {
  switch (piece) {
    case PieceEnum.ROOK:
      return this.isLegalMoveROOK(playerColor, pos1, pos2);

    case PieceEnum.KING:
      return this.isLegalMoveKING(playerColor, pos1, pos2);

    case PieceEnum.QUEEN:
      return this.isLegalMoveQUEEN(playerColor, pos1, pos2);

    case PieceEnum.BISHOP:
      return this.isLegalMoveBISHOP(playerColor, pos1, pos2);

    case PieceEnum.KNIGHT:
      return this.isLegalMoveKNIGHT(playerColor, pos1, pos2);

    case PieceEnum.PAWN:
      return this.isLegalMovePAWN(playerColor, pos1, pos2);
  }
}

Board.prototype.isLegalMoveROOK = function(playerColor, pos1, pos2) {
  if (this.board[pos2.x][pos2.y] != null && this.board[pos2.x][pos2.y].color == playerColor)
    return false;
  if (pos1.x == pos2.x) { // Location is correct.
    var end = Math.max(pos1.y, pos2.y);
    var start = Math.min(pos1.y, pos2.y);

    // Verify there is no pieces in between.
    for (var j = start +1; j < end; j++) {
      if (this.board[pos1.x][j] != null)
        return false;
    }

    return true;

  } else if (pos1.y == pos2.y) { // Location is correct.
    var end = Math.max(pos1.x, pos2.x);
    var start = Math.min(pos1.x, pos2.x);

    // Verify there is no pieces in between.
    for ( var i = start +1; i < end; i++) {
      if (this.board[i][pos1.y] != null)
        return false;
    }
    return true;
  }
  return false;
}

Board.prototype.isLegalMoveKNIGHT = function(playerColor, pos1, pos2) {
  if (this.board[pos2.x][pos2.y] != null && this.board[pos2.x][pos2.y].color == playerColor)
    return false;

  // All possible moves:
  if (pos1.x +2 == pos2.x && (pos1.y +1 == pos2.y  || pos1.y -1 == pos2.y))
    return true;
  else if (pos1.x +1 == pos2.x && (pos1.y +2 == pos2.y || pos1.y -2 == pos2.y))
    return true;
  else if (pos1.x -2 == pos2.x && (pos1.y +1 == pos2.y || pos1.y -1 == pos2.y))
    return true;
  else if (pos1.x -1 == pos2.x && (pos1.y +2 == pos2.y || pos1.y -2 == pos2.y))
    return true;
  return false;
}

Board.prototype.isLegalMovePAWN = function(playerColor, pos1, pos2) {
  if (this.board[pos2.x][pos2.y] == null ) { // Simply move forward.
    if (playerColor == Player.ColorEnum.BLACK) { // Black moves UP the board.
      if ((pos1.x == pos2.x && pos1.y +1 == pos2.y) || // One step.
          (pos1.x == pos2.x && pos1.y +2 == pos2.y && this.board[pos1.x][pos1.y+1] == null && pos1.y == 1)) // Two steps.
        return true;
    } else { // White moves DOWN the board.
      if ((pos1.x == pos2.x && pos1.y -1 == pos2.y) || // One step.
          (pos1.x == pos2.x && pos1.y -2 == pos2.y && this.board[pos1.x][pos1.y-1] == null && pos1.y == 6)) // Two steps.
        return true;
    }

  } else { // Capture opponent's piece.
    if (this.board[pos2.x][pos2.y].color != playerColor) {
      if (playerColor == Player.ColorEnum.BLACK &&
          ((pos1.x +1 == pos2.x && pos1.y +1 == pos2.y) ||
           (pos1.x -1 == pos2.x && pos1.y +1 == pos2.y)))
        return true;
      else if (playerColor == Player.ColorEnum.WHITE &&
          ((pos1.x -1 == pos2.x && pos1.y -1 == pos2.y) ||
           (pos1.x +1 == pos2.x && pos1.y -1 == pos2.y)))
        return true;
    }
  }
  return false;
}

Board.prototype.isLegalMoveBISHOP = function(playerColor, pos1, pos2) {
  diffX = pos2.x - pos1.x;
  diffY = pos2.y - pos1.y;
  if (Math.abs(diffX) != Math.abs(diffY))
    return false;
  else if (this.board[pos2.x][pos2.y] != null &&
      this.board[pos2.x][pos2.y].color == playerColor)
    return false;
  else {
    var i = pos1.x;
    var j = pos1.y;

    while (i != pos2.x && j != pos2.y) {
      if (diffY > 0) j++;
      else j--;
      if (diffX > 0) i++;
      else i--;
      if (i == pos2.x || j == pos2.y)
        break;

      if (this.board[i][j] != null)
        return false;
    }
  }
  return true;
}

Board.prototype.isLegalMoveQUEEN = function(playerColor, pos1, pos2) {
  return (this.isLegalMoveBISHOP(playerColor, pos1, pos2) ||
      this.isLegalMoveROOK(playerColor, pos1, pos2));
}

Board.prototype.isLegalMoveKING = function(playerColor, pos1, pos2) {
  if (this.board[pos2.x][pos2.y] != null && this.board[pos2.x][pos2.y].color == playerColor)
    return false;
  else if ((pos1.x +1 == pos2.x && (pos1.y == pos2.y || pos1.y +1 == pos2.y || pos1.y -1 == pos2.y)) ||
      (pos1.x -1 == pos2.x && (pos1.y == pos2.y || pos1.y +1 == pos2.y || pos1.y -1 == pos2.y)) ||
      (pos1.x == pos2.x && (pos1.y +1 == pos2.y || pos1.y -1 == pos2.y)))
    return true;

  return false;
}

// Board:
function Board() {
  this.board = new Array(8);
  for (var i = 0; i < 8; i++) {
    this.board[i] = new Array(8);
    for (var j = 0; j < 8; j++) {
      this.board[i][j] = null;
    }
  }
}

Board.prototype.initForNewGame = function() {
  var initPieces = [ PieceEnum.ROOK, PieceEnum.KNIGHT, PieceEnum.BISHOP,
    PieceEnum.QUEEN, PieceEnum.KING, PieceEnum.BISHOP, PieceEnum.KNIGHT,
    PieceEnum.ROOK ];
  for (var i = 0; i < initPieces.length; i++) {
    this.placePiece(initPieces[i], Player.ColorEnum.BLACK, Pos(i, 0));
    this.placePiece(initPieces[i], Player.ColorEnum.WHITE, Pos(i, 7));

    this.placePiece(PieceEnum.PAWN, Player.ColorEnum.BLACK, Pos(i, 1));
    this.placePiece(PieceEnum.PAWN, Player.ColorEnum.WHITE, Pos(i, 6));
  }

  // Initialize King variables:
  var initKing = function(y) {
    return {
      'inCheck'       : false, // Updated every single move.
      'checkedFrom'   : null,  // TODO : update variables when check is undone.
      //Castling variables, keep track if castling is legal.
      'rightCastling' : true,
      'leftCastling'  : true,
      'pos'           : Pos(4, y)
    }
  }

  this.kings = new Array();
  this.kings[Player.ColorEnum.BLACK] = initKing(0);
  this.kings[Player.ColorEnum.WHITE] = initKing(7);
}

Board.prototype.placePiece = function(piece, color, pos) {
  this.board[pos.x][pos.y] = { 'piece' : piece, 'color' : color};
}

Board.prototype.checkBoardCorrectness = function() {
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var id = String.fromCharCode("A".charCodeAt(0) + i) + (j + 1);
      var cell = document.getElementById(id);
      if (this.board[i][j] == null) {
        if (cell.childNodes[0].innerText != "") {
          console.log("board: ", this.board[i][j]);
          console.log("cell: ", cell.childNodes[0].innerText);
          console.log("board: empty cell: %d, %d",  i , j);
        }
      } else {
        var unicode = this.toUnicode(this.board[i][j].piece, this.board[i][j].color);
        if (cell.childNodes[0].innerText.charCodeAt(0) != unicode) {
          console.log("board: non-empty cell: " + i + ", " + j);
          console.log(this.board[i][j]);
        }
      }
    }
  }
}

Board.prototype.toUnicode = function(piece, color) {
  var unicode = piece + 9812;
  if (color == Player.ColorEnum.BLACK) unicode += 6;
  return unicode;
}

Board.prototype.drawBoard = function() {
  for (var j = 0; j < 8; j++) {
    for (var i = 0; i < 8; i++) {
      var id = String.fromCharCode("A".charCodeAt(0) + i) + (j + 1);
      var cell = document.getElementById(id);

      if (this.board[i][j] != null) {
        var unicode = this.toUnicode(this.board[i][j].piece, this.board[i][j].color);
        cell.innerHTML = '<span class="block" draggable="true">&#' + unicode + ';</span>';
      } else {
        cell.innerHTML = Board.emptyCellHTML;
      }
    }
  }
  var blocks = document.querySelectorAll('.block');
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].addEventListener('dragstart', handleDragStart, false);
    blocks[i].addEventListener('dragenter', handleDragEnter, false);
    blocks[i].addEventListener('dragover', handleDragOver, false);
    blocks[i].addEventListener('dragleave', handleDragLeave, false);
    blocks[i].addEventListener('drop', handleDrop, false);
    blocks[i].addEventListener('dragend', handleDragEnd, false);
  }
  document.getElementById("turn").innerText = "White";
}

Board.prototype.isOkMove = function(piece, pos1, pos2, playerColor) {
  // Check correctness:
  // 0. check if correct player.
  if (this.board[pos1.x][pos1.y].color != playerColor) {
    return Board.UpdateStateEnum.ILLEGAL_MOVE;
  }

  // 1. piece at is currently at pos1.
  if (this.board[pos1.x][pos1.y] == null ||
      this.board[pos1.x][pos1.y].piece != piece) {
    return Board.UpdateStateEnum.ILLEGAL_MOVE;
  }

  // 2. pos2 is available.
  if (this.board[pos2.x][pos2.y] != null &&
      this.board[pos2.x][pos2.y].color == playerColor) {
    return Board.UpdateStateEnum.ILLEGAL_MOVE;
  }

  // If castling move:
  var castlingState = this.performCastling(piece, pos1, pos2, playerColor);
  if (castlingState != Board.UpdateStateEnum.ILLEGAL_MOVE)
    return castlingState;

  // According to chess rules.
  else if (!this.isLegalMove(piece, playerColor, pos1, pos2))
    return Board.UpdateStateEnum.ILLEGAL_MOVE;

  // 3. Move if currentPlayer does not yield into a check to currentPlayer's King.
  if (this.isCheck(playerColor, playerColor, pos1, pos2) == Board.UpdateStateEnum.ILLEGAL_MOVE)
    return Board.UpdateStateEnum.ILLEGAL_MOVE;

  // Is game over?
  if (this.checkMate(playerColor)) {
    if (playerColor == Player.ColorEnum.BLACK)
      prompt("Game is over. White has won the game.");
    else if (playerColor == Player.ColorEnum.WHITE)
      prompt("Game is over. Black has won the game.");
  }

  return Board.UpdateStateEnum.OK_MOVE;
}

// Update if a King was checked.
Board.prototype.isCheck = function(playerColor, kingColor, pos1, pos2) {
  var before = this.board[pos2.x][pos2.y];
  this.board[pos2.x][pos2.y] = this.board[pos1.x][pos1.y];
  this.board[pos1.x][pos1.y] = null;

  var pos = Pos(0, 0);

  // Iterate over all the board.
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      //console.log(i + ", " + j);

      if (this.board[i][j] != null) {
        pos.x = i;
        pos.y = j;
        if (this.isLegalMove(this.board[i][j].piece, this.board[i][j].color, pos,
        this.kings[kingColor].pos)) {

          // put back the pieces where they were.
          this.board[pos1.x][pos1.y] = this.board[pos2.x][pos2.y];
          this.board[pos2.x][pos2.y] = before;

          // player cannot cause it's own king to be checked. Error.
          if (playerColor == kingColor) {
            console.log("This move will cause your king to be ckeced.");
            return Board.UpdateStateEnum.ILLEGAL_MOVE;

          } else {
            this.kings[kingColor].inCheck = true;
            this.kings[kingColor].checkedFrom = pos;
            this.kings[kingColor].rightCastling = false;
            this.kings[kingColor].leftCastling = false ;
            console.log("Black King was checked.");
            return Board.UpdateStateEnum.OK_MOVE;
          }
        }
      }
    }
  }
  // put back the pieces where they were.
  this.board[pos1.x][pos1.y] = this.board[pos2.x][pos2.y];
  this.board[pos2.x][pos2.y] = before;
  return Board.UpdateStateEnum.OK_MOVE;
}

// Check if this player is getting checked / will lose the game.
Board.prototype.checkMate = function(playerColor) {

  // 1. King is checked.
  if (!this.kings[playerColor].inCheck)
    return false;

  // 2. Cannot move the king.
  var pos2 = Pos(0, 0);
  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {

      var pos1 = this.kings[playerColor].pos;
      pos2.x = pos1.x + i;
      pos2.y = pos1.y + j;
      if (this.isLegalMoveKING(playerColor, pos1, pos2) &&
          !this.isAttacked(playerColor, pos2))
      return false;
    }
  }

  // 3. Cannot block / remove the check.
  var attackingPos = this.kings[playerColor].checkedFrom;
  if (attackingPos == null)
    console.log("error. piece causing check is unknown.");

  // Can take the opponents checking piece?
  if (isAttacked(!playerColor, attackingPos))
    return false;

  // Can block opponents piece?
  switch (attackingPos) {
    case PieceEnum.KNIGHT: // Cannot.
    case PieceEnum.KING: //what? withdraw?
    case PieceEnum.PAWN: // If cannot be eaten, then game is over.
    case PieceEnum.QUEEN:
      return Board.canBlockAttackFromQueen(playerColor, attackingPos, pos);
    case PieceEnum.BISHOP:
      return Board.canBlockAttackFromBishop(playerColor, attackingPos, pos);
    case PieceEnum.ROOK:
      return Board.canBlockAttackFromRook(playerColor, attackingPos, pos);
  }
  return true;
}

// TODO: A part of this function is very similar to isLegalMoveROOK function. Think about a way to refactor
// both functions so that you can share code.
Board.prototype.canBlockAttackFromRook = function(playerColor, attackingPos,
attackedPos) {
  var piecePositions = Board.getAllPieces(playerColor);

  if (attakingPos.x == attackedPos.x) { // Vertical.
    var start = Math.min(attackingPos.y, attackedPos.y);
    var end = Math.max(attackingPos.y, attackedPos.y);

    for (var k = 0; k < piecePositions.length; k++) {
      var pos1 = piecePositions[k];

      // for all positions in between:
      for (var j = start + 1; j < end; j++) {
        var pos2 = Pos(attackingPos.x, j);

        if (this.isLegalMove(this.board[pos1.x][pos1.y].piece, playerColor, pos1,
        pos2))
          return true;
      }
    }

  } else if (attackingPos.y == attackedPos.y) { // Horizontal.
    var start = Math.min(attackingPos.x, attackedPos.x);
    var end = Math.max(attackingPos.x, attackedPos.x);

    for (var k = 0; k < piecePositions.length; k++) {
      var pos1 = piecePositions[k];

      // for all positions in between:
      for (var i = start + 1; i < end; i++) {
        var pos2 = Pos(i, attackingPos.y);

        if (this.isLegalMove(this.board[pos1.x][pos1.y].piece, playerColor, pos1,
        pos2))
          return true;
      }
    }
  } else {
    console.log("Something is wrong. Wrong function canBlockAttackFromRook called.");
  }
}

Board.prototype.canBlockAttackFromBishop = function(playerColor, attackingPos,
attackedPos) {

}

Board.prototype.canBlockAttackFromQueen = function(playerColor, attackingPos,
attackedPos) {}


Board.prototype.updateBoard = function(piece, pos1, pos2, playerColor) {

  var state = this.isOkMove(piece, pos1, pos2, playerColor);
  if (state == Board.UpdateStateEnum.ILLEGAL_MOVE)
    return state;

  this.updateMoveOnBoard(piece, playerColor, pos1, pos2);


  return Board.UpdateStateEnum.OK_MOVE;
}

Board.prototype.updateMoveOnBoard = function(piece, playerColor, pos1, pos2) {
  this.board[pos2.x][pos2.y] = this.board[pos1.x][pos1.y];
  this.board[pos1.x][pos1.y] = null;

  // Update castling variables.
  if (piece == PieceEnum.ROOK) {
    if (pos1.x == 7)
      this.kings[playerColor].rightCastling = false;
    else if (pos1.x == 0)
      this.kings[playerColor].leftCastling = false;
  }

  if (piece == PieceEnum.KING) {
      this.kings[playerColor].rightCastling = false;
      this.kings[playerColor].leftCastling = false;
      this.kings[playerColor].pos = pos2;
  }

  // If Pawn reached end, promote it.
  if (piece == PieceEnum.PAWN) {
    if (playerColor == Player.ColorEnum.BLACK && pos2.y == 7) {
      this.board[pos2.x][pos2.y].piece = PieceEnum.QUEEN;
      return Board.UpdateStateEnum.PAWN_PROMOTION;
    }
    else if (playerColor == Player.ColorEnum.WHITE && pos2.y == 0) {
      this.board[pos2.x][pos2.y].piece = PieceEnum.QUEEN;
      return Board.UpdateStateEnum.PAWN_PROMOTION;
    }
  }
}

Board.prototype.performCastling = function(piece, pos1, pos2, playerColor) {
  if (piece != PieceEnum.KING)
    return Board.UpdateStateEnum.ILLEGAL_MOVE;

  var y = 0;
  if (playerColor == Player.ColorEnum.WHITE)
    y = 7;

  if (pos1.x != 4 && pos1.y != y)
    return Board.UpdateStateEnum.ILLEGAL_MOVE;

  if (this.kings[playerColor].rightCastling && pos2.x == 6 && pos2.y == y &&
  this.board[6][y] == null && this.board[5][y] == null) {

    // Move Rook.
    this.board[5][y] = this.board[7][y];
    this.board[7][y] = null;
    // Move King.
    this.board[6][y] = this.board[pos1.x][pos1.y];
    this.board[pos1.x][pos1.y] = null;

    var status = Board.UpdateStateEnum.CASTLING_RIGHT;

  } else if (this.kings[playerColor].leftCastling && pos2.x == 2 &&
    pos2.y == y && this.board[1][y] == null && this.board[2][y] == null &&
  this.board[3][y] == null) {

    // Move Rook.
    this.board[3][y] = this.board[0][y];
    this.board[0][y] = null;
    // Move King.
    this.board[pos2.x][pos2.y] = this.board[pos1.x][pos1.y];
    this.board[pos1.x][pos1.y] = null;

    var status = Board.UpdateStateEnum.CASTLING_LEFT;
  }

  // Update variables.
  this.kings[playerColor].rightCastling = false;
  this.kings[playerColor].leftCastling = false;
  this.kings[playerColor].pos = pos2;
  return status;
}

Board.prototype.isOpponentsPiece = function(playerColor, piece, x, y) {
  return (this.board[x][y].color != playerColor &&
      (this.board[x][y].piece == piece || this.board[x][y].piece == PieceEnum.QUEEN))
}

Board.prototype.isAttackedByKnight = function(playerColor, pos) {
  // Is attacked by a Knight?
  if ((this.board[pos.x+1][pos.y+2] != null &&
       this.board[pos.x+1][pos.y+2].piece == PieceEnum.KNIGHT &&
       this.board[pos.x+1][pos.y+2].color != playerColor) ||

      (this.board[pos.x+2][pos.y+1] != null &&
       this.board[pos.x+2][pos.y+1].piece == PieceEnum.KNIGHT &&
       this.board[pos.x+2][pos.y+1].color != playerColor) ||

      (this.board[pos.x+1][pos.y-2] != null &&
       this.board[pos.x+1][pos.y-2].piece == PieceEnum.KNIGHT &&
       this.board[pos.x+1][pos.y-2].color != playerColor) ||

      (this.board[pos.x+2][pos.y-1] != null &&
       this.board[pos.x+2][pos.y-1].piece == PieceEnum.KNIGHT &&
       this.board[pos.x+2][pos.y-1].color != playerColor) ||

      (this.board[pos.x-1][pos.y+2] != null &&
       this.board[pos.x-1][pos.y+2].piece == PieceEnum.KNIGHT &&
       this.board[pos.x-1][pos.y+2].color != playerColor) ||

      (this.board[pos.x-2][pos.y+1] != null &&
       this.board[pos.x-2][pos.y+1].piece == PieceEnum.KNIGHT &&
       this.board[pos.x-2][pos.y+1].color != playerColor) ||

      (this.board[pos.x-2][pos.y-1] != null &&
       this.board[pos.x-2][pos.y-1].piece == PieceEnum.KNIGHT &&
       this.board[pos.x-2][pos.y-1].color != playerColor) ||

      (this.board[pos.x-1][pos.y-2] != null &&
       this.board[pos.x-1][pos.y-2].piece == PieceEnum.KNIGHT &&
       this.board[pos.x-1][pos.y-2].color != playerColor))

    return true;
  return false;
}

Board.prototype.isAttackedByRookOrQueen = function(playerColor, pos) {
  // Is attaked by a Rook or a Queen?
  // Horizontally:
  for (var i = pos.x + 1; i < 8; i++) {
    if (this.board[i][pos.y] != null)
      if (this.isOpponentsPiece(playerColor, PieceEnum.ROOK, i, pos.y))
        return true;
      else break;
  }
  for (var i = pos.x -1; i >= 0 ; i--) {
    if (this.board[i][pos.y] != null)
      if (this.isOpponentsPiece(playerColor, PieceEnum.ROOK, i, pos.y))
        return true;
      else break;
  }

  // Vertically:
  for (var j = pos.y +1; j < 8; j++) {
    if (this.board[pos.x][j] != null)
      if (this.isOpponentsPiece(playerColor, PieceEnum.ROOK, pos.x, j))
        return true;
      else break;
  }
  for (var j = pos.y -1; j >= 0; j--) {
    if (this.board[pos.x][j] != null)
      if (this.isOpponentsPiece(playerColor, PieceEnum.ROOK, pos.x, j))
        return true;
      else break;
  }
}

Board.prototype.isAttackedByBishopOrQueen = function(playerColor, pos) {
outer_loop:
  for (var i = pos.x +1; i < 8; i++) {
    for (var j = pos.y +1; j < 8; j++) {
      if (this.board[i][j] != null)
        if (this.isOpponentsPiece(playerColor, PieceEnum.BISHOP, i, j))
          return true;
        else break outer_loop;
    }
  }

outer_loop:
  for (var i = pos.x -1; i >= 0; i--) {
    for (var j = pos.y -1; j >= 0; j--) {
      if (this.board[i][j] != null)
        if (this.isOpponentsPiece(playerColor, PieceEnum.BISHOP, i, j))
          return true;
        else break outer_loop;
    }
  }

outer_loop:
  for (var i = pos.x +1; i < 8; i++) {
    for (var j = pos.y -1; j >= 0; j--) {
      if (this.board[i][j] != null)
        if (this.isOpponentsPiece(playerColor, PieceEnum.BISHOP, i, j))
          return true;
        else break outer_loop;
    }
  }

outer_loop:
  for (var i = pos.x -1; i >= 0; i--) {
    for (var j = pos.y +1; j < 8; j++) {
      if (this.board[i][j] != null)
        if (this.isOpponentsPiece(playerColor, PieceEnum.BISHOP, i, j))
          return true;
        else break outer_loop;
    }
  }
}

Board.prototype.isAttackedByPawn = function(playerColor, pos) {
  if (playerColor == Player.ColorEnum.BLACK) {
    if ((this.board[pos.x +1][pos.y +1] != null && this.board[pos.x +1][pos.y +1].color != playerColor &&
         this.board[pos.x +1][pos.y +1].piece == PieceEnum.PAWN) ||
        (this.board[pos.x -1][pos.y +1] != null && this.board[pos.x -1][pos.y +1].color != playerColor &&
         this.board[pos.x -1][pos.y +1].piece == PieceEnum.PAWN))
      return true;
  } else {
    if ((this.board[pos.x +1][pos.y -1] != null && this.board[pos.x +1][pos.y -1].color != playerColor &&
         this.board[pos.x +1][pos.y -1].piece == PieceEnum.PAWN) ||
        (this.board[pos.x -1][pos.y -1] != null && this.board[pos.x -1][pos.y -1].color != playerColor &&
         this.board[pos.x -1][pos.y -1].piece == PieceEnum.PAWN))
      return true;
  }
  return false;
}

Board.prototype.isAttackedByKing = function(playerColor, pos) {
  if (this.isLegalMoveKING(!playerColor, this.kings[!playerColor].pos, pos) &&
      !isAttacked(!playerColor, pos))
    return true;
  return false;
}

Board.prototype.isAttacked = function(playerColor, pos) {
  if (this.isAttackedByKnight(playerColor, pos) ||
      this.isAttackedByRookOrQueen(playerColor, pos) ||
      this.isAttackedByBishopOrQueen(playerColor, pos) ||
      this.isAttackedByPawn(playerColor, pos) ||
      this.isAttackedByKing(playerColor, pos))
    return true;
  return false;
}

// The following handlers are from : http://www.html5rocks.com/en/tutorials/dnd/basics/
function handleDragStart(e) {
  if (getPieceInfo(this.parentNode.id).pieceColor == game.currentPlayer.getColor()) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData("text/plain", this.parentNode.id);
  } else {
    console.log("Error!");
  }
  game.board.checkBoardCorrectness();
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }
  e.dataTransfer.dropEffect = 'move';
  console.log("dragOver visited");
  return false;
}

function handleDragEnter(e) {
  this.classList.add('over'); // this / e.target is the current hover target.
}

function handleDragLeave(e) {
  this.classList.remove('over'); // this / e.target is previous target element.
}

function handleDrop(e) {
  if (e.stopPropagation) { // this / e.target is current target element.
    e.stopPropagation(); // stops the browser from redirecting.
  }
  var srcId = e.dataTransfer.getData("text/plain");

  if (srcId != null && srcId != "") {
    var srcEl = document.getElementById(srcId);
    if (srcEl != this.parentNode) {
      var pos1 = getPosInfo(srcId);
      var pieceInfo = getPieceInfo(srcId);
      var pos2 = getPosInfo(this.parentNode.id);
      var isLegal = game.getBoard().updateBoard(pieceInfo.piece, pos1, pos2,
          pieceInfo.pieceColor);

      if (isLegal != Board.UpdateStateEnum.ILLEGAL_MOVE) {
        game.updateTurn();

        if (this.innerText != "") { // Keep track of captured pieces.
          document.getElementById("captured").innerHTML =
            document.getElementById("captured").innerHTML.concat(" ").concat(this.innerText);
        }
        this.innerText = srcEl.childNodes[0].innerText; // move piece to new location.
        srcEl.childNodes[0].innerText = ""; // empty old location.
        //or srcEl.innerHTML = Board.emptyCellHTML;

        if (isLegal == Board.UpdateStateEnum.PAWN_PROMOTION)
          this.innerText = "♕";
        if (isLegal == Board.UpdateStateEnum.CASTLING_RIGHT &&
        playerColor == Player.ColorEnum.BLACK) {
          document.getElementById("F1").childNodes[0].innerText =
          document.getElementById("H1").childNodes[0].innerText;
          document.getElementById("H1").childNodes[0].innerText = "";
        }

        else if (isLegal == Board.UpdateStateEnum.CASTLING_RIGHT &&
        playerColor == Player.ColorEnum.WHITE) {
          document.getElementById("F8").childNodes[0].innerText =
          document.getElementById("H8").childNodes[0].innerText;
          document.getElementById("H8").childNodes[0].innerText = "";
        }

        else if (isLegal == Board.UpdateStateEnum.CASTLING_LEFT &&
        playerColor == Player.ColorEnum.BLACK) {
          document.getElementById("D1").childNodes[0].innerText =
          document.getElementById("A1").childNodes[0].innerText;
          document.getElementById("A1").childNodes[0].innerText = "";
        }

        else if (isLegal == Board.UpdateStateEnum.CASTLING_LEFT &&
        playerColor == Player.ColorEnum.WHITE) {
          document.getElementById("D8").childNodes[0].innerText =
          document.getElementById("A8").childNodes[0].innerText;
          document.getElementById("A8").childNodes[0].innerText = "";
        }

      } else {
        console.log("Please try again.");
      }
    }
  }
  return false;
}

function pawnPromotion() {
  // ------------------------------------ TODO -------------------------------------
/*  <div id="dialog" title="Basic dialog">
    <p>blah.</p>
    <ol id="selectable">
    <li class="ui-widget-content">Item 1</li>
    <li class="ui-widget-content">Item 2</li>
    <li class="ui-widget-content">Item 3</li>
    <li class="ui-widget-content">Item 4</li>
    <li class="ui-widget-content">Item 5</li>
    <li class="ui-widget-content">Item 6</li>
    <li class="ui-widget-content">Item 7</li>
    </ol>
    </div>
*/
}

function getPosInfo(id) {
  return Pos(id.charCodeAt(0) - "A".charCodeAt(0), parseInt(id.charAt(1)) - 1);
}

function getPieceInfo(id){
  var pieceNum = document.getElementById(id).innerText.charCodeAt(0);
  if (pieceNum >= 9812 && pieceNum <= 9817) {
    var pieceColor = Player.ColorEnum.WHITE;
  } else if (pieceNum >= 9818 && pieceNum <= 9823) {
    var pieceColor = Player.ColorEnum.BLACK;
  } else {
    console.log("chess piece error." + pieceNum);
  }
  var piece = pieceNum - 9812;
  if (pieceColor == Player.ColorEnum.BLACK) {
    piece -= 6;
  }

  return { 'piece' : piece, 'pieceColor': pieceColor }
}


function handleDragEnd(e) {
  // this/e.target is the source node.
  var blocks = document.querySelectorAll('.block');
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].classList.remove('over');
  }
}

// Game:
function Game() {

  this.player1 = new Player(Player.ColorEnum.WHITE);
  this.player2 = new Player(Player.ColorEnum.BLACK);
  this.currentPlayer = this.player1;
  this.board = new Board();
  this.board.initForNewGame();
  this.board.drawBoard();

}

Game.prototype.getBoard = function() {
  return this.board;
}

Game.prototype.updateTurn = function () {
  if (this.currentPlayer == this.player1) {
    this.currentPlayer = this.player2;
    document.getElementById("turn").innerText = "Black";
  } else {
    this.currentPlayer = this.player1;
    document.getElementById("turn").innerText = "White";
  }
}

window.onload = function(){
  game = new Game();
};


