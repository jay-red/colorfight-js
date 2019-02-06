var token = "",
	uid = -1,
	data = null,
	lastAttack = [ -1, -1 ],
	tempAttack = [ -1, -1 ],
	lastUpdate = 0,
	attacking = false,
	playerData = {},
	mode = "";

function GetCell( x, y ) {
	if( x >= 0 && y >= 0 && x < 30 && y < 30 ) {
		return data[ "cells" ][ y * 30 + x ];
	} else {
		return null;
	}
}	

function Attack( x, y, boost = false ) {
	if( !attacking ) {
		attacking = true;
		tempAttack = [ x, y ];
		var xhr = new XMLHttpRequest();
		xhr.open( "POST", "https://colorfight.herokuapp.com/attack" );
		xhr.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
		xhr.onreadystatechange = function() {
			if( this.readyState == XMLHttpRequest.DONE && this.status == 200 ) {
				attacking = false;
				var d = JSON.parse( this.responseText );
				if( d[ "err_code" ] == 0 ) {
					lastAttack = tempAttack;
				}
			}
		}
		xhr.send( JSON.stringify( { "cellx" : x, "celly" : y, "token" : token } ) );
	}
}

function PursuePrecise( targetStr ) {

}

function PursueAccurate( targetStr ) {

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

	for( var x = 0; x < 30; x++ ) {
		for( var y = 0; y < 30; y++ ) {
			c = data[ "cells" ][ y * 30 + x ];
			if( c[ "o" ] == uid ) {
				playerData[ "cells" ].push( c );
				up = GetCell( x, y - 1 );
				right = GetCell( x + 1, y );
				down = GetCell( x, y + 1 );
				left = GetCell( x - 1, y );
				if( up != null && !( up in playerData[ "adjacent" ] ) ) {
					playerData[ "adjacent" ].push( up );
					if( up[ "ct" ] == "gold" ) {
						playerData[ "adjacentGold" ].append( up );
					} else if( up[ "ct" ] == "energy" ) {
						playerData[ "adjacentEnergy" ].append( up );
					}
				}
				if( right != null && !( right in playerData[ "adjacent" ] ) ) {
					playerData[ "adjacent" ].push( right );
					if( right[ "ct" ] == "gold" ) {
						playerData[ "adjacentGold" ].append( right );
					} else if( right[ "ct" ] == "energy" ) {
						playerData[ "adjacentEnergy" ].append( right );
					}
				}
				if( down != null && !( down in playerData[ "adjacent" ] ) ) {
					playerData[ "adjacent" ].push( down );
					if( down[ "ct" ] == "gold" ) {
						playerData[ "adjacentGold" ].append( down );
					} else if( down[ "ct" ] == "energy" ) {
						playerData[ "adjacentEnergy" ].append( down );
					}
				}
				if( left != null && !( left in playerData[ "adjacent" ] ) ) {
					playerData[ "adjacent" ].push( left );
					if( left[ "ct" ] == "gold" ) {
						playerData[ "adjacentGold" ].append( left );
					} else if( left[ "ct" ] == "energy" ) {
						playerData[ "adjacentEnergy" ].append( left );
					}
				}
			} else {
				if( c[ "ct" ] == "gold" ) {
					if( c[ "o" ] == 0 ) {
						playerData[ "goldUCells" ].push( c );
					} else {
						playerData[ "goldECells" ].push( c );
					}
				} else if( c[ "ct" == "energy" ] ) {
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

function Refresh() {
	var xhr = new XMLHttpRequest();
	xhr.open( "POST", "https://colorfight.herokuapp.com/getgameinfo" );
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
			Refresh();
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
	xhr.open( "POST", "https://colorfight.herokuapp.com/joingame", true );
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