var token = "",
	uid = -1,
	data = null,
	lastAttack = [ -1, -1 ],
	tempAttack = [ -1, -1 ],
	lastUpdate = 0,
	attacking = false,
	blasting = false,
	playerData = {},
	mode = "",
	attackIndex = 0,
<<<<<<< HEAD
	blastIndex = 0,
	host = "https://colorfight.herokuapp.com/";
=======
	host = "https://colorfight.herokuapp.com/";
>>>>>>> 42f21d678908ed665ec6c681a0011f4f6223cec5

function randomize( array ) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;
    while( 0 !== currentIndex ) {
        randomIndex = Math.floor( Math.random() * currentIndex );
        currentIndex -= 1;
        temporaryValue = array[ currentIndex ];
        array[ currentIndex ] = array[ randomIndex ];
        array[ randomIndex ] = temporaryValue;
    }
    return array;
}

function GetCell( x, y ) {
	if( x >= 0 && y >= 0 && x < 30 && y < 30 ) {
		return data[ "cells" ][ y * 30 + x ];
	} else {
		return null;
	}
}	

function BuildBase( x, y ) {
	var xhr = new XMLHttpRequest();
	xhr.open( "POST", host + "/buildbase" );
	xhr.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
	xhr.onreadystatechange = function() {
		if( this.readyState == XMLHttpRequest.DONE && this.status == 200 ) {
		}
	}
	xhr.send( JSON.stringify( { "cellx" : x, "celly" : y, "token" : token } ) );
}

function Blast( x = -1, y = -1, direction = "square" ) {
	if( !playerData[ "blastOverride" ] && blastIndex == playerData[ "blastTargets" ].length ) {
		Refresh();
		return;
	}
	if( x == -1 && y == -1 ) {
		x = playerData[ "blastTargets" ][ blastIndex ][ "x" ];
		y = playerData[ "blastTargets" ][ blastIndex ][ "y" ];
		up = GetCell( x, y - 1 );
		right = GetCell( x + 1, y );
		down = GetCell( x, y + 1 );
		left = GetCell( x - 1, y );
		if( up != null && up[ "o" ] == uid ) {
			y = y - 1;
		} else if( right != null && right[ "o" ] == uid ) {
			x = x + 1;
		} else if( down != null && down[ "o" ] == uid ) {
			y = y + 1;
		} else if( left != null && left[ "o" ] == uid ) {
			x = x - 1;
		} else {
			blastIndex++;
			Blast();
		}
	}
	blasting = true;
	var xhr = new XMLHttpRequest();
	xhr.open( "POST", host + "/blast" );
	xhr.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
	xhr.onreadystatechange = function() {
		if( this.readyState == XMLHttpRequest.DONE && this.status == 200 ) {
			blasting = true;
			var d = JSON.parse( this.responseText );
			if( d[ "err_code" ] == 3 ) {
				if( !playerData[ "blastOverride" ] ) Blast();
			} else if( d[ "err_code" ] == 0 ) {
				Refresh();
			} else {
				if( !playerData[ "blastOverride" ] ) {
					blastIndex++;
					Blast();
				}
			}
		}
	}
	xhr.send( JSON.stringify( { "cellx" : x, "celly" : y, "token" : token, "direction" : direction } ) );
}

function Attack( x = -1, y = -1, boost = false ) {
	if( !playerData[ "attackOverride" ] && attackIndex == playerData[ "targets" ].length ) {
		Refresh();
		return;
	}
	if( x == -1 && y == -1 ) {
		x = playerData[ "targets" ][ attackIndex ][ "x" ];
		y = playerData[ "targets" ][ attackIndex ][ "y" ];
	}
	if( ( lastAttack[ 0 ] == x && lastAttack[ 1 ] == y ) ) {
		if( !playerData[ "attackOverride" ] ) {
			attackIndex++;
			Attack();
		}
		return;
	}
	attacking = true;
	tempAttack = [ x, y ];
	var xhr = new XMLHttpRequest();
	xhr.open( "POST", host + "/attack" );
	xhr.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
	xhr.onreadystatechange = function() {
		if( this.readyState == XMLHttpRequest.DONE && this.status == 200 ) {
			attacking = false;
			var d = JSON.parse( this.responseText );
			if( d[ "err_code" ] == 3 || ( playerData[ "precise" ] && d[ "err_code" ] == 1 ) ) {
				if( !playerData[ "attackOverride" ] ) Attack();
			} else if( d[ "err_code" ] == 0 ) {
				lastAttack = tempAttack;
				Refresh();
			} else {
				if( !playerData[ "attackOverride" ] ) {
					attackIndex++;
					Attack();
				}
			}
		}
	}
	xhr.send( JSON.stringify( { "cellx" : x, "celly" : y, "token" : token } ) );
}

