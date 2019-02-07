var token = "",
	uid = -1,
	data = null,
	lastAttack = [ -1, -1 ],
	tempAttack = [ -1, -1 ],
	lastUpdate = 0,
	attacking = false,
	playerData = {},
	mode = "",
	attackIndex = 0,
	host = "https://troycolorfight.herokuapp.com/";

function GetCell( x, y ) {
	if( x >= 0 && y >= 0 && x < 30 && y < 30 ) {
		return data[ "cells" ][ y * 30 + x ];
	} else {
		return null;
	}
}	

function Attack( x = -1, y = -1, boost = false ) {
	if( attackIndex == playerData[ "targets" ].length ) {
		Refresh();
		return;
	}
	if( x == -1 && y == -1 ) {
		x = playerData[ "targets" ][ attackIndex ][ "x" ];
		y = playerData[ "targets" ][ attackIndex ][ "y" ];
	}
	if( ( lastAttack[ 0 ] == x && lastAttack[ 1 ] == y ) ) {
		attackIndex++;
		Attack();
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
			if( d[ "err_code" ] == 3 || d[ "err_code" ] == 1 ) {
				Attack();
			} else if( d[ "err_code" ] == 0 ) {
				lastAttack = tempAttack;
				Refresh();
			} else {
				attackIndex++;
				Attack();
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

function GameLoop() {
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

	// Unclaimed special cells
	playerData[ "goldUCells" ] = [];
	playerData[ "energyUCells" ] = [];

	// Enemy special cells
	playerData[ "goldECells" ] = [];
	playerData[ "goldECells" ] = [];

	console.log( data );
	for( var x = 0; x < 30; x++ ) {
		for( var y = 0; y < 30; y++ ) {
			c = data[ "cells" ][ y * 30 + x ];
			if( c[ "o" ] == uid || ( c[ "c" ] == 1 && c[ "a" ] == uid ) ) {
				playerData[ "cells" ].push( c );
				up = GetCell( x, y - 1 );
				right = GetCell( x + 1, y );
				down = GetCell( x, y + 1 );
				left = GetCell( x - 1, y );
				if( up != null && !( up in playerData[ "adjacent" ] ) ) {
					playerData[ "adjacent" ].push( up );
					if( up[ "ct" ] == "gold" ) {
						playerData[ "adjacentGold" ].push( up );
					} else if( up[ "ct" ] == "energy" ) {
						playerData[ "adjacentEnergy" ].push( up );
					}
				}
				if( right != null && !( right in playerData[ "adjacent" ] ) ) {
					playerData[ "adjacent" ].push( right );
					if( right[ "ct" ] == "gold" ) {
						playerData[ "adjacentGold" ].push( right );
					} else if( right[ "ct" ] == "energy" ) {
						playerData[ "adjacentEnergy" ].push( right );
					}
				}
				if( down != null && !( down in playerData[ "adjacent" ] ) ) {
					playerData[ "adjacent" ].push( down );
					if( down[ "ct" ] == "gold" ) {
						playerData[ "adjacentGold" ].push( down );
					} else if( down[ "ct" ] == "energy" ) {
						playerData[ "adjacentEnergy" ].push( down );
					}
				}
				if( left != null && !( left in playerData[ "adjacent" ] ) ) {
					playerData[ "adjacent" ].push( left );
					if( left[ "ct" ] == "gold" ) {
						playerData[ "adjacentGold" ].push( left );
					} else if( left[ "ct" ] == "energy" ) {
						playerData[ "adjacentEnergy" ].push( left );
					}
				}
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
	PursueAccurate( [ "goldUCells", "energyUCells" ] );
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
				for( var i = 0; i < t[ "cells" ].length; i++ ) {
					data[ "cells" ][ t[ "cells" ][ i ][ "y" ] * 30 + t[ "cells" ][ i ][ "x" ] ] = t[ "cells" ][ i ];
				}
			}
			lastUpdate = data[ "info" ][ "time" ];
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

/*
var name_input = document.getElementById( "name_input" ),
	join_button = document.getElementById( "join_button" );

join_button.addEventListener( "click", function() {
	if( name_input.value.trim() != "" ) {
		JoinGame( name_input.value.trim() );
	}
} );
*/
