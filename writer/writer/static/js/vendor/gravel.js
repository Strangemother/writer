
// color.js - version 0.5
    // Copyright (c) 2008-2013, Andrew Brehaut, Tim Baumann, Matt Wilson
    // All rights reserved.
    //
    // Redistribution and use in source and binary forms, with or without
    // modification, are permitted provided that the following conditions are met:
    //
    // * Redistributions of source code must retain the above copyright notice,
    //   this list of conditions and the following disclaimer.
    // * Redistributions in binary form must reproduce the above copyright notice,
    //   this list of conditions and the following disclaimer in the documentation
    //   and/or other materials provided with the distribution.
    //
    // THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    // AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    // IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    // ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
    // LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
    // CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
    // SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
    // INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
    // CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
    // ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
    // POSSIBILITY OF SUCH DAMAGE.

    //
    // HSV <-> RGB code based on code from http://www.cs.rit.edu/~ncs/color/t_convert.html
    // object function created by Douglas Crockford.
    // Color scheme degrees taken from the colorjack.com colorpicker
    //
    // HSL support kindly provided by Tim Baumann - http://github.com/timjb

    // create namespaces
    /*global net */
    if ("undefined" == typeof net) { var net = {}; }
    if (!net.brehaut) { net.brehaut = {}; }

    // this module function is called with net.brehaut as 'this'
    (function ( ) {
      "use strict";
      // Constants

      // css_colors maps color names onto their hex values
      // these names are defined by W3C
      var css_colors = {aliceblue:'#F0F8FF',antiquewhite:'#FAEBD7',aqua:'#00FFFF',aquamarine:'#7FFFD4',azure:'#F0FFFF',beige:'#F5F5DC',bisque:'#FFE4C4',black:'#000000',blanchedalmond:'#FFEBCD',blue:'#0000FF',blueviolet:'#8A2BE2',brown:'#A52A2A',burlywood:'#DEB887',cadetblue:'#5F9EA0',chartreuse:'#7FFF00',chocolate:'#D2691E',coral:'#FF7F50',cornflowerblue:'#6495ED',cornsilk:'#FFF8DC',crimson:'#DC143C',cyan:'#00FFFF',darkblue:'#00008B',darkcyan:'#008B8B',darkgoldenrod:'#B8860B',darkgray:'#A9A9A9',darkgrey:'#A9A9A9',darkgreen:'#006400',darkkhaki:'#BDB76B',darkmagenta:'#8B008B',darkolivegreen:'#556B2F',darkorange:'#FF8C00',darkorchid:'#9932CC',darkred:'#8B0000',darksalmon:'#E9967A',darkseagreen:'#8FBC8F',darkslateblue:'#483D8B',darkslategray:'#2F4F4F',darkslategrey:'#2F4F4F',darkturquoise:'#00CED1',darkviolet:'#9400D3',deeppink:'#FF1493',deepskyblue:'#00BFFF',dimgray:'#696969',dimgrey:'#696969',dodgerblue:'#1E90FF',firebrick:'#B22222',floralwhite:'#FFFAF0',forestgreen:'#228B22',fuchsia:'#FF00FF',gainsboro:'#DCDCDC',ghostwhite:'#F8F8FF',gold:'#FFD700',goldenrod:'#DAA520',gray:'#808080',grey:'#808080',green:'#008000',greenyellow:'#ADFF2F',honeydew:'#F0FFF0',hotpink:'#FF69B4',indianred:'#CD5C5C',indigo:'#4B0082',ivory:'#FFFFF0',khaki:'#F0E68C',lavender:'#E6E6FA',lavenderblush:'#FFF0F5',lawngreen:'#7CFC00',lemonchiffon:'#FFFACD',lightblue:'#ADD8E6',lightcoral:'#F08080',lightcyan:'#E0FFFF',lightgoldenrodyellow:'#FAFAD2',lightgray:'#D3D3D3',lightgrey:'#D3D3D3',lightgreen:'#90EE90',lightpink:'#FFB6C1',lightsalmon:'#FFA07A',lightseagreen:'#20B2AA',lightskyblue:'#87CEFA',lightslategray:'#778899',lightslategrey:'#778899',lightsteelblue:'#B0C4DE',lightyellow:'#FFFFE0',lime:'#00FF00',limegreen:'#32CD32',linen:'#FAF0E6',magenta:'#FF00FF',maroon:'#800000',mediumaquamarine:'#66CDAA',mediumblue:'#0000CD',mediumorchid:'#BA55D3',mediumpurple:'#9370D8',mediumseagreen:'#3CB371',mediumslateblue:'#7B68EE',mediumspringgreen:'#00FA9A',mediumturquoise:'#48D1CC',mediumvioletred:'#C71585',midnightblue:'#191970',mintcream:'#F5FFFA',mistyrose:'#FFE4E1',moccasin:'#FFE4B5',navajowhite:'#FFDEAD',navy:'#000080',oldlace:'#FDF5E6',olive:'#808000',olivedrab:'#6B8E23',orange:'#FFA500',orangered:'#FF4500',orchid:'#DA70D6',palegoldenrod:'#EEE8AA',palegreen:'#98FB98',paleturquoise:'#AFEEEE',palevioletred:'#D87093',papayawhip:'#FFEFD5',peachpuff:'#FFDAB9',peru:'#CD853F',pink:'#FFC0CB',plum:'#DDA0DD',powderblue:'#B0E0E6',purple:'#800080',red:'#FF0000',rosybrown:'#BC8F8F',royalblue:'#4169E1',saddlebrown:'#8B4513',salmon:'#FA8072',sandybrown:'#F4A460',seagreen:'#2E8B57',seashell:'#FFF5EE',sienna:'#A0522D',silver:'#C0C0C0',skyblue:'#87CEEB',slateblue:'#6A5ACD',slategray:'#708090',slategrey:'#708090',snow:'#FFFAFA',springgreen:'#00FF7F',transparent:'#000',steelblue:'#4682B4',tan:'#D2B48C',teal:'#008080',thistle:'#D8BFD8',tomato:'#FF6347',turquoise:'#40E0D0',violet:'#EE82EE',wheat:'#F5DEB3',white:'#FFFFFF',whitesmoke:'#F5F5F5',yellow:'#FFFF00',yellowgreen:'#9ACD32"'};

      // CSS value regexes, according to http://www.w3.org/TR/css3-values/
      var css_integer = '(?:\\+|-)?\\d+';
      var css_float = '(?:\\+|-)?\\d*\\.\\d+';
      var css_number = '(?:' + css_integer + ')|(?:' + css_float + ')';
      css_integer = '(' + css_integer + ')';
      css_float = '(' + css_float + ')';
      css_number = '(' + css_number + ')';
      var css_percentage = css_number + '%';
      var css_whitespace = '\\s*?';

      // http://www.w3.org/TR/2003/CR-css3-color-20030514/
      var hsl_hsla_regex = new RegExp([
        '^hsl(a?)\\(', css_number, ',', css_percentage, ',', css_percentage, '(,', css_number, ')?\\)$'
      ].join(css_whitespace) );
      var rgb_rgba_integer_regex = new RegExp([
        '^rgb(a?)\\(', css_integer, ',', css_integer, ',', css_integer, '(,', css_number, ')?\\)$'
      ].join(css_whitespace) );
      var rgb_rgba_percentage_regex = new RegExp([
        '^rgb(a?)\\(', css_percentage, ',', css_percentage, ',', css_percentage, '(,', css_number, ')?\\)$'
      ].join(css_whitespace) );

      // Package wide variables

      // becomes the top level prototype object
      var color;

      /* registered_models contains the template objects for all the
       * models that have been registered for the color class.
       */
      var registered_models = [];


      /* factories contains methods to create new instance of
       * different color models that have been registered.
       */
      var factories = {};

      // Utility functions

      /* object is Douglas Crockfords object function for prototypal
       * inheritance.
       */
      if (!this.object) {
        this.object = function (o) {
          function F () { }
          F.prototype = o;
          return new F();
        };
      }
      var object = this.object;

      /* takes a value, converts to string if need be, then pads it
       * to a minimum length.
       */
      function pad ( val, len ) {
        val = val.toString();
        var padded = [];

        for (var i = 0, j = Math.max( len - val.length, 0); i < j; i++) {
          padded.push('0');
        }

        padded.push(val);
        return padded.join('');
      }


      /* takes a string and returns a new string with the first letter
       * capitalised
       */
      function capitalise ( s ) {
        return s.slice(0,1).toUpperCase() + s.slice(1);
      }

      /* removes leading and trailing whitespace
       */
      function trim ( str ) {
        return str.replace(/^\s+|\s+$/g, '');
      }

      /* used to apply a method to object non-destructively by
       * cloning the object and then apply the method to that
       * new object
       */
      function cloneOnApply( meth ) {
        return function ( ) {
          var cloned = this.clone();
          meth.apply(cloned, arguments);
          return cloned;
        };
      }


      /* registerModel is used to add additional representations
       * to the color code, and extend the color API with the new
       * operatiosn that model provides. see before for examples
       */
      function registerModel( name, model ) {
        var proto = object(color);
        var fields = []; // used for cloning and generating accessors

        var to_meth = 'to'+ capitalise(name);

        function convertAndApply( meth ) {
          return function ( ) {
            return meth.apply(this[to_meth](), arguments);
          };
        }

        for (var key in model) if (model.hasOwnProperty(key)) {
          proto[key] = model[key];
          var prop = proto[key];

          if (key.slice(0,1) == '_') { continue; }
          if (!(key in color) && "function" == typeof prop) {
            // the method found on this object is a) public and b) not
            // currently supported by the color object. Create an impl that
            // calls the toModel function and passes that new object
            // onto the correct method with the args.
            color[key] = convertAndApply(prop);
          }
          else if ("function" != typeof prop) {
            // we have found a public property. create accessor methods
            // and bind them up correctly
            fields.push(key);
            var getter = 'get'+capitalise(key);
            var setter = 'set'+capitalise(key);

            color[getter] = convertAndApply(
              proto[getter] = (function ( key ) {
                return function ( ) {
                  return this[key];
                };
              })( key )
            );

            color[setter] = convertAndApply(
              proto[setter] = (function ( key ) {
                return function ( val ) {
                  var cloned = this.clone();
                  cloned[key] = val;
                  return cloned;
                };
              })( key )
            );
          }
        } // end of for over model

        // a method to create a new object - largely so prototype chains dont
        // get insane. This uses an unrolled 'object' so that F is cached
        // for later use. this is approx a 25% speed improvement
        function F () { }
        F.prototype = proto;
        function factory ( ) {
          return new F();
        }
        factories[name] = factory;

        proto.clone = function () {
          var cloned = factory();
          for (var i = 0, j = fields.length; i < j; i++) {
            var key = fields[i];
            cloned[key] = this[key];
          }
          return cloned;
        };

        color[to_meth] = function ( ) {
          return factory();
        };

        registered_models.push(proto);

        return proto;
      }// end of registerModel

      // Template Objects

      /* color is the root object in the color hierarchy. It starts
       * life as a very simple object, but as color models are
       * registered it has methods programmatically added to manage
       * conversions as needed.
       */
      color = {
        /* fromObject takes an argument and delegates to the internal
         * color models to try to create a new instance.
         */
        fromObject: function ( o ) {
          if (!o) {
            return object(color);
          }

          for (var i = 0, j = registered_models.length; i < j; i++) {
            var nu = registered_models[i].fromObject(o);
            if (nu) {
              return nu;
            }
          }

          return object(color);
        },

        toString: function ( ) {
          return this.toCSS();
        }
      };


      /* RGB is the red green blue model. This definition is converted
       * to a template object by registerModel.
       */
      registerModel('RGB', {
        red:    0,
        green:  0,
        blue:   0,

        /* getLuminance returns a value between 0 and 1, this is the
         * luminance calcuated according to
         * http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
         */
        getLuminance: function ( ) {
          return (this.red * 0.2126) + (this.green * 0.7152) + (this.blue * 0.0722);
        },

        /* does an alpha based blend of color onto this. alpha is the
         * amount of 'color' to use. (0 to 1)
         */
        blend: function ( color , alpha ) {
          color = color.toRGB();
          alpha = Math.min(Math.max(alpha, 0), 1);
          var rgb = this.clone();

          rgb.red = (rgb.red * (1 - alpha)) + (color.red * alpha);
          rgb.green = (rgb.green * (1 - alpha)) + (color.green * alpha);
          rgb.blue = (rgb.blue * (1 - alpha)) + (color.blue * alpha);

          return rgb;
        },

        /* fromObject attempts to convert an object o to and RGB
         * instance. This accepts an object with red, green and blue
         * members or a string. If the string is a known CSS color name
         * or a hexdecimal string it will accept it.
         */
        fromObject: function ( o ) {
          if ("string" == typeof o) {
            return this._fromCSS( trim( o ) );
          }
          if (o.hasOwnProperty('red') &&
              o.hasOwnProperty('green') &&
              o.hasOwnProperty('blue')) {
            return this._fromRGB ( o );
          }
          // nothing matchs, not an RGB object
        },

        _stringParsers: [
            // CSS RGB(A) literal:
            function ( css ) {
              css = trim(css);

              var withInteger = match(rgb_rgba_integer_regex, 255);
              if(withInteger) {
                return withInteger;
              }
              return match(rgb_rgba_percentage_regex, 100);

              function match(regex, max_value) {
                var colorGroups = css.match( regex );

                // If there is an "a" after "rgb", there must be a fourth parameter and the other way round
                if (!colorGroups || (!!colorGroups[1] + !!colorGroups[5] === 1)) {
                  return null;
                }

                var rgb = factories.RGB();
                rgb.red   = Math.min(1, Math.max(0, colorGroups[2] / max_value));
                rgb.green = Math.min(1, Math.max(0, colorGroups[3] / max_value));
                rgb.blue  = Math.min(1, Math.max(0, colorGroups[4] / max_value));

                return rgb;
              }
            },

            function ( css ) {
                var lower = css.toLowerCase();
                if (lower in css_colors) {
                  css = css_colors[lower];
                }

                if (!css.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)) {
                  return;
                }

                css = css.replace(/^#/,'');

                var bytes = css.length / 3;

                var max = Math.pow(16, bytes) - 1;

                var rgb = factories.RGB();
                rgb.red =   parseInt(css.slice(0, bytes), 16) / max;
                rgb.green = parseInt(css.slice(bytes * 1,bytes * 2), 16) / max;
                rgb.blue =  parseInt(css.slice(bytes * 2), 16) / max;
                return rgb;
            }
        ],

        _fromCSS: function ( css ) {
          var color = null;
          for (var i = 0, j = this._stringParsers.length; i < j; i++) {
              color = this._stringParsers[i](css);
              if (color) return color;
          }
        },

        _fromRGB: function ( RGB ) {
          var newRGB = factories.RGB();

          newRGB.red = RGB.red;
          newRGB.green = RGB.green;
          newRGB.blue = RGB.blue;

          return newRGB;
        },

        // convert to a CSS string. defaults to two bytes a value
        toCSS: function ( bytes ) {
          bytes = bytes || 2;
          var max = Math.pow(16, bytes) - 1;
          var css = [
            "#",
            pad ( Math.round(this.red * max).toString( 16 ).toUpperCase(), bytes ),
            pad ( Math.round(this.green * max).toString( 16 ).toUpperCase(), bytes ),
            pad ( Math.round(this.blue * max).toString( 16 ).toUpperCase(), bytes )
          ];

          return css.join('');
        },

        toHSV: function ( ) {
          var hsv = factories.HSV();
          var min, max, delta;

          min = Math.min(this.red, this.green, this.blue);
          max = Math.max(this.red, this.green, this.blue);
          hsv.value = max; // v

          delta = max - min;

          if( delta == 0 ) { // white, grey, black
            hsv.hue = hsv.saturation = 0;
          }
          else { // chroma
            hsv.saturation = delta / max;

            if( this.red == max ) {
              hsv.hue = ( this.green - this.blue ) / delta; // between yellow & magenta
            }
            else if( this.green  == max ) {
              hsv.hue = 2 + ( this.blue - this.red ) / delta; // between cyan & yellow
            }
            else {
              hsv.hue = 4 + ( this.red - this.green ) / delta; // between magenta & cyan
            }

            hsv.hue = ((hsv.hue * 60) + 360) % 360; // degrees
          }

          return hsv;
        },
        toHSL: function ( ) {
          return this.toHSV().toHSL();
        },

        toRGB: function ( ) {
          return this.clone();
        }
      });


      /* Like RGB above, this object describes what will become the HSV
       * template object. This model handles hue, saturation and value.
       * hue is the number of degrees around the color wheel, saturation
       * describes how much color their is and value is the brightness.
       */
      registerModel('HSV', {
        hue: 0,
        saturation: 0,
        value: 1,

        shiftHue: cloneOnApply(function ( degrees ) {
          var hue = (this.hue + degrees) % 360;
          if (hue < 0) {
            hue = (360 + hue) % 360;
          }

          this.hue = hue;
        }),

        devalueByAmount: cloneOnApply(function ( val ) {
          this.value = Math.min(1, Math.max(this.value - val, 0));
        }),

        devalueByRatio: cloneOnApply(function ( val ) {
          this.value = Math.min(1, Math.max(this.value * (1 - val), 0));
        }),

        valueByAmount: cloneOnApply(function ( val ) {
          this.value = Math.min(1, Math.max(this.value + val, 0));
        }),

        valueByRatio: cloneOnApply(function ( val ) {
          this.value = Math.min(1, Math.max(this.value * (1 + val), 0));
        }),

        desaturateByAmount: cloneOnApply(function ( val ) {
          this.saturation = Math.min(1, Math.max(this.saturation - val, 0));
        }),

        desaturateByRatio: cloneOnApply(function ( val ) {
          this.saturation = Math.min(1, Math.max(this.saturation * (1 - val), 0));
        }),

        saturateByAmount: cloneOnApply(function ( val ) {
          this.saturation = Math.min(1, Math.max(this.saturation + val, 0));
        }),

        saturateByRatio: cloneOnApply(function ( val ) {
          this.saturation = Math.min(1, Math.max(this.saturation * (1 + val), 0));
        }),

        schemeFromDegrees: function ( degrees ) {
          var newColors = [];
          for (var i = 0, j = degrees.length; i < j; i++) {
            var col = this.clone();
            col.hue = (this.hue + degrees[i]) % 360;
            newColors.push(col);
          }
          return newColors;
        },

        complementaryScheme: function ( ) {
          return this.schemeFromDegrees([0,180]);
        },

        splitComplementaryScheme: function ( ) {
          return this.schemeFromDegrees([0,150,320]);
        },

        splitComplementaryCWScheme: function ( ) {
          return this.schemeFromDegrees([0,150,300]);
        },

        splitComplementaryCCWScheme: function ( ) {
          return this.schemeFromDegrees([0,60,210]);
        },

        triadicScheme: function ( ) {
          return this.schemeFromDegrees([0,120,240]);
        },

        clashScheme: function ( ) {
          return this.schemeFromDegrees([0,90,270]);
        },

        tetradicScheme: function ( ) {
          return this.schemeFromDegrees([0,90,180,270]);
        },

        fourToneCWScheme: function ( ) {
          return this.schemeFromDegrees([0,60,180,240]);
        },

        fourToneCCWScheme: function ( ) {
          return this.schemeFromDegrees([0,120,180,300]);
        },

        fiveToneAScheme: function ( ) {
          return this.schemeFromDegrees([0,115,155,205,245]);
        },

        fiveToneBScheme: function ( ) {
          return this.schemeFromDegrees([0,40,90,130,245]);
        },

        fiveToneCScheme: function ( ) {
          return this.schemeFromDegrees([0,50,90,205,320]);
        },

        fiveToneDScheme: function ( ) {
          return this.schemeFromDegrees([0,40,155,270,310]);
        },

        fiveToneEScheme: function ( ) {
          return this.schemeFromDegrees([0,115,230,270,320]);
        },

        sixToneCWScheme: function ( ) {
          return this.schemeFromDegrees([0,30,120,150,240,270]);
        },

        sixToneCCWScheme: function ( ) {
          return this.schemeFromDegrees([0,90,120,210,240,330]);
        },

        neutralScheme: function ( ) {
          return this.schemeFromDegrees([0,15,30,45,60,75]);
        },

        analogousScheme: function ( ) {
          return this.schemeFromDegrees([0,30,60,90,120,150]);
        },

        fromObject: function ( o ) {
          if (o.hasOwnProperty('hue') &&
              o.hasOwnProperty('saturation') &&
              o.hasOwnProperty('value')) {
            var hsv = factories.HSV();

            hsv.hue = o.hue;
            hsv.saturation = o.saturation;
            hsv.value = o.value;

            return hsv;
          }
          // nothing matchs, not an HSV object
          return null;
        },

        _normalise: function ( ) {
           this.hue %= 360;
           this.saturation = Math.min(Math.max(0, this.saturation), 1);
           this.value = Math.min(Math.max(0, this.value));
        },

        toRGB: function ( ) {
          this._normalise();

          var rgb = factories.RGB();
          var i;
          var f, p, q, t;

          if( this.saturation === 0 ) {
            // achromatic (grey)
            rgb.red = this.value;
            rgb.green = this.value;
            rgb.blue = this.value;
            return rgb;
          }

          var h = this.hue / 60;            // sector 0 to 5
          i = Math.floor( h );
          f = h - i;            // factorial part of h
          p = this.value * ( 1 - this.saturation );
          q = this.value * ( 1 - this.saturation * f );
          t = this.value * ( 1 - this.saturation * ( 1 - f ) );

          switch( i ) {
            case 0:
              rgb.red = this.value;
              rgb.green = t;
              rgb.blue = p;
              break;
            case 1:
              rgb.red = q;
              rgb.green = this.value;
              rgb.blue = p;
              break;
            case 2:
              rgb.red = p;
              rgb.green = this.value;
              rgb.blue = t;
              break;
            case 3:
              rgb.red = p;
              rgb.green = q;
              rgb.blue = this.value;
              break;
            case 4:
              rgb.red = t;
              rgb.green = p;
              rgb.blue = this.value;
              break;
            default:        // case 5:
              rgb.red = this.value;
              rgb.green = p;
              rgb.blue = q;
              break;
          }

          return rgb;
        },
        toHSL: function() {
          this._normalise();

          var hsl = factories.HSL();

          hsl.hue = this.hue;
          var l = (2 - this.saturation) * this.value,
              s = this.saturation * this.value;
          if(l && 2 - l) {
            s /= (l <= 1) ? l : 2 - l;
          }
          l /= 2;
          hsl.saturation = s;
          hsl.lightness = l;

          return hsl;
        },

        toHSV: function ( ) {
          return this.clone();
        }
      });

      registerModel('HSL', {
        hue: 0,
        saturation: 0,
        lightness: 0,

        darkenByAmount: cloneOnApply(function ( val ) {
          this.lightness = Math.min(1, Math.max(this.lightness - val, 0));
        }),

        darkenByRatio: cloneOnApply(function ( val ) {
          this.lightness = Math.min(1, Math.max(this.lightness * (1 - val), 0));
        }),

        lightenByAmount: cloneOnApply(function ( val ) {
          this.lightness = Math.min(1, Math.max(this.lightness + val, 0));
        }),

        lightenByRatio: cloneOnApply(function ( val ) {
          this.lightness = Math.min(1, Math.max(this.lightness * (1 + val), 0));
        }),

        fromObject: function ( o ) {
          if ("string" == typeof o) {
            return this._fromCSS( o );
          }
          if (o.hasOwnProperty('hue') &&
              o.hasOwnProperty('saturation') &&
              o.hasOwnProperty('lightness')) {
            return this._fromHSL ( o );
          }
          // nothing matchs, not an RGB object
        },

        _fromCSS: function ( css ) {
          var colorGroups = trim( css ).match( hsl_hsla_regex );

          // if there is an "a" after "hsl", there must be a fourth parameter and the other way round
          if (!colorGroups || (!!colorGroups[1] + !!colorGroups[5] === 1)) {
            return null;
          }

          var hsl = factories.HSL();
          hsl.hue        = (colorGroups[2] % 360 + 360) % 360;
          hsl.saturation = Math.max(0, Math.min(parseInt(colorGroups[3], 10) / 100, 1));
          hsl.lightness  = Math.max(0, Math.min(parseInt(colorGroups[4], 10) / 100, 1));

          return hsl;
        },

        _fromHSL: function ( HSL ) {
          var newHSL = factories.HSL();

          newHSL.hue = HSL.hue;
          newHSL.saturation = HSL.saturation;
          newHSL.lightness = HSL.lightness;

          return newHSL;
        },

        _normalise: function ( ) {
           this.hue = (this.hue % 360 + 360) % 360;
           this.saturation = Math.min(Math.max(0, this.saturation), 1);
           this.lightness = Math.min(Math.max(0, this.lightness));
        },

        toHSL: function() {
          return this.clone();
        },
        toHSV: function() {
          this._normalise();

          var hsv = factories.HSV();

          // http://ariya.blogspot.com/2008/07/converting-between-hsl-and-hsv.html
          hsv.hue = this.hue; // H
          var l = 2 * this.lightness,
              s = this.saturation * ((l <= 1) ? l : 2 - l);
          hsv.value = (l + s) / 2; // V
          hsv.saturation = ((2 * s) / (l + s)) || 0; // S

          return hsv;
        },
        toRGB: function() {
          return this.toHSV().toRGB();
        }
      });

      // Package specific exports

      /* the Color function is a factory for new color objects.
       */
      function Color( o ) {
        return color.fromObject( o );
      }
      Color.isValid = function( str ) {
        var c = Color( str );

        var length = 0;
        for(key in c) {
          if(c.hasOwnProperty(key)) {
            length++;
          }
        }

        return length > 0;
      };
      net.brehaut.Color = Color;
    }).call(net.brehaut);

    /* Export to CommonJS
    */
    var module;
    if(module) {
      module.exports.Color = net.brehaut.Color;
    }