function evaluateTT( c ) {
	if( c[ "t" ] > 0 ) {
		if( c[ "ct" ] == "gold" && c[ "t" ] < 4.0 ) {
			return true;
		} else if( c[ "ct" ] == "energy" && c[ "t" ] < 4.0 ) {
			return true;
		} else if( c[ "t" ] < 4.0 ) {
			return true;
		}
	}
	return false;
}

function distanceDiag( c1, c2 ) {
	return Math.sqrt( Math.pow( Math.abs( c1[ "x" ] - c2[ "x" ] ), 2 ) + Math.pow( Math.abs( c1[ "y" ] - c2[ "y" ] ), 2 ) );
}

function PursuePrecise( targetStrList ) {
	var targets = [];
}

function PursueAccurate( targetStrList ) {
	var targets = [];
	for( var t = 0; t < targetStrList.length; t++ ) {
		targetStr = targetStrList[ t ];
		for( var i = 0; i < playerData[ targetStr ].length; i++ ) {
			for( var j = 0; j < playerData[ "adjacent" ].length; j++ ) {
				targets.push( [ distanceDiag( playerData[ targetStr ][ i ], playerData[ "adjacent" ][ j ] ), playerData[ "adjacent" ][ j ] ] );
			}
		}
	}
	targets = targets.sort( function( a, b ) {
		if( a[ 0 ] < b[ 0 ] ) {
			return -1;
		} else if( a[ 0 ] > b[ 0 ] ) {
			return 1;
		} else {
			return 0;
		}
	} );
	playerData[ "targets" ] = [];
	for( var k = 0; k < targets.length; k++ ) {
		if( evaluateTT( targets[ k ][ 1 ] ) ) {
			playerData[ "targets" ].push( targets[ k ][ 1 ] );
		}
	}
	attackIndex = 0;
	Attack();
}

function InitPlayerData() {
	playerData[ "precise" ] = false;
	playerData[ "attackOverride" ] = false;
	playerData[ "blastOverride" ] = false;
	playerData[ "blastGold" ] = true;
	playerData[ "blastEnergy" ] = true;
}

function EvaluateAdjacent( c ) {
	if( c != null && !( c in playerData[ "adjacent"] ) && c[ "o" ] != uid ) {
		playerData[ "adjacent" ].push( c );
		if( c[ "ct" ] == "gold" ) {
			playerData[ "adjacentGold" ].push( c );
		} else if( c[ "ct" ] == "energy" ) {
			playerData[ "adjacentEnergy" ].push( c );
		} else if( c[ "o" ] == 0 ) {
			playerData[ "adjacentNormal" ].push( c );
		} else {
			playerData[ "adjacentEnemy" ].push( c );
		}
	}
}

function FetchData() {
	var c,
		up,
		right,
		down,
		left;

	// My own cells
	playerData[ "cells" ] = [];

	// All adjacent cells
	playerData[ "adjacent" ] = [];
	playerData[ "adjacentGold" ] = [];
	playerData[ "adjacentEnergy" ] = [];
	playerData[ "adjacentNormal" ] = [];
	playerData[ "adjacentEnemy" ] = []

	// Unclaimed special cells
	playerData[ "goldUCells" ] = [];
	playerData[ "energyUCells" ] = [];

	// Enemy special cells
	playerData[ "goldECells" ] = [];
	playerData[ "energyECells" ] = [];

	for( var x = 0; x < 30; x++ ) {
		for( var y = 0; y < 30; y++ ) {
			c = data[ "cells" ][ y * 30 + x ];
			if( c[ "o" ] == uid || ( playerData[ "precise" ] && c[ "c" ] == 1 && c[ "a" ] == uid ) ) {
				playerData[ "cells" ].push( c );
				up = GetCell( x, y - 1 );
				right = GetCell( x + 1, y );
				down = GetCell( x, y + 1 );
				left = GetCell( x - 1, y );
				EvaluateAdjacent( up );
				EvaluateAdjacent( right );
				EvaluateAdjacent( down );
				EvaluateAdjacent( left );
			} else {
				if( c[ "ct" ] == "gold" ) {
					if( c[ "o" ] == 0 ) {
						playerData[ "goldUCells" ].push( c );
					} else {
						playerData[ "goldECells" ].push( c );
					}
				} else if( c[ "ct" ] == "energy" ) {
					if( c[ "o" ] == 0 ) {
						playerData[ "energyUCells" ].push( c );
					} else {
						playerData[ "energyECells" ].push( c );
					}
				}
			}
		}
	}
}

