var board = [];
var selected = [];
var numSelected = 0;
var turn = "white";
var turnNum = 1;


function load() {
    "use strict";
//    document.getElementsByClassName("container")[0].style.paddingLeft =
//        `${(window.screen.width - window.screen.height) / 2}px`;
    createBoard();
    displayBoard();
}

function createBoard() {
    "use strict";
    for (var i = 0; i < 8; i++) {
        board.push([]);
        for (var j = 0; j < 8; j++) {
            //        chess pieces
            //      R ,Kn,B ,K ,Q ,B ,Kn,R
            //      P ,P ,P ,P ,P ,P ,P ,P
            if (i === 0 || i === 7) {
                switch(j) {
                    case 0:
                    case 7:
                        board[i].push({color: (i === 0 ? "black" : "white"), piece: "R"});
                        break;
                    case 1:
                    case 6:
                        board[i].push({color: (i === 0 ? "black" : "white"), piece: "Kn"});
                        break;
                    case 2:
                    case 5:
                        board[i].push({color: (i === 0 ? "black" : "white"), piece: "B"});
                        break;
                    case 3:
                        board[i].push({color: (i === 0 ? "black" : "white"), piece: "Q"});
                        break;
                    case 4:
                        board[i].push({color: (i === 0 ? "black" : "white"), piece: "K"});
                        break;
                        
                }
            }
            else if (i === 1 || i === 6) {
                board[i].push({color: (i === 1 ? "black" : "white"), piece: "P", /*en passat*/enP: false});
            }
        }
    }
}

function displayBoard() {
    "use strict";
    var black = true;
    var html = "";
//     style="width: ${window.screen.height}px;"
    html+= `<table>`;
    for (var i = 0; i < 8; i++) {
        html+= "<tr>";
        for (var j = 0; j < 8; j++) {
            black = !black;
            html+= `<td onclick="select(${i}, ${j})" id="row${i}col${j}" class="${black ? "blackSquare" : "whiteSquare"}"`;
            html+= board[i][j] ? ` style="color: ${board[i][j].color === "black" ? "black" : "white"}" >${board[i][j].piece}` : ">&nbsp";
            html+= "</td>";
        }
        html+= "</tr>";
        black = !black;
    }
    html+= "</table>";
    document.getElementById("board").innerHTML = html;
}

function select(row, col) {
    "use strict";
    document.getElementById(`row${row}col${col}`).style.backgroundColor = "green";
    numSelected++;
    if (numSelected === 1) {
        if (board[row][col]) {
            selected = [row, col];
        }
        else{
            numSelected--;
            displayBoard();
        }
    }
    if (numSelected === 2) {
        if (board[row][col] !== board[selected[0]][selected[1]]) {
            move(selected[0], selected[1], row, col);
        }
        displayBoard();
        numSelected = 0;
    }
}

