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

// Both are updated every single move.
blackInCheck = false; 
whiteInCheck = false;
blackCheckedBy = new Array();
whiteCheckedBy = new Array();
// ----------------------------- TODO : update variables when check is undone. 

// Castling variables, keep track if castling is legal.
blackRightCastling = true;
blackLeftCastling = true;
whiteRightCastling = true;
whiteLeftCastling = true;

// Keep track of Kings.
whiteKingPos = {'x' : 4, 'y' : 7};
blackKingPos = {'x' : 4, 'y' : 0}; 

Board.emptyCellHTML  = '<span class="block" draggable="true"></span>';

Board.UpdateStateEnum = {
  ILLEGAL_MOVE      : 0,
  OK_MOVE           : 1,
  CASTLING_BLACK_L  : 2,
  CASTLING_BLACK_R  : 3,
  CASTLING_WHITE_R  : 4,
  CASTLING_WHITE_L  : 5,
  PAWN_PROMOTION    : 6,
  GAME_OVER         : 7
}

// Player:
function Player(color) {
  this.color = color;
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
function Board () {
  this.board = new Array(8);
  for (var i = 0; i < 8; i++) {
    this.board[i] = new Array(8);
  }
  // Initialize positions on board:
  this.board[0][0] = { 'piece' : PieceEnum.ROOK, 'color' : Player.ColorEnum.BLACK };
  this.board[1][0] = { 'piece' : PieceEnum.KNIGHT, 'color' : Player.ColorEnum.BLACK };
  this.board[2][0] = { 'piece' : PieceEnum.BISHOP, 'color' : Player.ColorEnum.BLACK };
  this.board[3][0] = { 'piece' : PieceEnum.QUEEN, 'color' : Player.ColorEnum.BLACK };
  this.board[4][0] = { 'piece' : PieceEnum.KING, 'color' : Player.ColorEnum.BLACK };
  this.board[5][0] = { 'piece' : PieceEnum.BISHOP, 'color' : Player.ColorEnum.BLACK };
  this.board[6][0] = { 'piece' : PieceEnum.KNIGHT, 'color' : Player.ColorEnum.BLACK };
  this.board[7][0] = { 'piece' : PieceEnum.ROOK, 'color' : Player.ColorEnum.BLACK };
  for (var i = 0; i < 8; i++) {
    this.board[i][1] = { 'piece' : PieceEnum.PAWN, 'color' : Player.ColorEnum.BLACK };
  }

  for (var j = 2; j < 6; j++) {
    for (var i = 0; i < 8; i++) {
      this.board[i][j] = null;
    }
  }

  for (var i = 0; i < 8; i++) {
    this.board[i][6] = { 'piece' : PieceEnum.PAWN, 'color' : Player.ColorEnum.WHITE };
  }
  this.board[0][7] = { 'piece' : PieceEnum.ROOK, 'color' : Player.ColorEnum.WHITE};
  this.board[1][7] = { 'piece' : PieceEnum.KNIGHT, 'color' : Player.ColorEnum.WHITE};
  this.board[2][7] = { 'piece' : PieceEnum.BISHOP, 'color' : Player.ColorEnum.WHITE};
  this.board[3][7] = { 'piece' : PieceEnum.QUEEN, 'color' : Player.ColorEnum.WHITE};
  this.board[4][7] = { 'piece' : PieceEnum.KING, 'color' : Player.ColorEnum.WHITE};
  this.board[5][7] = { 'piece' : PieceEnum.BISHOP, 'color' : Player.ColorEnum.WHITE};
  this.board[6][7] = { 'piece' : PieceEnum.KNIGHT, 'color' : Player.ColorEnum.WHITE};
  this.board[7][7] = { 'piece' : PieceEnum.ROOK, 'color' : Player.ColorEnum.WHITE};
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
  if (this.isCheck(playerColor, pos1, pos2) == Board.UpdateStateEnum.ILLEGAL_MOVE)
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
Board.prototype.isCheck = function(playerColor, pos1, pos2) {
  var before = this.board[pos2.x][pos2.y];
  this.board[pos2.x][pos2.y] = this.board[pos1.x][pos1.y]; 
  this.board[pos1.x][pos1.y] = null;

  var pos = { 'x' : 0, 'y' : 0 };

  // Iterate over all the board.
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      //console.log(i + ", " + j);

      if (this.board[i][j] != null) {
        pos.x = i;
        pos.y = j;
        if (this.board[i][j].color == Player.ColorEnum.WHITE && 
            this.isLegalMove(this.board[i][j].piece, this.board[i][j].color, pos, blackKingPos)) {

          // put back the pieces where they were.
          this.board[pos1.x][pos1.y] = this.board[pos2.x][pos2.y];
          this.board[pos2.x][pos2.y] = before;

          if (playerColor == Player.ColorEnum.BLACK) { // player cannot cause it's own king to be checked. Error.
            console.log("This move will cause your king to be ckeced.");
            return Board.UpdateStateEnum.ILLEGAL_MOVE;

          } else {
            blackInCheck = true;
            blackCheckedBy.push(pos);
            blackRightCastling = false;
            blackLeftCastling = false;
            console.log("Black King was checked.");
            return Board.UpdateStateEnum.OK_MOVE;
          }

        } else if (this.board[i][j].color == Player.ColorEnum.BLACK &&
            this.isLegalMove(this.board[i][j].piece, this.board[i][j].color, pos, whiteKingPos)) {
        
          // put back the pieces where they were.
          this.board[pos1.x][pos1.y] = this.board[pos2.x][pos2.y];
          this.board[pos2.x][pos2.y] = before;

          if (playerColor == Player.ColorEnum.WHITE) { // player cannot cause it's own king to be checked. Error.
            console.log("This move will cause your king to be ckeced.");
            return Board.UpdateStateEnum.ILLEGAL_MOVE;

          } else {
            whiteInCheck = true;
            whiteCheckedBy.push(pos);
            whiteRightCastling = false;
            whiteLeftCastling = false;
            console.log("White King was checked.");
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
  if ( !blackInCheck && playerColor == Player.ColorEnum.BLACK) { 
    return false;
  } else if ( !whiteInCheck && playerColor == Player.ColorEnum.WHITE) { 
    return false;
  }

  // 2. Cannot move the king.
  var pos2 = { 'x' : 0, 'y' : 0 } 
  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {  
      if (playerColor == Player.ColorEnum.BLACK) { 
        pos2.x = blackKingPos.x + i;
        pos2.y = blackKingPos.y + j; 
        if (this.isLegalMoveKING(playerColor, blackKingPos, pos2) && !this.isAttacked(playerColor, pos2))
          return false;
      } else {
        pos2.x = whiteKingPos.x + i;
        pos2.y = whiteKingPos.y + j; 
        if (this.isLegalMoveKING(playerColor, whiteKingPos, pos2) && !this.isAttacked(playerColor, pos2))
          return false;
      }
    }
  }
  return true;  
  // 3. Cannot block all checks.
  if (blackInCheck && blackCheckedBy.length != 0) {
    // for all pieces checking king, find whether can be blocked.
    // ------------- TODO
  } else 
    console.log("error. piece causing black king check is unknown.");
    
}

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
    if (playerColor == Player.ColorEnum.BLACK && pos1.y == 0) {
      if (pos1.x ==7)
        blackRightCastling = false;
      else if (pos1.x == 0)
        blackLeftCastling = false;
    } else if (playerColor == Player.ColorEnum.WHITE && pos1.y == 7) {
      if (pos1.x == 7)
        whiteRightCastling = false;
      else if (pos1.x == 0)
        whiteLeftCastling = false;
    }
  }
  if (piece == PieceEnum.KING) {
    if (playerColor == Player.ColorEnum.BLACK) {
      blackRightCastling = false;
      blackLeftCastling = false;
      blackKingPos.x = pos2.x;
      blackKingPos.y = pos2.y;
    } else {
      whiteRightCastling = false;
      whiteLeftCastling = false;
      whiteKingPos.x = pos2.x;
      whiteKingPos.y = pos2.y;
    }
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

  // If requested, perform castling and update variables.
  if (piece == PieceEnum.KING) {
    if (playerColor == Player.ColorEnum.BLACK) {
      if (blackRightCastling && pos2.x == 6 && pos2.y == 0 && pos1.x == 4 && pos1.y == 0 &&
          this.board[6][0] == null && this.board[5][0] == null) {
        // Move Rook.
        this.board[5][0] = this.board[7][0];
        this.board[7][0] = null;
        // Move King.
        this.board[6][0] = this.board[pos1.x][pos1.y]; 
        this.board[pos1.x][pos1.y] = null;
        // Update variables.
        blackRightCastling = false;
        blackLeftCastling = false;
        blackKingPos.x = pos2.x;
        blackKingPos.y = pos2.y;
        return Board.UpdateStateEnum.CASTLING_BLACK_R;
      }
      else if (blackLeftCastling && pos2.x == 2 && pos2.y == 0 && pos1.x == 4 && pos1.y == 0 &&
          this.board[1][0] == null && this.board[2][0] == null && this.board[3][0] == null) {
        // Move Rook.
        this.board[3][0] = this.board[0][0]; 
        this.board[0][0] = null;
        // Move King.
        this.board[pos2.x][pos2.y] = this.board[pos1.x][pos1.y]; 
        this.board[pos1.x][pos1.y] = null;
        // Update variables.
        blackRightCastling = false;
        blackLeftCastling = false;
        blackKingPos.x = pos2.x;
        blackKingPos.y = pos2.y;
        return Board.UpdateStateEnum.CASTLING_BLACK_L;
      }
    } else if (playerColor == Player.ColorEnum.WHITE) {
      if (whiteRightCastling && pos2.x == 6 && pos2.y == 7 && pos1.x == 4 && pos1.y == 7 &&
          this.board[6][7] == null && this.board[5][7] == null) {
        // Move Rook.
        this.board[5][7] = this.board[7][7];
        this.board[7][7] = null;
        // Move King.
        this.board[6][7] = this.board[pos1.x][pos1.y]; 
        this.board[pos1.x][pos1.y] = null;
        // Update variables.
        whiteRightCastling = false;
        whiteLeftCastling = false;
        whiteKingPos.x = pos2.x;
        whiteKingPos.y = pos2.y;

        return Board.UpdateStateEnum.CASTLING_WHITE_R;
      }
      else if (whiteLeftCastling && pos2.x == 2 && pos2.y == 7 && pos1.x == 4 && pos1.y == 7 &&
          this.board[1][7] == null && this.board[2][7] == null && this.board[3][7] == null) {
        // Move Rook.
        this.board[3][7] = this.board[0][7]; 
        this.board[0][7] = null;
        // Move King.
        this.board[pos2.x][pos2.y] = this.board[pos1.x][pos1.y]; 
        this.board[pos1.x][pos1.y] = null;
        // Update variables.
        whiteRightCastling = false;
        whiteLeftCastling = false;
        whiteKingPos.x = pos2.x;
        whiteKingPos.y = pos2.y;

        return Board.UpdateStateEnum.CASTLING_WHITE_L;
      }
    }
  }
  return Board.UpdateStateEnum.ILLEGAL_MOVE;
}

Board.prototype.isOpponentsPiece = function(playerColor, piece, x, y) {
  return (this.board[x][y].color != playerColor && 
      (this.board[x][y].piece == piece || this.board[x][y].piece == PieceEnum.QUEEN))
}

Board.prototype.isAttackedFrom = function(playerColor, pos, pos_in_check) {
  console.log("bdds");

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
  

Board.prototype.isAttacked = function(playerColor, pos) {
  if (this.isAttackedByKnight(playerColor, pos) ||
      this.isAttackedByRookOrQueen(playerColor, pos) ||
      this.isAttackedByBishopOrQueen(playerColor, pos) ||
      this.isAttackedByPawn(playerColor, pos))
    return true;
  return false;
    // TODO: Is attacked by a King? (is this code necessary?)
}

// The following handlers are from : http://www.html5rocks.com/en/tutorials/dnd/basics/
function handleDragStart(e) {
  if (getPieceInfo(this.parentNode.id).pieceColor == newGame.currentPlayer.getColor()) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData("text/plain", this.parentNode.id);
  } else {
    console.log("Error!");
  }
  newGame.board.checkBoardCorrectness();
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
      var isLegal = newGame.getBoard().updateBoard(pieceInfo.piece, pos1, pos2, 
          pieceInfo.pieceColor);
     
      if (isLegal != Board.UpdateStateEnum.ILLEGAL_MOVE) {
        newGame.updateTurn();

        if (this.innerText != "") { // Keep track of captured pieces.
          document.getElementById("captured").innerHTML = 
            document.getElementById("captured").innerHTML.concat(" ").concat(this.innerText);
        }
        this.innerText = srcEl.childNodes[0].innerText; // move piece to new location.
        srcEl.childNodes[0].innerText = ""; // empty old location. 
        //or srcEl.innerHTML = Board.emptyCellHTML; 

        if (isLegal == Board.UpdateStateEnum.PAWN_PROMOTION)
          this.innerText = "♕";
        if (isLegal == Board.UpdateStateEnum.CASTLING_BLACK_R) {
          document.getElementById("F1").childNodes[0].innerText = document.getElementById("H1").childNodes[0].innerText; 
          document.getElementById("H1").childNodes[0].innerText = "";
        }
        else if (isLegal == Board.UpdateStateEnum.CASTLING_WHITE_R) {
          document.getElementById("F8").childNodes[0].innerText = document.getElementById("H8").childNodes[0].innerText; 
          document.getElementById("H8").childNodes[0].innerText = "";
        }
        else if (isLegal == Board.UpdateStateEnum.CASTLING_BLACK_L) {
          document.getElementById("D1").childNodes[0].innerText = document.getElementById("A1").childNodes[0].innerText; 
          document.getElementById("A1").childNodes[0].innerText = "";
        }
        else if (isLegal == Board.UpdateStateEnum.CASTLING_WHITE_L) {
          document.getElementById("D8").childNodes[0].innerText = document.getElementById("A8").childNodes[0].innerText; 
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
  return { 'x': id.charCodeAt(0) - "A".charCodeAt(0), 'y': parseInt(id.charAt(1)) - 1}
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
  newGame = new Game();
};


