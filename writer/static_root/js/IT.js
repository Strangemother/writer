/*
Simple type checking in a easy to ready.
returns boolean for type check.

it(1).is(Number)
it(1).is('Number')
it(1).is('number')

it.is('number', 1)

 */

class IT {
    /*
     super simple type checking for inline assertions
     and logical checks.
     */

    constructor(v){
        var instance;
        if(IT.singleton) {
            instance = IT._instance;

            if(instance === undefined) {
                this.id = this.gen()
                instance = IT._instance = this;
            }
            return instance;
        }

    }

    gen(){
        return ( (Math.random() + +(new Date) )).toString(14)
    }

    check(entity, compare) {
        /*
         Check the arguments through type checking
         */
        this.value = entity;
        return this
    }

    is(matchType, value){
        var name = matchType;
        var _iss = this.getIs('string')
        /* Check if the given entity to check against is a string pointer
        or a primitive */
        if( _iss(name) === false ) {
            /*
             A Primitive given; resolve the internal name.
             */
            var hasConstructor = false;
            try{
                hasConstructor = matchType['constructor'] !== undefined;
            } catch(e) {
                if( (e instanceof TypeError) === false) {
                    throw e
                }
            }
            if(hasConstructor) {

                // Boolean safe
                if( this.getIs('boolean')(name) ) {
                    name = (name === true)? 'true': 'false'
                } else {
                    if(matchType['name'] === undefined) {

                        name = matchType.constructor.name.toLowerCase()

                    } else {
                        name = matchType.name.toLowerCase()
                    }
                }
            }
        }
        if(value === undefined) {
            value = this.value;
        }

        return this.isScope(name, value)
    }

    isScope(typeName, itValue){
        /*
        Return a chained is() routine. specfic to the it() call
         */
        var isType = this.getIs(typeName);
        // log('checker function:', typeName, 'v', itValue)
        return isType.apply(this, [itValue])
    }

    getIs(name) {
        var n = `_${name}`;
        var error = function(n){
            throw Error(`Type check not found ${n}`)
        };

        if( IS[n] === undefined) {
            error(n)
        }

        var v = function typeCheckCaller(){
            if( IS[n] === undefined) {
                error(n)
            }
            return IS[n].apply(IS, arguments);
        }

        return v;
    }
}

var it_caller = function(){
    /*
     IT class functional caller and
     chainer.
     */
    var _it = new IT();
    return _it.check.apply(_it, arguments);
}

IT.is = function(b, a){
    var v = IT.g(a).is(b)
    return v
}

IT.globalName = '__it'
IT.singleton = false;
IT.instance = it_caller;
IT.g = IT.instance;

try{
    window[IT.globalName] = IT.g
    window[IT.globalName].is = IT.is;
} catch(e) {
    var window = undefined
}



var IS = (function() {

    this._null = function( a )
    {
        return ( a === null );
    };
    this._undefined = function( a )
    {
        return ( this._null( a ) || typeof a == 'undefined' || a === 'undefined' );
    };

    this._string = function ( a )
    {
        return ( ( a instanceof String || typeof a == 'string' ) && !this._undefined( a ) && !this._true( a ) && !this._false( a ) );
    };
    this._number = function( a )
    {
        return ( ( a instanceof Number || typeof a == 'number' ) && !isNaN( a ) );
    };
    this._boolean = function( a )
    {
        return ( a instanceof Boolean || typeof a == 'boolean' || this._true( a ) || this._false( a ) );
    };
    this._object = function( a )
    {
        return ( ( a instanceof Object || typeof a == 'object' ) && !this._null( a ) && !this._jquery( a ) && !this._array( a ) );
    };
    this._array = function ( a )
    {
        return ( a instanceof Array );
    };
    this._function = function( a )
    {
        return ( a instanceof Function || typeof a == 'function' );
    };

    this._jquery = function ( a )
    {
        return ( typeof jQuery != 'undefined' && a instanceof jQuery );
    };

    this._true = function( a )
    {
        return ( a === true || a === 'true' );
    };
    this._false = function( a )
    {
        return ( a === false || a === 'false' );
    };
    this._percentage = function( a )
    {
        return ( this._string( a ) && a.slice( -1 ) == '%' && this._number( parseInt( a.slice( 0, -1 ), 10 ) ) );
    };

    return this;
}).apply({});
