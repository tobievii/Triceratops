



import * as _ from 'lodash';




export function capitalizeFirstLetter(instring: string) {
    instring = instring.toLowerCase();
    return instring.charAt(0).toUpperCase() + instring.slice(1);
}

/* ------------------------------------------------------------------------- */

export function getGUID() {
    var d = new Date().getTime();
    var uuid: string = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

/* ------------------------------------------------------------------------- */



/* ------------------------------------------------------------------------- */

export function log(data:any) {
    var now = new Date();    
    var logItem = {now:now, data:data } //, stack: new Error().stack }
    //console.log(now.toISOString());
    //console.log(a);
    //console.log(logItem);
}

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export function difference(object:any, base:any) {

	function changes(object:any, base:any) {
		return _.transform(object, function(result:any, value:any, key:any) {
			if (!_.isEqual(value, base[key])) {
				result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
			}
		});
    }
    
	return changes(object, base);
}
