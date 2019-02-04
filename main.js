var token = "",
	uid = -1,
	data = null,
	lastAttack = [ -1, -1 ],
	tempAttack = [ -1, -1 ],
	lastUpdate,
	attacking = false;

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

function Refresh() {
	var xhr = new XMLHttpRequest();
	xhr.open( "POST", "https://colorfight.herokuapp.com/getgameinfo" );
	xhr.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
	xhr.onreadystatechange = function() {
		if( this.readyState == XMLHttpRequest.DONE && this.status == 200 ) {
			var c,
				d,
				cc;
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
			for( var x = 0; x < 30; x++ ) {
				for( var y = 0; y < 30; y++ ) {
					c = data[ "cells" ][ 30 * y + x ];
					if( c[ "o" ] == uid ) {
						d = [[0,-1],[1,0],[0,1],[-1,0]][Math.floor( Math.random() * 4 )];
						cc = GetCell( x + d[ 0 ], y + d[ 1 ] );
						if( cc != null && cc[ "o" ] != uid && x + d[ 0 ] != lastAttack[ 0 ] && y + d[ 1 ] != lastAttack[ 1 ] ) {
							Attack( x + d[ 0 ], y + d[ 1 ] );
						}
					}
				}
			}
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

JoinGame( "MyAI" );
