Board.prototype.placeKings = function(whitePos, blackPos,
                                      opt_whiteState, opt_blackState) {
  var whiteState = opt_whiteState || {
    'inCheck': false,
    'checkedFrom': null,
    'rightCastling': false,
    'leftCastling' : false };
  var blackState = opt_blackState || {
    'inCheck': false,
    'checkedFrom': null,
    'rightCastling': false,
    'leftCastling' : false };

  this.placePiece(PieceEnum.KING, Player.ColorEnum.WHITE,
                  whitePos, whiteState);
  this.placePiece(PieceEnum.KING, Player.ColorEnum.BLACK,
                  blackPos, blackState);
}

test("Board isLegalMove PAWN", function() {
  var board = new Board();
  for (var i = 0; i < 8; i++) {
    board.placePiece(PieceEnum.PAWN, Player.ColorEnum.WHITE, Pos(i, 6));
    board.placePiece(PieceEnum.PAWN, Player.ColorEnum.BLACK, Pos(i, 1));
  }
  board.placeKings(Pos(4, 7), Pos(4, 0));

  for (var i = 0; i < 8; i++) {
    ok(board.isLegalMove(PieceEnum.PAWN,
                         Player.ColorEnum.WHITE,
                         Pos(i, 6), Pos(i, 5)),
                         "Is legal to move one step down");
    ok(board.isLegalMove(PieceEnum.PAWN,
                         Player.ColorEnum.WHITE,
                         Pos(i, 6), Pos(i, 4)),
                         "Is legal to move two steps down");
    ok(!board.isLegalMove(PieceEnum.PAWN,
                          Player.ColorEnum.WHITE,
                          Pos(i, 6), Pos(i, 3)),
                          "Not legal to move three steps down");
    if (i + 1 < 8) {
      ok(!board.isLegalMove(PieceEnum.PAWN,
                            Player.ColorEnum.WHITE,
                            Pos(i, 6), Pos(i + 1, 3)),
                            "Not legal to move diagonal to the right");
    }
    if (i - 1 >= 0) {
      ok(!board.isLegalMove(PieceEnum.PAWN,
                            Player.ColorEnum.WHITE,
                            Pos(i, 6), Pos(i - 1, 3)),
                            "Not legal to move diagonal to the left");
    }

    ok(board.isLegalMove(PieceEnum.PAWN,
       Player.ColorEnum.BLACK,
       Pos(i, 1), Pos(i, 2)),
       "Is legal to move one step up");
    ok(board.isLegalMove(PieceEnum.PAWN,
       Player.ColorEnum.BLACK,
       Pos(i, 1), Pos(i, 3)),
       "Is legal to move two steps up");
    ok(!board.isLegalMove(PieceEnum.PAWN,
       Player.ColorEnum.BLACK,
       Pos(i, 1), Pos(i, 4)),
       "Not legal to move three steps up");
    if (i + 1 < 8) {
      ok(!board.isLegalMove(PieceEnum.PAWN,
                            Player.ColorEnum.BLACK,
                            Pos(i, 1), Pos(i + 1, 2)),
                            "Not legal to move diagonal to the right");
    }
    if (i - 1 >= 0) {
      ok(!board.isLegalMove(PieceEnum.PAWN,
                            Player.ColorEnum.BLACK,
                            Pos(i, 1), Pos(i - 1, 2)),
                            "Not legal to move diagonal to the left");
    }
  }
});

test("Board isOkMove PAWN", function() {
  var board = new Board();
  board.placePiece(PieceEnum.PAWN, Player.ColorEnum.BLACK, Pos(0, 1));
  board.placePiece(PieceEnum.PAWN, Player.ColorEnum.WHITE, Pos(0, 6));
  board.placeKings(Pos(5, 4), Pos(2, 3));

  // One step up, black.
  equal(board.isOkMove(PieceEnum.PAWN,
                       Pos(0, 1), Pos(0, 2),
                       Player.ColorEnum.BLACK),
        Board.UpdateStateEnum.OK_MOVE,
        "We expect value to be OK_MOVE");
  // Two steps up, black.
  equal(board.isOkMove(PieceEnum.PAWN,
                       Pos(0, 1), Pos(0, 3),
                       Player.ColorEnum.BLACK),
        Board.UpdateStateEnum.OK_MOVE,
        "We expect value to be OK_MOVE");
  // One step up, white.
  equal(board.isOkMove(PieceEnum.PAWN,
                       Pos(0, 6), Pos(0, 5),
                       Player.ColorEnum.WHITE),
        Board.UpdateStateEnum.OK_MOVE,
        "We expect value to be OK_MOVE");
  // Two steps up, white.
  equal(board.isOkMove(PieceEnum.PAWN,
                       Pos(0, 6), Pos(0, 4),
                       Player.ColorEnum.WHITE),
        Board.UpdateStateEnum.OK_MOVE,
        "We expect value to be OK_MOVE");
});