function move(r1, c1, r2, c2) {
    "use strict";
    var turnedEnP = false;
    var enPTaken = false;
    var queen = false;
    //check whose turn it is
    if (board[r1][c1].color !== turn) {
        console.log(board[r1][c1].color)
        console.log(turn);
        return;
    }
    if (board[r1][c1] && ((board[r2][c2] && board[r1][c1].color !== board[r2][c2].color) || !board[r2][c2])) {
        var color = board[r1][c1].color === "white" ? -1 : 1;

        //Pawn
        if (board[r1][c1].piece === "P") {
            if ((c1 === c2 && (r1 + (2 * color) === r2 && (r1 === 1 || r1 === 6)) && !board[r2][c2] && !board[r1 + color][c1])) {
                turnedEnP = true;
            }
            if (Math.abs(c1 - c2) === 1 && !board[r2][c2] && board[r1][c2] && board[r1][c2].enP) {
                enPTaken = true;
            }
            if (!((//movement
                c1 === c2 && 
                /*2 spaces*/((r1 + color === r2) || (r1 + (2 * color) === r2 && (r1 === 1 || r1 === 6))) &&
                !board[r2][c2] &&
                !board[r1 + color][c1]) ||
                //taking
                (Math.abs(c1 - c2) === 1 &&
                board[r2][c2] &&
                r1 + color === r2) ||
                //en passat
                (Math.abs(c1 - c2) === 1 && !board[r2][c2] && board[r1][c2] && board[r1][c2].enP)
                )) {
                return;
            }
        }

        //Rook
        rook: {
            if (board[r1][c1].piece === "R" || board[r1][c1].piece === "Q") {
                //movement
                //vertical
                if (c1 === c2 && r1 !== r2) {
                    queen = true;
                    //checking for blocking pieces
                    for (var i = (r1 < r2 ? r1 : r2) + 1; i < (r1 < r2 ? r2 : r1); i++) {
                        if (board[i][c1]) {
                            return;
                        }
                    }
                }
                //horizontal
                else if (c1 !== c2 && r1 === r2) {
                    queen = true;
                    //checking for blocking pieces
                    for (var i = (c1 < c2 ? c1 : c2) + 1; i < (c1 < c2 ? c2 : c1); i++) {
                        if (board[r1][i]) {
                            return;
                        }
                    }
                }
                else {
                    if (board[r1][c1].piece === "Q") {
                        break rook;
                    }
                    return;
                }
            }
        }

        //Knight
        if (board[r1][c1].piece === "Kn" && !(
                //movement
                (Math.abs(c2 - c1) === 1 && Math.abs(r2 - r1) === 2) ||
                (Math.abs(c2 - c1) === 2 && Math.abs(r2 - r1) === 1)
                )) {
            return;
        }

        //Bishop or Queen
        if ((board[r1][c1].piece === "B" || board[r1][c1].piece === "Q" ) && !queen) {
            //movement
            if (Math.abs(c2 - c1) === Math.abs(r2 - r1)) {
                //checking for blocking pieces
                for (var i = 1; i < (c1 > c2 ? c1 - c2 : c2 - c1); i++) {
                    //movement in different directions
                    //BR -> TL
                    if ((r1 > r2) && (c1 > c2)) {
                        if (board[r1 - i][c1 - i]) {
                            return;
                        }
                    }
                    //TL -> BR
                    else if ((r1 < r2) && (c1 < c2)) {
                        if (board[r1 + i][c1 + i]) {
                            return;
                        }
                    }
                    //TR -> BL
                    else if ((r1 < r2) && (c1 > c2)) {
                        if (board[r1 + i][c1 - i]) {
                            return;
                        }
                    }
                    //BL -> TR
                    else if ((r1 > r2) && (c1 < c2)) {
                        if (board[r1 - i][c1 + i]) {
                            return;
                        }
                    }
                }
            }
            else {
                return;
            }
        }

        //King
        if(board[r1][c1].piece == "K" && !(
                Math.abs(c1 - c2) <= 1 &&
                Math.abs(r1 - r2) <= 1
                )) {
            return;
        }
        
        
        board[r1][c1].enP = turnedEnP ? true : false;
        

        
        //move
        var takes = board[r2][c2];
        board[r2][c2] = board[r1][c1];
        board[r1][c1] = null;
        if (enPTaken) {
            board[r2 - color][c2] = null;
        }
                
        turn = turn === "white" ? "black" : "white";
        turnNum++;
        
        //log the move
        logMove(r1, c1, r2, c2, board[r2][c2].piece, takes);
        document.getElementById("turn").innerHTML = turn === "white" ? "White's Turn" : "Black's Turn";
        document.getElementById("turn").style.color = turn;
        return;
    }
}

function reset() {
    "use strict";
    window.location.reload();
}

function checkCheck(color, row, col) {
    "use strict";
    var oppColor = color === "white" ? "black" : "white";
    if (color === "white") {
        for (var i = row; i < 8; i++) {
            if (board[i][col] === null) {
                continue;
            }
            else if (board[i][col].color === oppColor && (board[i][col].piece === "Q" || board[i][col].piece === "R")) {
                return true;
            }
            else {
                break;
            }
        }
        for(i = row; i >= 0; i++) {
            if (board[i][col] === null) {
                continue;
            }
            else if (board[i][col].color === oppColor && (board[i][col].piece === "Q" || board[i][col].piece === "R")) {
                return true;
            }
            else {
                break;
            }
        }
    }
    else/*color === "black"*/ {
        
    }
    return false;
}

function coordsToMove(row, col) {
    "use strict";
    
    var letter = (col + 10).toString(18);
    
    return letter + (8 - row).toString();
}

function logMove(r1, c1, r2, c2, piece, takes) {
    "use strict";
    
    var check = checkCheck(board[r2][c2].color, r2, c2);
    
    var log = `<div style="color: ${turn}; background-color: ${turn === "white" ? "#999" : "#666"};">${turnNum}. ${coordsToMove(r1, c1)}`;
    if (takes) {
        log+= "x";
    }
    log+= coordsToMove(r2, c2);
    if (check) {
        log+= "+";
    }
    log+= "</div>";
    document.getElementById("log").innerHTML+= log;
}


/*
random comment
*/
