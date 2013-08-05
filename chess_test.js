  test("Board isLegalMove PAWN", function() {
    var board = new Board();
    for (var i = 0; i < 8; i++) {
      board.placePiece(PieceEnum.PAWN, Player.ColorEnum.BLACK, Pos(i, 1));
      board.placePiece(PieceEnum.PAWN, Player.ColorEnum.WHITE, Pos(i, 6));
    }
    board.placePiece(PieceEnum.KING, Player.ColorEnum.BLACK, Pos(4, 0),
                     { 'inCheck': false,
                       'checkedFrom': null,
                       'rightCastling': false,
                       'leftCastling' : false });
    board.placePiece(PieceEnum.KING, Player.ColorEnum.WHITE, Pos(4, 7),
                     { 'inCheck': false,
                       'checkedFrom': null,
                       'rightCastling': false,
                       'leftCastling' : false });

    for (var i = 0; i < 8; i++) {
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
    }
  });

test("Board isOkMove PAWN", function() {
  var board = new Board();
  board.placePiece(PieceEnum.PAWN, Player.ColorEnum.BLACK, Pos(0, 1));
  board.placePiece(PieceEnum.PAWN, Player.ColorEnum.WHITE, Pos(0, 6));
  board.placePiece(PieceEnum.KING, Player.ColorEnum.BLACK, Pos(2, 3),
                   { 'inCheck': false,
                     'checkedFrom': null,
                     'rightCastling': false,
                     'leftCastling' : false });
  board.placePiece(PieceEnum.KING, Player.ColorEnum.WHITE, Pos(5, 4),
                   { 'inCheck': false,
                     'checkedFrom': null,
                     'rightCastling': false,
                     'leftCastling' : false });

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
  board.placePiece(PieceEnum.KING, Player.ColorEnum.BLACK, Pos(0, 0),
                   { 'inCheck': false,
                     'checkedFrom': null,
                     'rightCastling' : false,
                     'leftCastling' : false });
  board.placePiece(PieceEnum.QUEEN, Player.ColorEnum.BLACK, Pos(3, 0));

  board.placePiece(PieceEnum.KING, Player.ColorEnum.WHITE, Pos(7, 7),
                   { 'inCheck': false,
                     'checkedFrom': null,
                     'rightCastling' : false,
                     'leftCastling' : false });
  board.placePiece(PieceEnum.ROOK, Player.ColorEnum.WHITE, Pos(5, 0));

  // Lets move the black's queen up and check that moveCausesCheck returns ILLEGAL_MOVE
  // due to white's rook checking black's king.
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