test("Board moveCausesCheck 1", function() {
  var board = new Board();
  board.placePiece(PieceEnum.ROOK, Player.ColorEnum.WHITE, Pos(5, 0));
  board.placePiece(PieceEnum.QUEEN, Player.ColorEnum.BLACK, Pos(3, 0));
  board.placeKings(Pos(7, 7), Pos(0, 0));

  // Lets move the black's queen up and check that moveCausesCheck returns
  // ILLEGAL_MOVE due to white's rook checking black's king.
  equal(board.moveCausesCheck(Player.ColorEnum.BLACK, Player.ColorEnum.BLACK,
                              Pos(3, 0), Pos(3, 5)),
        Board.UpdateStateEnum.ILLEGAL_MOVE,
        "Can't move black's queen because otherwise black's king is checked");

  // But black's queen can kill the rook.
  equal(board.moveCausesCheck(Player.ColorEnum.BLACK, Player.ColorEnum.BLACK,
                              Pos(3, 0), Pos(5, 0)),
        Board.UpdateStateEnum.OK_MOVE,
        "Black's queen should be able to kill white's rook");
});

test("Board moveCausesCheck Bishop", function() {
  var board = new Board();
  board.placePiece(PieceEnum.BISHOP, Player.ColorEnum.WHITE, Pos(3, 3));
  board.placePiece(PieceEnum.QUEEN, Player.ColorEnum.BLACK, Pos(1, 1));
  board.placeKings(Pos(7, 7), Pos(0, 0));

  // Lets move the black's queen to the left and check that moveCausesCheck returns
  // ILLEGAL_MOVE due to white's bishap checking black's king.
  equal(board.moveCausesCheck(Player.ColorEnum.BLACK, Player.ColorEnum.BLACK,
                              Pos(1, 1), Pos(3, 1)),
        Board.UpdateStateEnum.ILLEGAL_MOVE,
        "Can't move black's queen because otherwise black's king is checked");

  // But black's queen can kill the bishop.
  equal(board.moveCausesCheck(Player.ColorEnum.BLACK, Player.ColorEnum.BLACK,
                              Pos(1, 1), Pos(3, 3)),
        Board.UpdateStateEnum.OK_MOVE,
        "Black's queen should be able to kill white's bishop");
});

test("Board moveCausesCheck Queen 1", function() {
  var board = new Board();
  board.placePiece(PieceEnum.QUEEN, Player.ColorEnum.WHITE, Pos(3, 3));
  board.placePiece(PieceEnum.QUEEN, Player.ColorEnum.BLACK, Pos(1, 1));
  board.placeKings(Pos(7, 7), Pos(0, 0));

  // Lets move the black's queen to the left and check that moveCausesCheck returns
  // ILLEGAL_MOVE due to white's queen checking black's king.
  equal(board.moveCausesCheck(Player.ColorEnum.BLACK, Player.ColorEnum.BLACK,
                              Pos(1, 1), Pos(3, 1)),
        Board.UpdateStateEnum.ILLEGAL_MOVE,
        "Can't move black's queen because otherwise black's king is checked");

  // But black's queen can kill white's queen.
  equal(board.moveCausesCheck(Player.ColorEnum.BLACK, Player.ColorEnum.BLACK,
                              Pos(1, 1), Pos(3, 3)),
        Board.UpdateStateEnum.OK_MOVE,
        "Black's queen should be able to kill white's queen");
});

test("Board moveCausesCheck Queen 2", function() {
  var board = new Board();
  board.placePiece(PieceEnum.QUEEN, Player.ColorEnum.WHITE, Pos(5, 0));
  board.placePiece(PieceEnum.QUEEN, Player.ColorEnum.BLACK, Pos(3, 0));
  board.placeKings(Pos(7, 7), Pos(0, 0));

  // Lets move the black's queen up and check that moveCausesCheck returns
  // ILLEGAL_MOVE due to white's queen checking black's king.
  equal(board.moveCausesCheck(Player.ColorEnum.BLACK, Player.ColorEnum.BLACK,
                              Pos(3, 0), Pos(3, 5)),
        Board.UpdateStateEnum.ILLEGAL_MOVE,
        "Can't move black's queen because otherwise black's king is checked");

  // But black's queen can kill white's queen.
  equal(board.moveCausesCheck(Player.ColorEnum.BLACK, Player.ColorEnum.BLACK,
                              Pos(3, 0), Pos(5, 0)),
        Board.UpdateStateEnum.OK_MOVE,
        "Black's queen should be able to kill white's queen");
});
