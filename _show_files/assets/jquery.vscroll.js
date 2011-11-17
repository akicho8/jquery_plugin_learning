/*
* jQuery vScroll
* Copyright (c) 2011 Simon Hibbard
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:

* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/*
* Version: V1.2.0
* Release: 10-02-2011
* Based on jQuery 1.4.2
*/

(function ($) {
  var vscrollid = 0;
  $.fn.vScroll = function (options) {
    var options = $.extend({}, { speed: 500, height: 300, upID: "#up-arrow", downID: "#bottom-arrow", cycle: true }, options);

    return this.each(function () {
      vscrollid++;
      obj = $(this);
      var newid = vscrollid;

      obj.css("overflow", "hidden");
      obj.css("position", "relative");
      obj.css("height", options.height + "px");
      obj.children().each(
        function (intIndex) {
          $(this).addClass("vscroll-" + vscrollid + "-" + intIndex);
        });

      var itemCount = 0;

      $(options.downID).click(function () {
        var nextCount = itemCount + 1;
        if ($('.vscroll-' + newid + '-' + nextCount).length) {
          var divH = $('.vscroll-' + newid + '-' + itemCount).outerHeight();
          itemCount++;
          $("#vscroller-" + newid).animate({
            top: "-=" + divH + "px"
          }, options.speed);
        }
        else {
          if (options.cycle) {
            itemCount = 0;
            $("#vscroller-" + newid).animate({
              top: "0" + "px"
            }, options.speed);
          }
        }
      });

      $(options.upID).click(function () {
        var prevCount = itemCount - 1;
        if ($('.vscroll-' + newid + '-' + prevCount).length) {
          itemCount--;
          var divH = $('.vscroll-' + newid + '-' + itemCount).outerHeight();
          $("#vscroller-" + newid).animate({
            top: "+=" + divH + "px"
          }, options.speed);
        }
      });

      obj.children().wrapAll("<div style='position: relative; top: 0' id='vscroller-" + vscrollid + "'></div>");
    });

  };

})(jQuery);