// bPopup - if you can't get it up, use bPopup

    /*================================================================================
     * @name: bPopup - if you can't get it up, use bPopup
     * @author: (c)Bjoern Klinggaard (twitter@bklinggaard)
     * @demo: http://dinbror.dk/bpopup
     * @version: 0.9.3.min
     ================================================================================*/
     (function(b){b.fn.bPopup=function(u,C){function v(){a.modal&&b('<div class="b-modal '+e+'"></div>').css({backgroundColor:a.modalColor,position:"fixed",top:0,right:0,bottom:0,left:0,opacity:0,zIndex:a.zIndex+l}).appendTo(a.appendTo).fadeTo(a.speed,a.opacity);z();c.data("bPopup",a).data("id",e).css({left:"slideIn"===a.transition?-1*(m+h):n(!(!a.follow[0]&&p||g)),position:a.positionStyle||"absolute",top:"slideDown"===a.transition?-1*(q+h):r(!(!a.follow[1]&&s||g)),"z-index":a.zIndex+l+1}).each(function(){a.appending&&b(this).appendTo(a.appendTo)});D(!0)}function t(){a.modal&&b(".b-modal."+c.data("id")).fadeTo(a.speed,0,function(){b(this).remove()});a.scrollBar||b("html").css("overflow","auto");b(".b-modal."+e).unbind("click");j.unbind("keydown."+e);d.unbind("."+e).data("bPopup",0<d.data("bPopup")-1?d.data("bPopup")-1:null);c.undelegate(".bClose, ."+a.closeClass,"click."+e,t).data("bPopup",null);D();return!1}function E(f){var b=f.width(),e=f.height(),d={};a.contentContainer.css({height:e,width:b});e>=c.height()&&(d.height=c.height());b>=c.width()&&(d.width=c.width());w=c.outerHeight(!0);h=c.outerWidth(!0);z();a.contentContainer.css({height:"auto",width:"auto"});d.left=n(!(!a.follow[0]&&p||g));d.top=r(!(!a.follow[1]&&s||g));c.animate(d,250,function(){f.show();x=A()})}function D(f){switch(a.transition){case "slideIn":c.css({display:"block",opacity:1}).animate({left:f?n(!(!a.follow[0]&&p||g)):j.scrollLeft()-(h||c.outerWidth(!0))-200},a.speed,a.easing,function(){B(f)});break;case "slideDown":c.css({display:"block",opacity:1}).animate({top:f?r(!(!a.follow[1]&&s||g)):j.scrollTop()-(w||c.outerHeight(!0))-200},a.speed,a.easing,function(){B(f)});break;default:c.stop().fadeTo(a.speed,f?1:0,function(){B(f)})}}function B(f){f?(d.data("bPopup",l),c.delegate(".bClose, ."+a.closeClass,"click."+e,t),a.modalClose&&b(".b-modal."+e).css("cursor","pointer").bind("click",t),!G&&(a.follow[0]||a.follow[1])&&d.bind("scroll."+e,function(){x&&c.dequeue().animate({left:a.follow[0]?n(!g):"auto",top:a.follow[1]?r(!g):"auto"},a.followSpeed,a.followEasing)}).bind("resize."+e,function(){if(x=A())clearTimeout(F),F=setTimeout(function(){z();c.dequeue().each(function(){g?b(this).css({left:m,top:q}):b(this).animate({left:a.follow[0]?n(!0):"auto",top:a.follow[1]?r(!0):"auto"},a.followSpeed,a.followEasing)})},50)}),a.escClose&&j.bind("keydown."+e,function(a){27==a.which&&t()}),k(C)):(c.hide(),k(a.onClose),a.loadUrl&&(a.contentContainer.empty(),c.css({height:"auto",width:"auto"})))}function n(a){return a?m+j.scrollLeft():m}function r(a){return a?q+j.scrollTop():q}function k(a){b.isFunction(a)&&a.call(c)}function z(){var b;s?b=a.position[1]:(b=((window.innerHeight||d.height())-c.outerHeight(!0))/2-a.amsl,b=b<y?y:b);q=b;m=p?a.position[0]:((window.innerWidth||d.width())-c.outerWidth(!0))/2;x=A()}function A(){return(window.innerHeight||d.height())>c.outerHeight(!0)+y&&(window.innerWidth||d.width())>c.outerWidth(!0)+y}b.isFunction(u)&&(C=u,u=null);var a=b.extend({},b.fn.bPopup.defaults,u);a.scrollBar||b("html").css("overflow","hidden");var c=this,j=b(document),d=b(window),G=/OS 6(_\d)+/i.test(navigator.userAgent),y=20,l=0,e,x,s,p,g,q,m,w,h,F;c.close=function(){a=this.data("bPopup");e="__b-popup"+d.data("bPopup")+"__";t()};return c.each(function(){if(!b(this).data("bPopup"))if(k(a.onOpen),l=(d.data("bPopup")||0)+1,e="__b-popup"+l+"__",s="auto"!==a.position[1],p="auto"!==a.position[0],g="fixed"===a.positionStyle,w=c.outerHeight(!0),h=c.outerWidth(!0),a.loadUrl)switch(a.contentContainer=b(a.contentContainer||c),a.content){case "iframe":var f=b('<iframe class="b-iframe" scrolling="no" frameborder="0"></iframe>');f.appendTo(a.contentContainer);w=c.outerHeight(!0);h=c.outerWidth(!0);v();f.attr("src",a.loadUrl);k(a.loadCallback);break;case "image":v();b("<img />").load(function(){k(a.loadCallback);E(b(this))}).attr("src",a.loadUrl).hide().appendTo(a.contentContainer);break;default:v(),b('<div class="b-ajax-wrapper"></div>').load(a.loadUrl,a.loadData,function(){k(a.loadCallback);E(b(this))}).hide().appendTo(a.contentContainer)}else v()})};b.fn.bPopup.defaults={amsl:50,appending:!0,appendTo:"body",closeClass:"b-close",content:"ajax",contentContainer:!1,easing:"swing",escClose:!0,follow:[!0,!0],followEasing:"swing",followSpeed:500,loadCallback:!1,loadData:!1,loadUrl:!1,modal:!0,modalClose:!0,modalColor:"#000",onClose:!1,onOpen:!1,opacity:0.7,position:["auto","auto"],positionStyle:"absolute",scrollBar:!0,speed:250,transition:"fadeIn",zIndex:9997}})(jQuery);

