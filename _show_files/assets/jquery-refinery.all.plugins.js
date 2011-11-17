/*!
 * jQuery corner plugin: simple corner rounding
 * Examples and documentation at: http://jquery.malsup.com/corner/
 * version 2.11 (15-JUN-2010)
 * Requires jQuery v1.3.2 or later
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Authors: Dave Methvin and Mike Alsup
 */

/**
 *	corner() takes a single string argument:	$('#myDiv').corner("effect corners width")
 *
 *	effect:	name of the effect to apply, such as round, bevel, notch, bite, etc (default is round).
 *	corners: one or more of: top, bottom, tr, tl, br, or bl.	(default is all corners)
 *	width:	 width of the effect; in the case of rounded corners this is the radius.
 *			 specify this value using the px suffix such as 10px (yes, it must be pixels).
 */
; (function($) {

	var style = document.createElement('div').style;
	var moz = style['MozBorderRadius'] !== undefined;
	var webkit = style['WebkitBorderRadius'] !== undefined;
	var radius = style['borderRadius'] !== undefined || style['BorderRadius'] !== undefined;
	var mode = document.documentMode || 0;
	var noBottomFold = $.browser.msie && (($.browser.version < 8 && !mode) || mode < 8);

	$.support = $.support || {};
	$.support.borderRadius = moz || webkit || radius;
	// so you can do:	if (!$.support.borderRadius) $('#myDiv').corner();
	var expr = $.browser.msie && (function() {
		var div = document.createElement('div');
		try {
			div.style.setExpression('width', '0+0');
			div.style.removeExpression('width');
		}
		catch(e) {
			return false;
		}
		return true;
	})();

	function sz(el, p) {
		return parseInt($.css(el, p)) || 0;
	};
	function hex2(s) {
		var s = parseInt(s).toString(16);
		return (s.length < 2) ? '0' + s: s;
	};
	function gpc(node) {
		while (node) {
			var v = $.css(node, 'backgroundColor');
			if (v && v != 'transparent' && v != 'rgba(0, 0, 0, 0)') {
				if (v.indexOf('rgb') >= 0) {
					var rgb = v.match(/\d+/g);
					return '#' + hex2(rgb[0]) + hex2(rgb[1]) + hex2(rgb[2]);
				}
				return v;
			}
			if (node.nodeName.toLowerCase() == 'html')
			break;
			node = node.parentNode;
			// keep walking if transparent
		}
		return '#ffffff';
	};

	function getWidth(fx, i, width) {
		switch (fx) {
		case 'round':
			return Math.round(width * (1 - Math.cos(Math.asin(i / width))));
		case 'cool':
			return Math.round(width * (1 + Math.cos(Math.asin(i / width))));
		case 'sharp':
			return Math.round(width * (1 - Math.cos(Math.acos(i / width))));
		case 'bite':
			return Math.round(width * (Math.cos(Math.asin((width - i - 1) / width))));
		case 'slide':
			return Math.round(width * (Math.atan2(i, width / i)));
		case 'jut':
			return Math.round(width * (Math.atan2(width, (width - i - 1))));
		case 'curl':
			return Math.round(width * (Math.atan(i)));
		case 'tear':
			return Math.round(width * (Math.cos(i)));
		case 'wicked':
			return Math.round(width * (Math.tan(i)));
		case 'long':
			return Math.round(width * (Math.sqrt(i)));
		case 'sculpt':
			return Math.round(width * (Math.log((width - i - 1), width)));
		case 'dogfold':
		case 'dog':
			return (i & 1) ? (i + 1) : width;
		case 'dog2':
			return (i & 2) ? (i + 1) : width;
		case 'dog3':
			return (i & 3) ? (i + 1) : width;
		case 'fray':
			return (i % 2) * width;
		case 'notch':
			return width;
		case 'bevelfold':
		case 'bevel':
			return i + 1;
		}
	};

	$.fn.corner = function(options) {
		// in 1.3+ we can fix mistakes with the ready state
		var elements = this;
		// help IE *yet again*.
		if ($.browser.msie && $.browser.version < 9) {
		  elements = elements.not('input, .button');
		  /*
			(inputs = elements.find('input.button')).removeClass('button');
			elements = elements.not('input');
			inputs.each(function() {
				wrapper = $("<span></span>").addClass($(this).className).addClass('button-wrapper');
				wrapper.insertBefore($(this));
				wrapper.append($(this));
			});
			elements = elements.add($('span.button-wrapper'));
			*/
		}

		if (elements.length == 0) {
			if (!$.isReady && this.selector) {
				var s = this.selector,
				c = this.context;
				$(function() {
					$(s, c).corner(options);
				});
			}
			return this;
		}

		return elements.each(function(index) {
			var $this = $(this);
			// meta values override options
			var o = [$this.attr($.fn.corner.defaults.metaAttr) || '', options || ''].join(' ').toLowerCase();
			var keep = /keep/.test(o);
			// keep borders?
			var cc = ((o.match(/cc:(#[0-9a-f]+)/) || [])[1]);
			// corner color
			var sc = ((o.match(/sc:(#[0-9a-f]+)/) || [])[1]);
			// strip color
			var width = parseInt((o.match(/(\d+)px/) || [])[1]) || 10;
			// corner width
			var re = /round|bevelfold|bevel|notch|bite|cool|sharp|slide|jut|curl|tear|fray|wicked|sculpt|long|dog3|dog2|dogfold|dog/;
			var fx = ((o.match(re) || ['round'])[0]);
			var fold = /dogfold|bevelfold/.test(o);
			var edges = {
				T: 0,
				B: 1
			};
			var opts = {
				TL: /top|tl|left/.test(o),
				TR: /top|tr|right/.test(o),
				BL: /bottom|bl|left/.test(o),
				BR: /bottom|br|right/.test(o)
			};
			if (!opts.TL && !opts.TR && !opts.BL && !opts.BR)
			opts = {
				TL: 1,
				TR: 1,
				BL: 1,
				BR: 1
			};

			// support native rounding
			if ($.fn.corner.defaults.useNative && fx == 'round' && (radius || moz || webkit) && !cc && !sc) {
				if (opts.TL) {
					$this.css(radius ? 'border-top-left-radius': moz ? '-moz-border-radius-topleft': '-webkit-border-top-left-radius', width + 'px');
				}
				if (opts.TR) {
					$this.css(radius ? 'border-top-right-radius': moz ? '-moz-border-radius-topright': '-webkit-border-top-right-radius', width + 'px');
				}
				if (opts.BL) {
					$this.css(radius ? 'border-bottom-left-radius': moz ? '-moz-border-radius-bottomleft': '-webkit-border-bottom-left-radius', width + 'px');
				}
				if (opts.BR) {
					$this.css(radius ? 'border-bottom-right-radius': moz ? '-moz-border-radius-bottomright': '-webkit-border-bottom-right-radius', width + 'px');
				}
				return;
			}

			var strip = document.createElement('div');
			$(strip).css({
				overflow: 'hidden',
				height: '1px',
				minHeight: '1px',
				fontSize: '1px',
				backgroundColor: sc || 'transparent',
				borderStyle: 'solid'
			});

			var pad = {
				T: parseInt($.css(this, 'paddingTop')) || 0,
				R: parseInt($.css(this, 'paddingRight')) || 0,
				B: parseInt($.css(this, 'paddingBottom')) || 0,
				L: parseInt($.css(this, 'paddingLeft')) || 0
			};

			if (typeof this.style.zoom != undefined) this.style.zoom = 1;
			// force 'hasLayout' in IE
			// TODO: IE is losing its border in some cases though still rounding it, investigate.
			if (!keep) this.style.border = 'none';
			strip.style.borderColor = cc || gpc(this.parentNode);
			var cssHeight = $(this).outerHeight();

			for (var j in edges) {
				var bot = edges[j];
				// only add stips if needed
				if ((bot && (opts.BL || opts.BR)) || (!bot && (opts.TL || opts.TR))) {
					strip.style.borderStyle = 'none ' + (opts[j + 'R'] ? 'solid': 'none') + ' none ' + (opts[j + 'L'] ? 'solid': 'none');
					var d = document.createElement('div');
					$(d).addClass('jquery-corner');
					var ds = d.style;

					// IE always trips up here and breaks rendering elsewhere, so suppress.
					try {
						bot ? this.appendChild(d) : this.insertBefore(d, this.firstChild);
					}
					catch(a){
						// don't really care.
					}

					if (bot && cssHeight != 'auto') {
						if ($.css(this, 'position') == 'static')
						this.style.position = 'relative';
						ds.position = 'absolute';
						ds.bottom = ds.left = ds.padding = ds.margin = '0';
						if (expr)
						ds.setExpression('width', 'this.parentNode.offsetWidth');
						else
						ds.width = '100%';
					}
					else if (!bot && $.browser.msie) {
						if ($.css(this, 'position') == 'static')
						this.style.position = 'relative';
						ds.position = 'absolute';
						ds.top = ds.left = ds.right = ds.padding = ds.margin = '0';

						// fix ie6 problem when blocked element has a border width
						if (expr) {
							var bw = sz(this, 'borderLeftWidth') + sz(this, 'borderRightWidth');
							ds.setExpression('width', 'this.parentNode.offsetWidth - ' + bw + '+ "px"');
						}
						else
						ds.width = '100%';
					}
					else {
						ds.position = 'relative';
						ds.margin = !bot ? '-' + pad.T + 'px -' + pad.R + 'px ' + (pad.T - width) + 'px -' + pad.L + 'px':
						(pad.B - width) + 'px -' + pad.R + 'px -' + pad.B + 'px -' + pad.L + 'px';
					}

					for (var i = 0; i < width; i++) {
						var w = Math.max(0, getWidth(fx, i, width));
						var e = strip.cloneNode(false);
						e.style.borderWidth = '0 ' + (opts[j + 'R'] ? w: 0) + 'px 0 ' + (opts[j + 'L'] ? w: 0) + 'px';
						bot ? d.appendChild(e) : d.insertBefore(e, d.firstChild);
					}

					if (fold && $.support.boxModel) {
						if (bot && noBottomFold) continue;
						for (var c in opts) {
							if (!opts[c]) continue;
							if (bot && (c == 'TL' || c == 'TR')) continue;
							if (!bot && (c == 'BL' || c == 'BR')) continue;

							var common = {
								position: 'absolute',
								border: 'none',
								margin: 0,
								padding: 0,
								overflow: 'hidden',
								backgroundColor: strip.style.borderColor
							};
							var $horz = $('<div/>').css(common).css({
								width: width + 'px',
								height: '1px'
							});
							switch (c) {
							case 'TL':
								$horz.css({bottom: 0, left: 0});
								break;
							case 'TR':
								$horz.css({bottom: 0, right: 0});
								break;
							case 'BL':
								$horz.css({top: 0, left: 0});
								break;
							case 'BR':
								$horz.css({top: 0, right: 0});
								break;
							}
							d.appendChild($horz[0]);

							var $vert = $('<div/>').css(common).css({
								top: 0,
								bottom: 0,
								width: '1px',
								height: width + 'px'
							});
							switch (c) {
							case 'TL':
								$vert.css({left: width});
								break;
							case 'TR':
								$vert.css({right: width});
								break;
							case 'BL':
								$vert.css({left: width});
								break;
							case 'BR':
								$vert.css({right: width});
								break;
							}
							d.appendChild($vert[0]);
						}
					}
				}
			}
		});
	};

	$.fn.uncorner = function() {
		if (radius || moz || webkit)
		this.css(radius ? 'border-radius': moz ? '-moz-border-radius': '-webkit-border-radius', 0);
		$('div.jquery-corner', this).remove();
		return this;
	};

	// expose options
	$.fn.corner.defaults = {
		useNative: true,
		// true if plugin should attempt to use native browser support for border radius rounding
		metaAttr: 'data-corner'
		// name of meta attribute to use for options
	};

})(jQuery);

{ // a dummy block, so I can collapse all the meta stuff in the editor
/****************************************************************************
 * jQuery 1.3.x plugin to shorten styled text to fit in a block, appending
 * an ellipsis ("...", &hellip;, Unicode: 2026) or other text.
 * (Only supports ltr text for now.)
 *
 * This is achieved by placing the text of the 'selected' element (eg. span or
 * div) inside a table and measuring its width. If it's too big to big to fit in
 * the element's parent block it's shortened and measured again until it (and
 * appended ellipsis or text) fits inside the block. A tooltip on the 'selected'
 * element displays the full original text.
 *
 * If the browser supports truncating text using the 'text-overflow:ellipsis'
 * CSS property then that will be used (if the text to append is the default
 * ellipsis).
 *
 * If the text is truncated by the plugin any markup in the text will be
 * stripped (eg: "<a" starts stripping, "< a" does not). This behaviour is
 * dictated by the jQuery .text(val) method.
 * The appended text may contain HTML however (a link or span for example).
 *
 * Usage Example ('selecting' a div with an id of "element"):

	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
	<script type="text/javascript" src="javascripts/jquery.textTruncate.js"></script>
	<script type="text/javascript">
		$(function() {
			$("#element").textTruncate();
		});
	</script>

 * By default the plugin will use the parent block's width as maximum width and
 * an ellipsis as appended text when truncating.
 *
 * There are three ways of configuring the plugin:
 *
 * 1) Passing a configuration hash as the plugin's argument, eg:

	.textTruncate({
		width: 300,
		tail: ' <a href="#">more</a>',
		tooltip: false
	});

 * 2) Using two optional arguments (deprecated!):
 * width = the desired pixel width, integer
 * tail = text/html to append when truncating
 *
 * 3) By changing the plugin defaults, eg:

	$.fn.textTruncate.defaults.tail = ' <a href="#">more</a>';

 * Note: there is no default width (unless you create one).
 *
 * You may want to set the element's css to {visibility:hidden;} so it won't
 * initially flash at full width.
 *
 *
 * Created by M. David Green (www.mdavidgreen.com) in 2009. Free to use for
 * personal or commercial purposes under MIT (X11) license with no warranty
 *
 * Heavily modified/simplified/improved by Marc Diethelm (http://web5.me/).
 *
****************************************************************************/
}


(function ($) {

	$.fn.textTruncate = function() {

		var userOptions = {};
		var args = arguments; // for better minification
		var func = args.callee // dito; and much shorter than $.fn.textTruncate

		if ( args.length ) {

			if ( args[0].constructor == Object ) {
				userOptions = args[0];
			} else if ( args[0] == "options" ) {
				return $(this).eq(0).data("options-truncate");
			} else {
				userOptions = {
					width: parseInt(args[0]),
					tail: args[1]
				}
			}
		}

		this.css("visibility","hidden"); // Hide the element(s) while manipulating them

		// apply options vs. defaults
		var options = $.extend({}, func.defaults, userOptions);


		/**
		 * HERE WE GO!
		 **/
		return this.each(function () {

			var $this = $(this);
			$this.data("options-truncate", options);

			/**
			 * If browser implements text-overflow:ellipsis in CSS and tail is "...", use it!
			 **/
			if ( options.tail == "..." && func._native ) {

				this.style[func._native] = "ellipsis";
				/*var css_obj = {}
				css_obj[func._native] = "ellipsis";
				$this.css(css_obj);*/
				$this.css("visibility","visible");

				return true;
			}

			var width = options.width || $this.parent().width();

			var text = $this.text();
			var textlength = text.length;
			var css = "padding:0; margin:0; border:none; font:inherit;";
			var $table = $('<table style="'+ css +'width:auto;zoom:1;position:absolute;"><tr style="'+ css +'"><td style="'+ css +'white-space:nowrap;">' + options.tail + '</td></tr></table>');
			var $td = $("td", $table);
			$this.html( $table );

			var tailwidth = $td.width();
			var targetWidth = width - tailwidth;

			$td.text( text );

			if ($td.width() > width) {
				if ( options.tooltip ) {
					$this.attr("title", text);
				}

				while ($td.width() >= targetWidth ) {
					textlength--;
					$td.html($td.html().substring(0, textlength)); // .html(val) is faster than .text(val) and we already used .text(val) to strip/escape html
				}

				text = $.trim( $td.html() );
				$this.html( text + options.tail );

			} else {
				$this.html( text );
			}

			this.style.visibility = "visible";

			return true;
		});

		return true;

	};

	var css = document.documentElement.style;
	var _native = false;

	if ( "textOverflow" in css ) {
		_native = "textOverflow";
	} else if ( "OTextOverflow" in css ) {
		_native = "OTextOverflow";
	}

	$.fn.textTruncate._native = _native;

	$.fn.textTruncate.defaults = {
		tail: "&hellip;",
		tooltip: true
	};

})(jQuery);


(function($) {
	$.extend($,{ placeholder: {
			browser_supported: function() {
				return this._supported !== undefined ?
					this._supported :
					( this._supported = !!('placeholder' in $('<input type="text">')[0]) );
			},
			shim: function(opts) {
				var config = {
					color: '#888',
					cls: '',
					lr_padding:4,
					selector: 'input[placeholder], textarea[placeholder]'
				};
				$.extend(config,opts);
				!this.browser_supported() && $(config.selector)._placeholder_shim(config);
			}
	}});

	$.extend($.fn,{
		_placeholder_shim: function(config) {
			function calcPositionCss(target)
			{
				var op = $(target).offsetParent().offset();
				var ot = $(target).offset();

				return {
					top: ot.top - op.top + ($(target).outerHeight() - $(target).height()) /2,
					left: ot.left - op.left + config.lr_padding,
					width: $(target).width() - config.lr_padding
				};
			}
			return this.each(function() {
				if( $(this).data('placeholder') ) {
					var $ol = $(this).data('placeholder');
					$ol.css(calcPositionCss($(this)));
					return true;
				}
				
				var possible_line_height = {};
				if( $(this).css('height') != 'auto') {
				  possible_line_height = { lineHeight: $(this).css('height') };
				}

				var ol = $('<label />')
					.text($(this).attr('placeholder'))
					.addClass(config.cls)
					.css($.extend({
						position:'absolute',
						display: 'inline',
						float:'none',
						overflow:'hidden',
						whiteSpace:'nowrap',
						textAlign: 'left',
						color: config.color,
						cursor: 'text',
						fontSize: $(this).css('font-size')
					}, possible_line_height))
					.css(calcPositionCss(this))
					.attr('for', this.id)
					.data('target',$(this))
					.click(function(){
						$(this).data('target').focus()
					})
					.insertBefore(this);
				$(this)
					.data('placeholder',ol)
					.focus(function(){
						ol.hide();
					}).blur(function() {
						ol[$(this).val().length ? 'hide' : 'show']();
					}).triggerHandler('blur');
				$(window)
					.resize(function() {
						var $target = ol.data('target')
						ol.css(calcPositionCss($target))
					});
			});
		}
	});

})(jQuery);

$(document).ready(function() {
  if ($.placeholder) {
    $.placeholder.shim();
  }
});

/**
 * jQuery.timers - Timer abstractions for jQuery
 * Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date: 2009/10/16
 *
 * @author Blair Mitchelmore
 * @version 1.2
 *
 **/

$.fn.extend({
	everyTime: function(interval, label, fn, times) {
		return this.each(function() {
			$.timer.add(this, interval, label, fn, times);
		});
	},
	oneTime: function(interval, label, fn) {
		return this.each(function() {
			$.timer.add(this, interval, label, fn, 1);
		});
	},
	stopTime: function(label, fn) {
		return this.each(function() {
			$.timer.remove(this, label, fn);
		});
	}
});

$.extend({
	timer: {
		global: [],
		guid: 1,
		dataKey: "$.timer",
		regex: /^([0-9]+(?:\.[0-9]*)?)\s*(.*s)?$/,
		powers: {
			// Yeah this is major overkill...
			'ms': 1,
			'cs': 10,
			'ds': 100,
			's': 1000,
			'das': 10000,
			'hs': 100000,
			'ks': 1000000
		},
		timeParse: function(value) {
			if (value == undefined || value == null)
				return null;
			var result = this.regex.exec($.trim(value.toString()));
			if (result[2]) {
				var num = parseFloat(result[1]);
				var mult = this.powers[result[2]] || 1;
				return num * mult;
			} else {
				return value;
			}
		},
		add: function(element, interval, label, fn, times) {
			var counter = 0;

			if ($.isFunction(label)) {
				if (!times)
					times = fn;
				fn = label;
				label = interval;
			}

			interval = $.timer.timeParse(interval);

			if (typeof interval != 'number' || isNaN(interval) || interval < 0)
				return;

			if (typeof times != 'number' || isNaN(times) || times < 0)
				times = 0;

			times = times || 0;

			var timers = $.data(element, this.dataKey) || $.data(element, this.dataKey, {});

			if (!timers[label])
				timers[label] = {};

			fn.timerID = fn.timerID || this.guid++;

			var handler = function() {
				if ((++counter > times && times !== 0) || fn.call(element, counter) === false)
					$.timer.remove(element, label, fn);
			};

			handler.timerID = fn.timerID;

			if (!timers[label][fn.timerID])
				timers[label][fn.timerID] = window.setInterval(handler,interval);

			this.global.push( element );

		},
		remove: function(element, label, fn) {
			var timers = $.data(element, this.dataKey), ret;

			if ( timers ) {

				if (!label) {
					for ( label in timers )
						this.remove(element, label, fn);
				} else if ( timers[label] ) {
					if ( fn ) {
						if ( fn.timerID ) {
							window.clearInterval(timers[label][fn.timerID]);
							delete timers[label][fn.timerID];
						}
					} else {
						for ( var fn in timers[label] ) {
							window.clearInterval(timers[label][fn]);
							delete timers[label][fn];
						}
					}

					for ( ret in timers[label] ) break;
					if ( !ret ) {
						ret = null;
						delete timers[label];
					}
				}

				for ( ret in timers ) break;
				if ( !ret )
					$.removeData(element, this.dataKey);
			}
		}
	}
});

$(window).bind("unload", function() {
	$.each($.timer.global, function(index, item) {
		$.timer.remove(item);
	});
});

/*!
 * jCarousel - Riding carousels with jQuery
 *   http://sorgalla.com/jcarousel/
 *
 * Copyright (c) 2006 Jan Sorgalla (http://sorgalla.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Built on top of the jQuery library
 *   http://jquery.com
 *
 * Inspired by the "Carousel Component" by Bill Scott
 *   http://billwscott.com/carousel/
 */

(function($) {
    /**
     * Creates a carousel for all matched elements.
     *
     * @example $("#mycarousel").jcarousel();
     * @before <ul id="mycarousel" class="jcarousel-skin-name"><li>First item</li><li>Second item</li></ul>
     * @result
     *
     * <div class="jcarousel-skin-name">
     *   <div class="jcarousel-container">
     *     <div disabled="disabled" class="jcarousel-prev jcarousel-prev-disabled"></div>
     *     <div class="jcarousel-clip">
     *       <ul class="jcarousel-list">
     *         <li class="jcarousel-item-1">First item</li>
     *         <li class="jcarousel-item-2">Second item</li>
     *       </ul>
     *     </div>
     *     <div class="jcarousel-next"></div>
     *   </div>
     * </div>
     *
     * @method jcarousel
     * @return jQuery
     * @param o {Hash|String} A set of key/value pairs to set as configuration properties or a method name to call on a formerly created instance.
     */
    $.fn.jcarousel = function(o) {
        if (typeof o == 'string') {
            var instance = $(this).data('jcarousel'), args = Array.prototype.slice.call(arguments, 1);
            return instance[o].apply(instance, args);
        } else
            return this.each(function() {
                $(this).data('jcarousel', new $jc(this, o));
            });
    };

    // Default configuration properties.
    var defaults = {
        vertical: false,
        listTag: 'ul',
        itemTag: 'li',
        start: 1,
        offset: 1,
        size: null,
        scroll: 3,
        visible: null,
        animation: 'normal',
        easing: 'swing',
        auto: 0,
        wrap: null,
        initCallback: null,
        reloadCallback: null,
        itemLoadCallback: null,
        itemFirstInCallback: null,
        itemFirstOutCallback: null,
        itemLastInCallback: null,
        itemLastOutCallback: null,
        itemVisibleInCallback: null,
        itemVisibleOutCallback: null,
        buttonNextHTML: '<div></div>',
        buttonPrevHTML: '<div></div>',
        buttonNextEvent: 'click',
        buttonPrevEvent: 'click',
        buttonNextCallback: null,
        buttonPrevCallback: null
    };

    /**
     * The jCarousel object.
     *
     * @constructor
     * @class jcarousel
     * @param e {HTMLElement} The element to create the carousel for.
     * @param o {Object} A set of key/value pairs to set as configuration properties.
     * @cat Plugins/jCarousel
     */
    $.jcarousel = function(e, o) {
        this.options    = $.extend({}, defaults, o || {});

        this.locked     = false;

        this.container  = null;
        this.clip       = null;
        this.list       = null;
        this.buttonNext = null;
        this.buttonPrev = null;

        this.wh = !this.options.vertical ? 'width' : 'height';
        this.lt = !this.options.vertical ? 'left' : 'top';

        // Extract skin class
        var skin = '', split = e.className.split(' ');

        for (var i = 0; i < split.length; i++) {
            if (split[i].indexOf('jcarousel-skin') != -1) {
                $(e).removeClass(split[i]);
                skin = split[i];
                break;
            }
        }

        if (e.nodeName.toUpperCase() == this.options.listTag.toUpperCase()) {
            this.list = $(e);
            this.container = this.list.parent();

            if (this.container.hasClass('jcarousel-clip')) {
                if (!this.container.parent().hasClass('jcarousel-container'))
                    this.container = this.container.wrap('<div></div>');

                this.container = this.container.parent();
            } else if (!this.container.hasClass('jcarousel-container'))
                this.container = this.list.wrap('<div></div>').parent();
        } else {
            this.container = $(e);
            this.list = this.container.find(this.options.listTag).eq(0);
        }

        if (skin != '' && this.container.parent()[0].className.indexOf('jcarousel-skin') == -1)
            this.container.wrap('<div class=" '+ skin + '"></div>');

        this.clip = this.list.parent();

        if (!this.clip.length || !this.clip.hasClass('jcarousel-clip'))
            this.clip = this.list.wrap('<div></div>').parent();

        this.buttonNext = $('.jcarousel-next', this.container);

        if (this.buttonNext.size() == 0 && this.options.buttonNextHTML != null)
            this.buttonNext = this.clip.after(this.options.buttonNextHTML).next();

        this.buttonNext.addClass(this.className('jcarousel-next'));

        this.buttonPrev = $('.jcarousel-prev', this.container);

        if (this.buttonPrev.size() == 0 && this.options.buttonPrevHTML != null)
            this.buttonPrev = this.clip.before(this.options.buttonPrevHTML).prev();

        this.buttonPrev.addClass(this.className('jcarousel-prev'));

        this.clip.addClass(this.className('jcarousel-clip')).css({
            overflow: 'hidden',
            position: 'relative'
        });
        this.list.addClass(this.className('jcarousel-list')).css({
            overflow: 'hidden',
            position: 'relative',
            top: 0,
            left: 0,
            margin: 0,
            padding: 0
        });
        this.container.addClass(this.className('jcarousel-container')).css({
            position: 'relative'
        });

        var di = this.options.visible != null ? Math.ceil(this.clipping() / this.options.visible) : null;
        var li = this.list.children(this.options.itemTag);

        var self = this;

        if (li.size() > 0) {
            var wh = 0, i = this.options.offset;
            li.each(function() {
                self.format(this, i++);
                wh += self.dimension(this, di);
            });

            this.list.css(this.wh, wh + 'px');

            // Only set if not explicitly passed as option
            if (!o || o.size === undefined)
                this.options.size = li.size();
        }

        // For whatever reason, .show() does not work in Safari...
        this.container.css('display', 'block');
        this.buttonNext.css('display', 'block');
        this.buttonPrev.css('display', 'block');

        this.funcNext   = function() { self.next(); };
        this.funcPrev   = function() { self.prev(); };
        this.funcResize = function() { self.reload(); };

        if (this.options.initCallback != null)
            this.options.initCallback(this, 'init');

        if ($.browser.safari) {
            this.buttons(false, false);
            $(window).bind('load.jcarousel', function() { self.setup(); });
        } else
            this.setup();
    };

    // Create shortcut for internal use
    var $jc = $.jcarousel;

    $jc.fn = $jc.prototype = {
        jcarousel: '0.2.4'
    };

    $jc.fn.extend = $jc.extend = $.extend;

    $jc.fn.extend({
        /**
         * Setups the carousel.
         *
         * @method setup
         * @return undefined
         */
        setup: function() {
            this.first     = null;
            this.last      = null;
            this.prevFirst = null;
            this.prevLast  = null;
            this.animating = false;
            this.timer     = null;
            this.tail      = null;
            this.inTail    = false;

            if (this.locked)
                return;

            this.list.css(this.lt, this.pos(this.options.offset) + 'px');
            var p = this.pos(this.options.start);
            this.prevFirst = this.prevLast = null;
            this.animate(p, false);

            $(window).unbind('resize.jcarousel', this.funcResize).bind('resize.jcarousel', this.funcResize);
        },

        /**
         * Clears the list and resets the carousel.
         *
         * @method reset
         * @return undefined
         */
        reset: function() {
            this.list.empty();

            this.list.css(this.lt, '0px');
            this.list.css(this.wh, '10px');

            if (this.options.initCallback != null)
                this.options.initCallback(this, 'reset');

            this.setup();
        },

        /**
         * Reloads the carousel and adjusts positions.
         *
         * @method reload
         * @return undefined
         */
        reload: function() {
            if (this.tail != null && this.inTail)
                this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) + this.tail);

            this.tail   = null;
            this.inTail = false;

            if (this.options.reloadCallback != null)
                this.options.reloadCallback(this);

            if (this.options.visible != null) {
                var self = this;
                var di = Math.ceil(this.clipping() / this.options.visible), wh = 0, lt = 0;
                $(this.options.itemTag, this.list).each(function(i) {
                    wh += self.dimension(this, di);
                    if (i + 1 < self.first)
                        lt = wh;
                });

                this.list.css(this.wh, wh + 'px');
                this.list.css(this.lt, -lt + 'px');
            }

            this.scroll(this.first, false);
        },

        /**
         * Locks the carousel.
         *
         * @method lock
         * @return undefined
         */
        lock: function() {
            this.locked = true;
            this.buttons();
        },

        /**
         * Unlocks the carousel.
         *
         * @method unlock
         * @return undefined
         */
        unlock: function() {
            this.locked = false;
            this.buttons();
        },

        /**
         * Sets the size of the carousel.
         *
         * @method size
         * @return undefined
         * @param s {Number} The size of the carousel.
         */
        size: function(s) {
            if (s != undefined) {
                this.options.size = s;
                if (!this.locked)
                    this.buttons();
            }

            return this.options.size;
        },

        /**
         * Checks whether a list element exists for the given index (or index range).
         *
         * @method get
         * @return bool
         * @param i {Number} The index of the (first) element.
         * @param i2 {Number} The index of the last element.
         */
        has: function(i, i2) {
            if (i2 == undefined || !i2)
                i2 = i;

            if (this.options.size !== null && i2 > this.options.size)
                i2 = this.options.size;

            for (var j = i; j <= i2; j++) {
                var e = this.get(j);
                if (!e.length || e.hasClass('jcarousel-item-placeholder'))
                    return false;
            }

            return true;
        },

        /**
         * Returns a jQuery object with list element for the given index.
         *
         * @method get
         * @return jQuery
         * @param i {Number} The index of the element.
         */
        get: function(i) {
            return $('.jcarousel-item-' + i, this.list);
        },

        /**
         * Adds an element for the given index to the list.
         * If the element already exists, it updates the inner html.
         * Returns the created element as jQuery object.
         *
         * @method add
         * @return jQuery
         * @param i {Number} The index of the element.
         * @param s {String} The innerHTML of the element.
         */
        add: function(i, s) {
            var e = this.get(i), old = 0, add = 0;

            if (e.length == 0) {
                var c, e = this.create(i), j = $jc.intval(i);
                while (c = this.get(--j)) {
                    if (j <= 0 || c.length) {
                        j <= 0 ? this.list.prepend(e) : c.after(e);
                        break;
                    }
                }
            } else
                old = this.dimension(e);

            e.removeClass(this.className('jcarousel-item-placeholder'));
            typeof s == 'string' ? e.html(s) : e.empty().append(s);

            var di = this.options.visible != null ? Math.ceil(this.clipping() / this.options.visible) : null;
            var wh = this.dimension(e, di) - old;

            if (i > 0 && i < this.first)
                this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) - wh + 'px');

            this.list.css(this.wh, $jc.intval(this.list.css(this.wh)) + wh + 'px');

            return e;
        },

        /**
         * Removes an element for the given index from the list.
         *
         * @method remove
         * @return undefined
         * @param i {Number} The index of the element.
         */
        remove: function(i) {
            var e = this.get(i);

            // Check if item exists and is not currently visible
            if (!e.length || (i >= this.first && i <= this.last))
                return;

            var d = this.dimension(e);

            if (i < this.first)
                this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) + d + 'px');

            e.remove();

            this.list.css(this.wh, $jc.intval(this.list.css(this.wh)) - d + 'px');
        },

        /**
         * Moves the carousel forwards.
         *
         * @method next
         * @return undefined
         */
        next: function() {
            this.stopAuto();

            if (this.tail != null && !this.inTail)
                this.scrollTail(false);
            else
                this.scroll(((this.options.wrap == 'both' || this.options.wrap == 'last') && this.options.size != null && this.last == this.options.size) ? 1 : this.first + this.options.scroll);
        },

        /**
         * Moves the carousel backwards.
         *
         * @method prev
         * @return undefined
         */
        prev: function() {
            this.stopAuto();

            if (this.tail != null && this.inTail)
                this.scrollTail(true);
            else
                this.scroll(((this.options.wrap == 'both' || this.options.wrap == 'first') && this.options.size != null && this.first == 1) ? this.options.size : this.first - this.options.scroll);
        },

        /**
         * Scrolls the tail of the carousel.
         *
         * @method scrollTail
         * @return undefined
         * @param b {Boolean} Whether scroll the tail back or forward.
         */
        scrollTail: function(b) {
            if (this.locked || this.animating || !this.tail)
                return;

            var pos  = $jc.intval(this.list.css(this.lt));

            !b ? pos -= this.tail : pos += this.tail;
            this.inTail = !b;

            // Save for callbacks
            this.prevFirst = this.first;
            this.prevLast  = this.last;

            this.animate(pos);
        },

        /**
         * Scrolls the carousel to a certain position.
         *
         * @method scroll
         * @return undefined
         * @param i {Number} The index of the element to scoll to.
         * @param a {Boolean} Flag indicating whether to perform animation.
         */
        scroll: function(i, a) {
            if (this.locked || this.animating)
                return;

            this.animate(this.pos(i), a);
        },

        /**
         * Prepares the carousel and return the position for a certian index.
         *
         * @method pos
         * @return {Number}
         * @param i {Number} The index of the element to scoll to.
         */
        pos: function(i) {
            var pos  = $jc.intval(this.list.css(this.lt));

            if (this.locked || this.animating)
                return pos;

            if (this.options.wrap != 'circular')
                i = i < 1 ? 1 : (this.options.size && i > this.options.size ? this.options.size : i);

            var back = this.first > i;

            // Create placeholders, new list width/height
            // and new list position
            var f = this.options.wrap != 'circular' && this.first <= 1 ? 1 : this.first;
            var c = back ? this.get(f) : this.get(this.last);
            var j = back ? f : f - 1;
            var e = null, l = 0, p = false, d = 0, g;

            while (back ? --j >= i : ++j < i) {
                e = this.get(j);
                p = !e.length;
                if (e.length == 0) {
                    e = this.create(j).addClass(this.className('jcarousel-item-placeholder'));
                    c[back ? 'before' : 'after' ](e);

                    if (this.first != null && this.options.wrap == 'circular' && this.options.size !== null && (j <= 0 || j > this.options.size)) {
                        g = this.get(this.index(j));
                        if (g.length)
                            this.add(j, g.children().clone(true));
                    }
                }

                c = e;
                d = this.dimension(e);

                if (p)
                    l += d;

                if (this.first != null && (this.options.wrap == 'circular' || (j >= 1 && (this.options.size == null || j <= this.options.size))))
                    pos = back ? pos + d : pos - d;
            }

            // Calculate visible items
            var clipping = this.clipping();
            var cache = [];
            var visible = 0, j = i, v = 0;
            var c = this.get(i - 1);

            while (++visible) {
                e = this.get(j);
                p = !e.length;
                if (e.length == 0) {
                    e = this.create(j).addClass(this.className('jcarousel-item-placeholder'));
                    // This should only happen on a next scroll
                    c.length == 0 ? this.list.prepend(e) : c[back ? 'before' : 'after' ](e);

                    if (this.first != null && this.options.wrap == 'circular' && this.options.size !== null && (j <= 0 || j > this.options.size)) {
                        g = this.get(this.index(j));
                        if (g.length)
                            this.add(j, g.find('>*').clone(true));
                    }
                }

                c = e;
                var d = this.dimension(e);
                if (d == 0) {
                    if (console && $.isFunction(console.log)) {
                      console.log('jCarousel: No width/height set for items. This will cause an infinite loop. Aborting...');
                    }
                    return 0;
                }

                if (this.options.wrap != 'circular' && this.options.size !== null && j > this.options.size)
                    cache.push(e);
                else if (p)
                    l += d;

                v += d;

                if (v >= clipping)
                    break;

                j++;
            }

             // Remove out-of-range placeholders
            for (var x = 0; x < cache.length; x++)
                cache[x].remove();

            // Resize list
            if (l > 0) {
                this.list.css(this.wh, this.dimension(this.list) + l + 'px');

                if (back) {
                    pos -= l;
                    this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) - l + 'px');
                }
            }

            // Calculate first and last item
            var last = i + visible - 1;
            if (this.options.wrap != 'circular' && this.options.size && last > this.options.size)
                last = this.options.size;

            if (j > last) {
                visible = 0, j = last, v = 0;
                while (++visible) {
                    var e = this.get(j--);
                    if (!e.length)
                        break;
                    v += this.dimension(e);
                    if (v >= clipping)
                        break;
                }
            }

            var first = last - visible + 1;
            if (this.options.wrap != 'circular' && first < 1)
                first = 1;

            if (this.inTail && back) {
                pos += this.tail;
                this.inTail = false;
            }

            this.tail = null;
            if (this.options.wrap != 'circular' && last == this.options.size && (last - visible + 1) >= 1) {
                var m = $jc.margin(this.get(last), !this.options.vertical ? 'marginRight' : 'marginBottom');
                if ((v - m) > clipping)
                    this.tail = v - clipping - m;
            }

            // Adjust position
            while (i-- > first)
                pos += this.dimension(this.get(i));

            // Save visible item range
            this.prevFirst = this.first;
            this.prevLast  = this.last;
            this.first     = first;
            this.last      = last;

            return pos;
        },

        /**
         * Animates the carousel to a certain position.
         *
         * @method animate
         * @return undefined
         * @param p {Number} Position to scroll to.
         * @param a {Boolean} Flag indicating whether to perform animation.
         */
        animate: function(p, a) {
            if (this.locked || this.animating)
                return;

            this.animating = true;

            var self = this;
            var scrolled = function() {
                self.animating = false;

                if (p == 0)
                    self.list.css(self.lt,  0);

                if (self.options.wrap == 'circular' || self.options.wrap == 'both' || self.options.wrap == 'last' || self.options.size == null || self.last < self.options.size)
                    self.startAuto();

                self.buttons();
                self.notify('onAfterAnimation');
            };

            this.notify('onBeforeAnimation');

            // Animate
            if (!this.options.animation || a == false) {
                this.list.css(this.lt, p + 'px');
                scrolled();
            } else {
                var o = !this.options.vertical ? {'left': p} : {'top': p};
                this.list.animate(o, this.options.animation, this.options.easing, scrolled);
            }
        },

        /**
         * Starts autoscrolling.
         *
         * @method auto
         * @return undefined
         * @param s {Number} Seconds to periodically autoscroll the content.
         */
        startAuto: function(s) {
            if (s != undefined)
                this.options.auto = s;

            if (this.options.auto == 0)
                return this.stopAuto();

            if (this.timer != null)
                return;

            var self = this;
            this.timer = setTimeout(function() { self.next(); }, this.options.auto * 1000);
        },

        /**
         * Stops autoscrolling.
         *
         * @method stopAuto
         * @return undefined
         */
        stopAuto: function() {
            if (this.timer == null)
                return;

            clearTimeout(this.timer);
            this.timer = null;
        },

        /**
         * Sets the states of the prev/next buttons.
         *
         * @method buttons
         * @return undefined
         */
        buttons: function(n, p) {
            if (n == undefined || n == null) {
                var n = !this.locked && this.options.size !== 0 && ((this.options.wrap && this.options.wrap != 'first') || this.options.size == null || this.last < this.options.size);
                if (!this.locked && (!this.options.wrap || this.options.wrap == 'first') && this.options.size != null && this.last >= this.options.size)
                    n = this.tail != null && !this.inTail;
            }

            if (p == undefined || p == null) {
                var p = !this.locked && this.options.size !== 0 && ((this.options.wrap && this.options.wrap != 'last') || this.first > 1);
                if (!this.locked && (!this.options.wrap || this.options.wrap == 'last') && this.options.size != null && this.first == 1)
                    p = this.tail != null && this.inTail;
            }

            var self = this;

            this.buttonNext[n ? 'bind' : 'unbind'](this.options.buttonNextEvent + '.jcarousel', this.funcNext)[n ? 'removeClass' : 'addClass'](this.className('jcarousel-next-disabled')).attr('disabled', n ? false : true);
            this.buttonPrev[p ? 'bind' : 'unbind'](this.options.buttonPrevEvent + '.jcarousel', this.funcPrev)[p ? 'removeClass' : 'addClass'](this.className('jcarousel-prev-disabled')).attr('disabled', p ? false : true);

            if (this.buttonNext.length > 0 && (this.buttonNext[0].jcarouselstate == undefined || this.buttonNext[0].jcarouselstate != n) && this.options.buttonNextCallback != null) {
                this.buttonNext.each(function() { self.options.buttonNextCallback(self, this, n); });
                this.buttonNext[0].jcarouselstate = n;
            }

            if (this.buttonPrev.length > 0 && (this.buttonPrev[0].jcarouselstate == undefined || this.buttonPrev[0].jcarouselstate != p) && this.options.buttonPrevCallback != null) {
                this.buttonPrev.each(function() { self.options.buttonPrevCallback(self, this, p); });
                this.buttonPrev[0].jcarouselstate = p;
            }
        },

        /**
         * Notify callback of a specified event.
         *
         * @method notify
         * @return undefined
         * @param evt {String} The event name
         */
        notify: function(evt) {
            var state = this.prevFirst == null ? 'init' : (this.prevFirst < this.first ? 'next' : 'prev');

            // Load items
            this.callback('itemLoadCallback', evt, state);

            if (this.prevFirst !== this.first) {
                this.callback('itemFirstInCallback', evt, state, this.first);
                this.callback('itemFirstOutCallback', evt, state, this.prevFirst);
            }

            if (this.prevLast !== this.last) {
                this.callback('itemLastInCallback', evt, state, this.last);
                this.callback('itemLastOutCallback', evt, state, this.prevLast);
            }

            this.callback('itemVisibleInCallback', evt, state, this.first, this.last, this.prevFirst, this.prevLast);
            this.callback('itemVisibleOutCallback', evt, state, this.prevFirst, this.prevLast, this.first, this.last);
        },

        callback: function(cb, evt, state, i1, i2, i3, i4) {
            if (this.options[cb] == undefined || (typeof this.options[cb] != 'object' && evt != 'onAfterAnimation'))
                return;

            var callback = typeof this.options[cb] == 'object' ? this.options[cb][evt] : this.options[cb];

            if (!$.isFunction(callback))
                return;

            var self = this;

            if (i1 === undefined)
                callback(self, state, evt);
            else if (i2 === undefined)
                this.get(i1).each(function() { callback(self, this, i1, state, evt); });
            else {
                for (var i = i1; i <= i2; i++)
                    if (i !== null && !(i >= i3 && i <= i4))
                        this.get(i).each(function() { callback(self, this, i, state, evt); });
            }
        },

        create: function(i) {
            return this.format('<' + this.options.itemTag + '></' + this.options.itemTag + '>', i);
        },

        format: function(e, i) {
            var $e = $(e).addClass(this.className('jcarousel-item')).addClass(this.className('jcarousel-item-' + i)).css({
                'float': 'left',
                'list-style': 'none'
            });
            $e.attr('jcarouselindex', i);
            return $e;
        },

        className: function(c) {
            return c + ' ' + c + (!this.options.vertical ? '-horizontal' : '-vertical');
        },

        dimension: function(e, d) {
            var el = e.jquery != undefined ? e[0] : e;

            var old = !this.options.vertical ?
                el.offsetWidth + $jc.margin(el, 'marginLeft') + $jc.margin(el, 'marginRight') :
                el.offsetHeight + $jc.margin(el, 'marginTop') + $jc.margin(el, 'marginBottom');

            if (d == undefined || old == d)
                return old;

            var w = !this.options.vertical ?
                d - $jc.margin(el, 'marginLeft') - $jc.margin(el, 'marginRight') :
                d - $jc.margin(el, 'marginTop') - $jc.margin(el, 'marginBottom');

            $(el).css(this.wh, w + 'px');

            return this.dimension(el);
        },

        clipping: function() {
          if (this.clip[0] != null) {
            return !this.options.vertical ?
                this.clip[0].offsetWidth - $jc.intval(this.clip.css('borderLeftWidth')) - $jc.intval(this.clip.css('borderRightWidth')) :
                this.clip[0].offsetHeight - $jc.intval(this.clip.css('borderTopWidth')) - $jc.intval(this.clip.css('borderBottomWidth'));
          }
        },

        index: function(i, s) {
            if (s == undefined)
                s = this.options.size;

            return Math.round((((i-1) / s) - Math.floor((i-1) / s)) * s) + 1;
        }
    });

    $jc.extend({
        /**
         * Gets/Sets the global default configuration properties.
         *
         * @method defaults
         * @return {Object}
         * @param d {Object} A set of key/value pairs to set as configuration properties.
         */
        defaults: function(d) {
            return $.extend(defaults, d || {});
        },

        margin: function(e, p) {
            if (!e)
                return 0;

            var el = e.jquery != undefined ? e[0] : e;

            if (p == 'marginRight' && $.browser.safari) {
                var old = {'display': 'block', 'float': 'none', 'width': 'auto'}, oWidth, oWidth2;

                $.swap(el, old, function() { oWidth = el.offsetWidth; });

                old['marginRight'] = 0;
                $.swap(el, old, function() { oWidth2 = el.offsetWidth; });

                return oWidth2 - oWidth;
            }

            return $jc.intval($.css(el, p));
        },

        intval: function(v) {
            v = parseInt(v);
            return isNaN(v) ? 0 : v;
        }
    });

})(jQuery);
