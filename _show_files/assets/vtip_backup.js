/**
Vertigo Tip by www.vertigo-project.com
Requires jQuery
*/

// 安全にjQueryのコードを定義する
(function($){
  // プライベートメソッド
  function private_method() {
  };
  
  // 関数
  $.foo1 = function(src, options){
    var default_options = {
      name: 1,
      target: "target1",
    };
    var options = $.extend({}, default_options, options);
    $(src).keyup(function(){
      $(options.target).val($(src).val() * 2);
      $(options.target).nextAll(":first").text(default_options.name);
    });
  };
  
  // プラグイン
  $.fn.foo2 = function(options) {
    var default_options = {
      name: 1,
      target: "target2",
    };
    var options = $.extend({}, default_options, options);
    $(this).keyup(function(){
      $(options.target).val($(this).val() * 2);
      $(options.target).nextAll(":first").text(default_options.name);
    });
  };
  
  // ドキュメントがすべて読み込まれてから実行する例
  $(function(){
    $.foo1("#main1", {target: "#main2"});
    $.foo1("#main3", {target: "#main4"});
    $("#main5").foo2({target: "#main6"});
    $("#main7").foo2({target: "#main8"});
  });
})(jQuery);



this.vtip = function() {
  this.xOffset = -10; // x distance from mouse
  this.yOffset = 10; // y distance from mouse

  $(".vtip").unbind().hover(
    function(e) {
      this.t = this.title;
      this.title = '';
      this.top = (e.pageY + yOffset);
      this.left = (e.pageX + xOffset);

      $('body').append( '<p id="vtip"><img id="vtipArrow" />' + this.t + '</p>' );

      $('p#vtip #vtipArrow').attr("src", 'images/vtip_arrow.png');
      $('p#vtip').css("top", this.top+"px").css("left", this.left+"px").fadeIn("slow");

    },
    function() {
      this.title = this.t;
      $("p#vtip").fadeOut("slow").remove();
    }
  ).mousemove(
    function(e) {
      this.top = (e.pageY + yOffset);
      this.left = (e.pageX + xOffset);
      $("p#vtip").css("top", this.top + "px").css("left", this.left + "px");
    }
  );
};

jQuery(document).ready(function($){vtip();})