/*! sprintf.js
    | Copyright (c) 2007-2013 Alexandru Marasteanu <hello at alexei dot ro>
    | 3 clause BSD license */

  ;if( window.sprintf === undefined ) {
    (function(e){function r(e){return Object.prototype.toString.call(e).slice(8,-1).toLowerCase()}function i(e,t){for(var n=[];t>0;n[--t]=e);return n.join("")}var t=function(){return t.cache.hasOwnProperty(arguments[0])||(t.cache[arguments[0]]=t.parse(arguments[0])),t.format.call(null,t.cache[arguments[0]],arguments)};t.format=function(e,n){var s=1,o=e.length,u="",a,f=[],l,c,h,p,d,v;for(l=0;l<o;l++){u=r(e[l]);if(u==="string")f.push(e[l]);else if(u==="array"){h=e[l];if(h[2]){a=n[s];for(c=0;c<h[2].length;c++){if(!a.hasOwnProperty(h[2][c]))throw t('[sprintf] property "%s" does not exist',h[2][c]);a=a[h[2][c]]}}else h[1]?a=n[h[1]]:a=n[s++];if(/[^s]/.test(h[8])&&r(a)!="number")throw t("[sprintf] expecting number but found %s",r(a));switch(h[8]){case"b":a=a.toString(2);break;case"c":a=String.fromCharCode(a);break;case"d":a=parseInt(a,10);break;case"e":a=h[7]?a.toExponential(h[7]):a.toExponential();break;case"f":a=h[7]?parseFloat(a).toFixed(h[7]):parseFloat(a);break;case"o":a=a.toString(8);break;case"s":a=(a=String(a))&&h[7]?a.substring(0,h[7]):a;break;case"u":a>>>=0;break;case"x":a=a.toString(16);break;case"X":a=a.toString(16).toUpperCase()}a=/[def]/.test(h[8])&&h[3]&&a>=0?"+"+a:a,d=h[4]?h[4]=="0"?"0":h[4].charAt(1):" ",v=h[6]-String(a).length,p=h[6]?i(d,v):"",f.push(h[5]?a+p:p+a)}}return f.join("")},t.cache={},t.parse=function(e){var t=e,n=[],r=[],i=0;while(t){if((n=/^[^\x25]+/.exec(t))!==null)r.push(n[0]);else if((n=/^\x25{2}/.exec(t))!==null)r.push("%");else{if((n=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(t))===null)throw"[sprintf] huh?";if(n[2]){i|=1;var s=[],o=n[2],u=[];if((u=/^([a-z_][a-z_\d]*)/i.exec(o))===null)throw"[sprintf] huh?";s.push(u[1]);while((o=o.substring(u[0].length))!=="")if((u=/^\.([a-z_][a-z_\d]*)/i.exec(o))!==null)s.push(u[1]);else{if((u=/^\[(\d+)\]/.exec(o))===null)throw"[sprintf] huh?";s.push(u[1])}n[2]=s}else i|=2;if(i===3)throw"[sprintf] mixing positional and named placeholders is not (yet) supported";r.push(n)}t=t.substring(n[0].length)}return r};var n=function(e,n,r){return r=n.slice(0),r.splice(0,0,e),t.apply(null,r)};e.sprintf=t,e.vsprintf=n})(typeof exports!="undefined"?exports:window);
  };