function ExampleAI() {
	attackIndex = 0;
	playerData[ "targets" ] = randomize( playerData[ "adjacent" ] );
	Attack();
}

function ExampleAIPlus() {
	attackIndex = 0;
	playerData[ "adjacent" ] = randomize( playerData[ "adjacent" ] );
	playerData[ "targets" ] = [];
	for( var t = 0; t < playerData[ "adjacent" ].length; t++ ) {
		if( evaluateTT( playerData[ "adjacent" ][ t ] ) ) {
			playerData[ "targets" ].push( playerData[ "adjacent" ][ t ] );
		}
	}
	Attack();
}

function EvaluateBlast() {
	return playerData[ "energy" ] >= 60;
}

function ExJayNine() {
	if( playerData[ "gold" ] >= 60 && playerData[ "baseNum" ] < 3 ) {
		var newBase = playerData[ "cells" ][ Math.floor( Math.random() * playerData[ "cells" ].length ) ];
		BuildBase( newBase[ "x" ], newBase[ "y" ] );
	}
	attackIndex = 0;
	blastIndex = 0;
	playerData[ "targets" ] = [];
	playerData[ "blastTargets" ] = [];
	var t = 0;
	for( t = 0; t < playerData[ "adjacentGold" ].length; t++ ) {
		if( evaluateTT( playerData[ "adjacentGold" ][ t ] ) ) {
			playerData[ "targets" ].push( playerData[ "adjacentGold" ][ t ] );
		} else if( playerData[ "blastGold" ] && playerData[ "adjacentGold" ][ t ][ "t" ] > 0 ) {
			playerData[ "blastTargets" ].push( playerData[ "adjacentGold" ][ t ] );
		}
	}
	for( t = 0; t < playerData[ "adjacentEnergy" ].length; t++ ) {
		if( evaluateTT( playerData[ "adjacentEnergy" ][ t ] ) ) {
			playerData[ "targets" ].push( playerData[ "adjacentEnergy" ][ t ] );
		} else if( playerData[ "blastEnergy" ] && playerData[ "adjacentEnergy" ][ t ][ "t" ] > 0 ){
			playerData[ "blastTargets" ].push( playerData[ "adjacentEnergy" ][ t ] );
		}
	}
	if( EvaluateBlast() && playerData[ "blastTargets" ].length > 0 ) {
		playerData[ "blastTargets" ] = playerData[ "blastTargets" ].sort( function( a, b ) {
			if( a[ "t" ] > b[ "t" ] ) {
				return -1;
			} else if( a[ "t" ] < b[ "t" ] ) {
				return 1;
			} else {
				return 0;
			}
		} );
		Blast();
	} else {
		playerData[ "adjacentNormal" ] = randomize( playerData[ "adjacentNormal" ] );
		for( t = 0; t < playerData[ "adjacentNormal" ].length; t++ ) {
			if( evaluateTT( playerData[ "adjacentNormal" ][ t ] ) ) {
				playerData[ "targets" ].push( playerData[ "adjacentNormal" ][ t ] );
			}
		}
		for( t = 0; t < playerData[ "adjacentEnemy" ].length; t++ ) {
			if( evaluateTT( playerData[ "adjacentEnemy" ][ t ] ) ) {
				playerData[ "targets" ].push( playerData[ "adjacentEnemy" ][ t ] );
			}
		}
		Attack();
	}
}

function Custom() {
	PursueAccurate( [ "goldUCells", "energyUCells" ] );
}

/*<option value="exampleAI">ExampleAI</option>
<option value="exampleAIPlus">ExampleAI+</option>
<option value="exJayNine">XJ-9</option>
<option value="jared">Jared Bot</option>
<option value="custom">Custom</option>*/

function GameLoop() {
	switch( mode ) {
		case "exampleAIPlus":
			ExampleAIPlus();
			break;
		case "exJayNine":
			ExJayNine();
			break;
		case "custom":
			Custom();
			break;
		default:
			ExampleAI();
			break;
	}
}

function GetTakeTimeEq( timeDiff ) {
	if( timeDiff <= 0 ) return 33;
	return 30 * ( Math.pow( 2, ( -timeDiff / 30.0 ) ) ) + 3;
}

