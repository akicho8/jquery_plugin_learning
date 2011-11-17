// Vertigo Tip by www.vertigo-project.com
// Requires jQuery
//
// 2011-06-25 リファクタリング＆改造 by A.Ikeda

(function($){
  var xOffset = -10; // x distance from mouse
  var yOffset = +10; // y distance from mouse

  $.vtip = function() {
    $(".vtip").unbind().hover(
      function(e) {
        this.t = this.title;
        this.title = '';
        this.top  = e.pageY + yOffset;
        this.left = e.pageX + xOffset;
        $('body').append('<p id="vtip"><img id="vtipArrow" />' + this.t + '</p>');
        $('p#vtip #vtipArrow').attr("src", 'images/vtip_arrow.png');
        $('p#vtip').css("top", this.top + "px").css("left", this.left + "px").show();
      },
      function() {
        this.title = this.t;
        $("p#vtip").remove();
      }
    ).mousemove(
      function(e) {
        this.top  = e.pageY + yOffset;
        this.left = e.pageX + xOffset;
        $("p#vtip").css("top", this.top + "px").css("left", this.left + "px");
      }
    );
  }

  $(function(){
    // $.vtip();
  });
})(jQuery);