;function getarg(_a, ia, def, returnArray) {
    var v = undefined

    // if ia is an array, find the
    // first correct definition
    if (ia.constructor  == Array) {
        for(var i=0; i<ia.length; i++) {
            if(_a[ia[i]] || _a[ia[i]] === false ){
                v = _a[ia[i]];
                break;
            }
        }
    }
    else {
        if(_a[ia] || _a[ia] === false ) v = _a[ia];
    }

    if( (v == null) && (def != undefined) ) {
        v = def
    }

    if(returnArray){
        return [v, ia[i]]
    }
    else
    {
        return v
    }

};

/*
Setting up a button can be done like:

// Just the text.
GravelButton('okay')

// text, color
GravelButton('okay', 'green')
GravelButton('cancel', '#808080')

// text, callback
GravelButton('okay', onClick)

// text, color, callback
GravelButton('okay', 'green', onClick)


GravelButton({
    value: 'okay',
    label: 'Button Text', // optional - Default 'value'
    color: '#FFEEDD',
    click: function(){}
})


 */
var GravelButton = function(){
    var it = IT.g;

    var __val, // Default values and setup
        label,
        Color           = net.brehaut.Color,
        defaultValue    = 'Okay',
        defaultId       = Math.random().toString(32).slice(2),
        defaultColor    = 'green',
        defaultCall     = undefined,
        defaultClasses  = 'flt-std'
        defaultPosition = 'left';


    // User passed values
    var value    = getarg(arguments, 0, defaultValue),     // GravelButton('okay')
        color    = getarg(arguments, 1, null),             // GravelButton('cancel', '#808080')
        callback = getarg(arguments, 2, null),             // GravelButton('okay', 'green', onClick)
        position = getarg(arguments, 3, defaultPosition),  // GravelButton('okay', 'green', onClick, 'left')
        _id      = getarg(arguments, 4, defaultId),        // GravelButton('okay', 'green', onClick, 'left', randomId)
        val      = value,
        classes  = defaultClasses;

    // Has the user passed an object instead of arguments
    if( it(value).is(Object) ) {
        __val    = value;
        val      = value.value    || defaultValue;
        color    = value.color    || defaultColor;
        callback = value.click    || defaultCall;
        label    = value.label    || value;
        position = value.position || position;
        _id      = value.id       || _id;
        classes  = value.classes  || defaultClasses;
    }

    // If a specific label has not been passed, used the give value
    if(!label) label = val.label || val.value || val.text || val;

    // GravelButton('okay', onClick)
    if( it(color).is(Function) ) {
        callback = color;
        color = 'green' // default color.
    }

    if( !callback ) {
        // auto mapping the close method.
        if(val == 'close') {
            // Gravel scope
            callback = function(){
                this.close();
            }
        } else {
            // debugger;
            // does nothing :)
            callback = defaultCall;
        }
    }

    if(!color) {
        color = defaultColor
    }

    // Scope used by the button.
    var pluginScope = {
        value:    value,
        color:    color,
        label:    label,
        classes:  classes,
        callback: callback,
        position: position,
        _Color:   Color,
        _id:      _id
    }

    var scope = (function(){
        var Color   = net.brehaut.Color,
            context = this;

        var hook = {
            type: 'GravelButton',
            context: context,

            text: function(){
                // get + set the text
                // Change the text on the button
                /*
                >>> b = GravelButton('ted')
                >>> b.text() // ted
                >>> 'ted'
                >>> b.text('bill')
                >>> b.text()
                >>> 'bill'
                >>> b.text(null)
                >>> b.text()
                >>> null
                 */
                var val = getarg(arguments, 0, undefined);

                if(val === undefined) {
                    // calc color.
                    return this._label || this.context.label;
                }

                this._label = val;
                return this;
            },

            getId: function(){
                return this.context._id;
            },

            buttonColor: function(){
                // get, set the color of the buttons.
                // Text color (.dark or .light) and border color will be automatically
                // altered to compensate.
                // Pass 'false' as a second argument to not do the updates.
                // You can alter backgroundColor() and borderColor()
                // seperately.
                var val = getarg(arguments, 0, undefined);

                if(val === undefined) {
                    // calc color.
                    return this.backgroundColor()
                }

                this.backgroundColor(val);

                var Color = this.context._Color;
                var _bc = this.calculateBorderColor(val)

                if(!this._borderColor) {
                    this.borderColor(_bc);
                }

                this.textColor( (this._textColor || null) )
                //Determine borderColor based upon the new backgroundColor;
            },

            calculateBorderColor: function(){
                var val = getarg(arguments, 0, this.backgroundColor());
                return Color(val).darkenByAmount(.2).toString();
            },

            borderColor: function(){
                // change the borderColor to the user defined.
                // Passing 'null' will reset the button to auto set the border
                // color
                /*
                >>> s=GravelButton('bob')
                >>> // Change the background only
                >>> s.backgroundColor('red')

                >>> // check they are the same before change
                >>> (s.backgroundColor() == s.borderColor())

                >>> // Change the border only
                >>> s.borderColor('blue')

                >>> (s.borderColor() != s.backgroundColor() )
                >>> s.borderColor(null)
                >>> (s.borderColor() == s.backgroundColor() )
                 */
                var val = getarg(arguments, 0, undefined);

                if(val === undefined) {

                    return this._borderColor || this.calculateBorderColor( this.backgroundColor() );
                }

                this._borderColor = val;

                // visual elements exist, apply live.
                if(this.element) {
                    // save into the data attribute
                    this.element.data('bordercolor', val);
                    // Change text color
                    this.element.css('border-color', val)
                }


                return this;
            },

            backgroundColor: function(){
                // Change the background color of the button without affecting
                // text color or border color.
                /*
                >>> b = GravelButton('ted')
                >>> b.backgroundColor() // ted
                >>> 'green'
                >>> b.backgroundColor('red')
                >>> b.backgroundColor()
                >>> 'red'
                >>> b.backgroundColor(null)
                >>> b.backgroundColor()
                >>> 'green'
                */
                var val = getarg(arguments, 0, undefined);

                if(val === undefined) {
                    return this._backgroundColor || this.context.color;
                }

                this._backgroundColor = val;

                // visual elements exist, apply live.
                if(this.element) {
                    // save into the data attribute
                    this.element.data('color', val);
                    // Change text color
                    this.element.css('background-color', val)
                }

                return this;
            },

            textColor: function(){
                // Change the color of the text. Set 'null' for the
                // button to do this automatically based on the backgroundColor state
                // set 'false' to remove this feature; to be handled by CSS
                // styles alone.
                var val = getarg(arguments, 0, undefined);
                var cl = this.getTextColorClass();
                var clc = ( (cl=='dark')? 'black': 'white' );

                // Nothing passed, return current color
                if(val === undefined) return this._textColor || clc;

                // Reset - apply calculated value instead.
                // if(val == null) val = clc;

                this._textColor = val;

                // visual elements exist, apply live.
                if(this.element) {
                    // save into the data attribute
                    this.element.data('textcolor', clc);
                    // Change text color
                    this.element.css('color', clc)
                }

                return this;
            },

            click: function() {
                /*
                Provide a new click function by passing a new click method
                this.click(function(){}) // return this
                this.click(e, ... )      // calls event
                this.click()            // return click function
                 */

                var val = getarg(arguments, 0, undefined);
                if(val === undefined) {
                    // nothing passed
                    return this._click = this.context.callback;
                } else if(val.type == 'click'){
                    // new click handler
                    var callFunc = this._click || this.context.callback;
                    if(callFunc === undefined) {
                      if( this.context.value.click) {
                        callFunc = this.context.value.click;
                      }
                    }
                    return callFunc.apply(this, arguments);
                }

                this._click = val;

                return this;
            },

            position: function(){
                /*
                The position is applied via css attribute 'left' or 'right'.
                By default this is left.
                */

                var val = getarg(arguments, 0, undefined)
                if(val === undefined) {
                    // calc color.
                    return this._position || this.context.position
                }

                this._position = val;
                return this;
            },

            html: function(){
                /*
                Return dom ready HTML
                 */
                var _col = this.backgroundColor(),
                    _tc  = this.textColor(),
                    _bc  = this.borderColor(),
                    _tx  = this.text(),
                    _pos = this.position(),
                    _con = this.getTextColorClass(),
                    _cls = this.getUserClass()

                  this.element = $('<input/>', {
                        id: this.getId(),
                        'data-color':      _col,
                        'data-borderColor': _bc,
                        'data-textColor':   _tc,
                        'name':            'gravel_'  + this.context.value,
                        'value':           (_tx.label !== undefined)? _tx.label: _tx,
                        'class':           'gravel-button ' + _pos + ' ' + _con + ' ' + _cls,
                        'type':            'button'
                    })

                this.buttonColor(_col)
                this.element.data('GravelButton', this)
                // border color
                this.element.css('border-color', this.element.data('bordercolor'))
                this.element.css('background-color', this.element.data('color'))
                this.element.css('color', this.element.data('textcolor'))

                // click handler
                var self = this;
                this.render(this.element)
                return this.element
            },

            render: function(element) {
                if(__val && __val.render !== undefined) {
                  __val.render.apply(this, element)
                }
            },

            renderButtons: function(){
                for (var i = 0; i < this.__renderButtons.length; i++) {
                    if(this.__renderButtons[i].type == 'GravelButton') {
                        this.__renderButtons[i].render('#' + this.__renderButtons[i].__placeholder, true);
                    }
                };
            },

            getContrastYIQ: function(r,g,b){

                var a = arguments;
                var yiq = ((r*299)+(g*587)+(b*114)) / 1000;
                return (yiq >= .5) ? 'dark' : 'light';
            },

            getUserClass: function(){
              return this.context.classes

            },

            // Correct color button text.
            getTextColorClass: function(){
                // return 'dark', 'light' responding the current background color
                var _color = this.context._Color(
                        getarg(arguments, 0, this.backgroundColor() )
                    );
                return this.getContrastYIQ(_color.red, _color.green, _color.blue);
            },
        };
        return hook;
    }).apply(pluginScope)

    return scope;
};

