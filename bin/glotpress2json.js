#!/usr/bin/env node
var glotpress2json = require( '../glotpress2json' ),
	program = require( 'commander' ),
	strings = [];

program
	.version( require('../package').version )
	.option( '-l, --locale <locale>', 'Abbreviation of locale to download from GlotPress' )
	.option( '-u, --baseUrl <baseUrl>', 'Base URL from which to retrieve PO export' )
	.parse( process.argv );

// Enforce required arguments
if ( ! ( program.locale && program.baseUrl ) ) {
	program.help();
}

// Detect if receiving input via stdin
if ( process.stdin.isTTY ) {
	// Invoked without stdin
	retrieveResults( strings );
} else {
	// Invoked with stdin, so read lines
	process.stdin.setEncoding( 'utf8' );

	process.stdin.on( 'data', function( chunk ) {
		strings = strings.concat( chunk.trim().split( '\n' ) );
	});

	process.stdin.on( 'end', function() {
		retrieveResults( strings );
	});
}

function retrieveResults( strings ) {
	glotpress2json( program.baseUrl, program.locale, strings, processResults );
}

function processResults( err, results ) {
	if ( err ) {
		process.stderr.write( err.message );
	} else {
		process.stdout.write( JSON.stringify( results ) );
	}
}
