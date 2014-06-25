var request = require( 'request' ),
	po2json = require( 'po2json' ),
	gpUrlPath = '/default/export-translations?format=po';

module.exports = retrieve;

/**
 * Given a locale abbreviation and optional strings array, retrieve PO file from GlotPress and
 * invoke callback with object representation of locale strings including only specified string
 * properties.
 *
 * @param  {String}   baseUrl  Base URL from which to retrieve PO export
 * @param  {String}   locale   Abbreviation for locale file to download from GlotPress
 * @param  {Array}    strings  Optional array of strings to include in PO object representation
 * @param  {Function} callback Callback to invoke with errors as first argument and PO object
 * representation as second argument
 */
function retrieve( baseUrl, locale, /* strings, */ callback ) {
	// Discover arguments
	var args = Array.prototype.slice.call( arguments ),
		locale, strings, callback;

	if ( args.length < 2 ) {
		throw new Error( 'Expected at least 2 arguments, received ' + args.length );
	}

	locale = args[1];

	if ( args[2] instanceof Array ) {
		strings = args[2];
		callback = args[3];
	} else {
		strings = [];
		callback = args[2];
	}

	// Download PO
	var url =  baseUrl.replace(/\/$/, '') + '/' + locale + gpUrlPath;
	request( url, function( error, response, body ) {
		if ( error ) {
			callback( error );
		} else {
			callback( null, processPO( body, strings ) );
		}
	});
}

/**
 * Given a PO string and array of strings to include, returns an object representation of PO.
 *
 * @param  {String} po      Gettext PO format string
 * @param  {Array}  strings Array of strings to include in final object representation
 * @return {Object}         Object representation of PO string
 */
function processPO( po, strings ) {
	var jsonStrings = po2json.parse( po );

	if ( strings.length > 0 ) {
		// Find desired strings
		var includedStrings = Object.keys( jsonStrings ).filter(function( jsonString ) {
			return strings.indexOf( jsonString ) > -1;
		});

		// Configuration block (at empty string key) is always included
		includedStrings.unshift( '' );

		jsonStrings = pick( jsonStrings, includedStrings );
	}

	return jsonStrings;
}

/**
 * Return a copy of the object only containing the whitelisted properties.
 *
 * @param  {Object} obj  Object from which properties should be retrieved
 * @param  {Array}  keys Set of whitelisted properties to include
 * @return {Object}      A copy of the object only containing the whitelisted properties
 *
 * @see http://underscorejs.org/docs/underscore.html#section-85
 */
function pick( obj, keys ) {
	var copy = {};

	keys.forEach(function( key ) {
		if ( key in obj ) {
			copy[ key ] = obj[ key ];
		}
	});

	return copy;
};