function Refresh() {
	var xhr = new XMLHttpRequest();
	xhr.open( "POST", host + "/getgameinfo" );
	xhr.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
	xhr.onreadystatechange = function() {
		if( this.readyState == XMLHttpRequest.DONE && this.status == 200 ) {
			if( data == null ) {
				data = JSON.parse( this.responseText );
			} else {
				var t = JSON.parse( this.responseText );
				data[ "info" ] = t[ "info" ];
				data[ "users" ] = t[ "users" ];
				for( var i = 0; i < t[ "cells" ].length; i++ ) {
					data[ "cells" ][ t[ "cells" ][ i ][ "y" ] * 30 + t[ "cells" ][ i ][ "x" ] ] = t[ "cells" ][ i ];
				}
			}
			for( var j = 0; j < data[ "cells" ].length; j++ ) {
                if( data[ "cells" ][ j ][ "o" ] == 0 ) {
                	data[ "cells" ][ j ][ "t" ] = 2;
                } else {
                	data[ "cells" ][ j ][ "t" ] = GetTakeTimeEq( data[ "info" ][ "time" ] - data[ "cells" ][ j ][ "ot" ] );
                }
			}
			for( var k = 0; k < data[ "users" ].length; k++ ) {
				if( data[ "users" ][ k ][ "id" ] == uid ) {
					playerData[ "gold" ] = data[ "users" ][ k ][ "gold" ];
					playerData[ "energy" ] = data[ "users" ][ k ][ "energy" ];
					playerData[ "cdTime" ] = data[ "users" ][ k ][ "cdTime" ];
					playerData[ "buildCdTime" ] = data[ "users" ][ k ][ "build_cd_time" ];
					playerData[ "cellNum" ] = data[ "users" ][ k ][ "cell_num" ];
					playerData[ "baseNum" ] = data[ "users" ][ k ][ "base_num" ];
					playerData[ "goldCellNum" ] = data[ "users" ][ k ][ "gold_cell_num" ];
					playerData[ "energyCellNum" ] = data[ "users" ][ k ][ "energy_cell_num" ];
				}
			}
			lastUpdate = data[ "info" ][ "time" ];
			FetchData();
			GameLoop();
		}
	}
	if( data == null ) {
		xhr.send( JSON.stringify( { "protocol" : 2 } ) );
	} else {
		xhr.send( JSON.stringify( { "protocol" : 1, "timeAfter" : lastUpdate } ) );
	}
}	

function JoinGame( name ) {
	var xhr = new XMLHttpRequest();
	xhr.open( "POST", host + "/joingame", true );
	xhr.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
	xhr.onreadystatechange = function() {
		if( this.readyState == XMLHttpRequest.DONE && this.status == 200 ) {
			var d = JSON.parse( this.responseText );
			token = d[ "token" ];
			uid = d[ "uid" ];
			Refresh();
		}
	}
	xhr.send( JSON.stringify( { "name" : name } ) );
}

var name_input = document.getElementById( "name_input" ),
	join_button = document.getElementById( "join_button" ),
	framework_select = document.getElementById('framework_select');

var plus_normal_take_time = document.getElementById( "plus_normal_take_time" ),
	plus_gold_take_time = document.getElementById( "plus_normal_take_time" ),
	plus_energy_take_time = document.getElementById( "plus_energy_take_time" );

var xj_normal_take_time = document.getElementById( "xj_normal_take_time" ),
	xj_gold_take_time = document.getElementById( "xj_normal_take_time" ),
	xj_energy_take_time = document.getElementById( "xj_energy_take_time" ),
	xjgold_yes = document.getElementById( "xjgold_yes" ),
	xjgold_no = document.getElementById( "xjgold_no" ),
	xjenergy_yes = document.getElementById( "xjenergy_yes" ),
	xjenergy_no = document.getElementById( "xjenergy_no" );

join_button.addEventListener( "click", function() {
	if( name_input.value.trim() != "" ) {
		JoinGame( name_input.value.trim() );
		InitPlayerData();
		framework_select.disabled = true;
		name_input.disabled = true;
		join_button.disabled = true;
	}
} );

framework_select.addEventListener( "change", function() {
	//Hide all the divs
	document.getElementById('exampleAIDiv').setAttribute("hidden", true);
	document.getElementById('exampleAIPlusDiv').setAttribute("hidden", true);
	document.getElementById('exJayNineDiv').setAttribute("hidden", true);
	document.getElementById('jaredDiv').setAttribute("hidden", true);
	document.getElementById('customDiv').setAttribute("hidden", true);

	//Show the correct div
	mode = framework_select.value;
	document.getElementById( mode + "Div" ).removeAttribute("hidden");

	if( mode == "jared" ) {
		name_input.disabled = true;
		join_button.disabled = true;
	} else {
		name_input.disabled = false;
		join_button.disabled = false;
	}
} );