(function($) {
    var it = IT.g;

    // here we go!
    $.gravel = function(element, options) {

        // plugin's default options
        // this is private
        var defaults = {
            amsl              : 50,
            appendTo          : 'body',
            appending         : true,
            closeClass        : 'gravel-close',
            content           : 'ajax', // 'ajax', 'iframe', 'xlink', 'image'
            contentContainer  : false,
            easing            : 'swing', //'swing', 'linear',
            escClose          : true,
            defaultModalColor : '#FFF',
            follow            : [true,true],
            followEasing      : 'swing', //'swing', 'linear'
            followSpeed       : 500,
            loadData          : false,
            loadUrl           : false,
            modal             : true,
            modalClose        : true,
            modalColor        : '#FFF',
            opacity           : 0.7,
            position          : ['auto','auto'], //'auto' = center, ['horizontal', 'vertical']
            positionStyle     : 'absolute',
            scrollBar         : true,
            speed             : 250,
            transition        : 'fadeIn', //['fadeIn', 'slideDown', 'slideIn']
            zIndex            : 9999,
            theme             : '', // '', 'flat', 'dark'
            containerClass    : 'gravel-container',
            lockHeight        : true,
            onLoad            : function(){
                console.log("Default on load called")
            }, // Event fires after the popup has loaded.Usage

            loadCallback      : function(){
                console.log("Default loadCallback called")
            }, //Callback for loadUrl, triggers when the loadUrl is loaded
            onOpen            : function(){
                console.log("Default onOpen called")
                if(options.onShow != undefined) {
                    var self = this;
                    window.setTimeout(function(){
                        options.onShow.apply(plugin, [self])
                    }, 50)

                };
            }, //Event fires before the popup opens.Usage
            onClose           : function(){
                plugin.close()
            }, // Event fires after the popup closes.Usage
            onShow          : function(element){
                // popup is displayed content provided can manipulate the view
                // this in the context of the plugin class.
                console.log('Default show called', this, element)
            },
            buttonClass: '', // Custom button class
            titleClass: 'title',
            bodyClass: 'content',
            closeIcon: '&#215;',
            title: 'Information',
            bodyHtml: 'This is a gravel popup',
            buttons: ['okay'],
            lock: false,
            // The class to add to Gravel to perform
            // visual locking.
            lockClass: 'lock'
        };

        // current instance of the object
        var plugin = this;

        // this will hold the merged default, and user-provided options
        // plugin's properties will be available through this object like:
        // plugin.settings.propertyName from inside the plugin or
        // element.data('gravel').settings.propertyName from outside the plugin,
        // where "element" is the element the plugin is attached to;
        plugin.settings = {}

        var $element = $(element), // reference to the jQuery version of DOM element
             element = element;    // reference to the actual DOM element

        plugin.init = function() {
            /*
            $('.config-template').gravel('title')

            $.gravel('.config-template', 'title')

            $('#selector').gravel()
            $('#selector').gravel(title)
            $('#selector').gravel(title, buttons)
            $('#selector').gravel({})
           */
            plugin.settings = $.extend({}, defaults, options);

            if( arguments[1] ) {
                // title
                if( typeof(arguments[1]) == 'string' ) {
                    plugin.settings.title = arguments[1];
                }
            }

            plugin.show()

            return plugin
        }

        plugin.htmlClose = function() {
            return '<div class="gravel-close">%(closeIcon)s</div>';
        }

        plugin.htmlTitle = function(text, $element){
            /*
            Return the HTML for the title object
             */
            if(text == undefined) {
                // find in element.
                if( $element ) {
                    text = $element.find('.gravel-title').text();

                    if( text == undefined ) {
                        text = $element.attr('title')
                    };
                };

                text = text || plugin.settings.title;
            };

            return '<h2 class="gravel-title %(titleClass)s">' + text + '</h2>';
        }

        plugin.htmlBody = function(html, $element) {
            /*
            Return the HTML body
             */
            html = html || $element.html() || plugin.settings.bodyHtml;
            return '<div class="gravel-body %(bodyClass)s">' + html + '</div>'
        }

        plugin.getElements = function(){
            return $(element);
        }

        plugin.$buttons = function(html){
               /*
            Return the HTML body
             */
            html = html || plugin.buttons();
            if(html) {
                var gb = $('<div/>', {
                    'class': 'gravel-buttons'
                });

                $(html).each(function(){
                  gb.append( this.html() )
                });

                return gb;
            }
            return ''
        }

        plugin.title = function(value){
            return plugin._popup.find('.gravel-title').text(value);
        }

        plugin.buttons = function(){

            var buttons = [];

            var closeMethod = function(){
                plugin.close()
            };

            //if(plugin._buttons) return plugin._buttons;
            for (var i = 0; i < plugin.settings.buttons.length; i++) {
                var buttonData  = plugin.settings.buttons[i];

                if(buttonData.type == 'GravelButton') {
                    buttons.push(buttonData);
                    continue
                };

                var value       = buttonData.value     || ((typeof(buttonData) != 'string')?    buttonData[0]: buttonData);
                var color       = buttonData.color     || ((typeof(buttonData[1]) == 'string')? buttonData[1]: null);
                var cb          = buttonData.callback  || undefined;

                if( !cb ) {
                    if( buttonData[2] && it(buttonData[2]).is(Function) ) {
                        cb = buttonData[2]
                    } else if( buttonData[1] && it(buttonData[1]).is(Function) ) {
                        cb = buttonData[1]
                    } else {
                        cb = closeMethod;
                    }
                }

                var button      = new GravelButton({
                    value:      value,
                    color:      color,
                    label:      buttonData.label || value,
                    click:      cb,
                    position:   buttonData.position,
                    id:         buttonData.id,
                    classes:    buttonData.classes,
                    data:       buttonData
                });

                buttons.push(button);
            };

            plugin._buttons=buttons;

            buttons.toString = function(){
              return buttons;
            }

            return buttons;
        }

        plugin.render = function(html, options){
            return sprintf(html, options);
        }

        plugin.popup = function(){
            var template = plugin.html();

            template.width( template.find('.gravel-body').children().width() );
            if( plugin.settings.lockHeight == true ) {
                template.height( template.height() );
            }

            if( plugin.settings.theme && plugin.settings.modalColor == plugin.settings.defaultModalColor ) {
                  plugin.settings.modalColor = template.css('backgroundColor')
            }

            plugin._popup     = template.bPopup(plugin.settings, function(){});
            plugin._popupData = plugin._popup.data('bPopup');

            return template;
        }


        plugin.html = function(){

            var $element  = plugin.getElements();
                body      = plugin.htmlBody(undefined, $element),
                title     = plugin.htmlTitle(undefined, $element),
                close     = plugin.htmlClose(),
                buttons   = plugin.$buttons(),
                content   = close + title + body,
                html      = this.render(content, plugin.settings),
                $template = plugin.getTemplate();

            // replace the holding instance of '%(html)s' with the data
            // to be implemented into the popup
            var _popup    = plugin.render( $template.text(), {
                html: html
            });

            $template.html(_popup).appendTo('body');
            $template.append(buttons);

            $template.on('click', '.gravel-buttons input', function(ev){
                  var gb = $(this).data('GravelButton')
                  if(gb.close === undefined) {
                      gb.close = plugin.close
                  }

                  try{
                    gb.click(ev);
                  } catch(e) {
                    // call the default callback
                    plugin.buttonError.apply(gb, [e, ev])
                  }
            })

            return $template;
        }

        /**
         * Receive an error in the scope of the button
         * causing the error.
         *
         * @param  {Error} error Error produced by the browser
         */
        plugin.buttonError = function(error, event) {
          // The scope of this method is the button
          // producing the error.
          // `error` object is the JS native.
          // `event` may be null
          console.error(error.stack || error)
          plugin.close(this, error);
        };

        plugin.getTemplate = function(){
            /**
             * Return the interface element for the gravel popup.
             * The element '.gravel-template' will be fetched from the DOM.
             * If the element does not exist, a new `div.gravel-template` is added to the body.
             */

            $t = $('.gravel-template');
            if( $t.length <= 0) {
                $t = $('<div/>', {
                        'class': "gravel " + plugin.settings.theme + plugin.settings.containerClass,
                        text: '%(html)s'
                }).appendTo('body');

                plugin._tempTemplate = $t;
            }

            return $t;
        };

        /*
        Lock the gravel popup to ensure it sticks to the view
        without affecting or being affected by the scroll.
        the popup will need to `unlock` before reflow can be
        performed.
         */
        plugin.lock = function(v){
            if(v !== undefined) {
              plugin.settings.lock = v;
              return this;
            }

            return plugin.settings.lock;

        }

        plugin.currentPosition = function($el){
            if($el === undefined) $el = plugin._popup;
            return ( ( window.innerHeight - $el.height() ) * .44 ) + window.scrollY;
        };

        plugin.reflow = function() {
            /*
             reapply the height and re-centre
             */
            plugin._popup.css('height', '');
            var top = plugin.currentPosition(plugin._popup);
            plugin._popup.css('top', top + 'px');
            return plugin._popup;
        }

        // a public method. for demonstration purposes only - remove it!
        plugin.show = function() {
            // get the current object or make a new one.
            ready = false;


            if( !ready ) {
                plugin.popup()
            } else {
                plugin.popup().removeClass('hidden');
            }

            if( this.lock() ) {
                plugin.performLock()
            }

            return plugin
        }

        plugin.performLock = function(){

            if( plugin._popup !== undefined) {
                var top = plugin.currentPosition(plugin._popup); //parseInt( plugin._popup.css('top') ) // - window.scrollY;
                plugin._popup.addClass('lock')
                plugin._popupData.follow = [false, false]
                plugin._popup.css('top', top + 'px')
            }

            $(window).scroll(function(){
                var top = plugin.currentPosition(plugin._popup)
                plugin._popup.css('top', top + 'px')
            })
        }

        plugin.performUnlock = function(){
          if( plugin._popup !== undefined) {
                plugin._popup.removeClass('lock');
          };
        }

        plugin.hide = function() {
            // code goes here
            // debugger;
            // plugin.popup().addClass('hidden');
            return plugin
        }

        plugin.close = function(){
            plugin.hide();
            plugin.destroy();
        }

        plugin.destroy = function(){
          var popup = plugin._popup.data('bPopup');
          if(popup) {
              $('.' + popup.closeClass ).click();
          }

          if( plugin._tempTemplate) {
              plugin._tempTemplate.remove()
          };

          $(element).data('gravel', null)
        }

        return plugin.init.apply(this, arguments);
    }

    // add the plugin to the jQuery.fn object
    $.fn.gravel = function(options) {

        // iterate through the DOM elements we are attaching the plugin to
        return this.each(function() {

            // if plugin has not already been attached to the element
            if (undefined == $(this).data('gravel')) {

                // create a new instance of the plugin
                // pass the DOM element and the user-provided options as arguments
                var plugin = new $.gravel(this, options);

                // in the jQuery version of the element
                // store a reference to the plugin object
                // you can later access the plugin and its methods and properties like
                // element.data('gravel').publicMethod(arg1, arg2, ... argn) or
                // element.data('gravel').settings.propertyName
                $(this).data('gravel', plugin);
            }

        });

    }

})(jQuery);
