// Cool notification messages with CSS3 & Jquery – Red Team Design
// http://www.red-team-design.com/cool-notification-messages-with-css3-jquery

(function($){
  $.rtd_cool_notification_messages = function(options) {
    var opts = $.extend({}, $.rtd_cool_notification_messages.defaults, options);

    // Initially, hide them all
    hide_all_messages();

    // クリックしたらだんだん上に消えていく
    $(".message").click(function(){
      $(this).animate({top: -$(this).outerHeight()}, opts.speed);
    });

    // すべてを消す
    function hide_all_messages() {
      $.each(opts.targets, function(i, elem){
        $("." + elem).css("top", -$("." + elem).outerHeight());
      });
    }

    if (opts.trigger_mode) {
      // トリガーで起動する
      $.each(opts.targets, function(i, elem){
        $("." + elem + "-trigger").click(function(){
          hide_all_messages();
          $("." + elem).animate({top:0}, opts.speed);
        });
      });
    } else {
      // 自動的に起動する
      $.each(opts.targets, function(i, elem){
        $("." + elem).animate({top:0}, opts.speed);
      });
    }
  };

  $.rtd_cool_notification_messages.defaults = {
    targets: ["info", "warning", "error", "success"],
    speed: 500,
    trigger_mode: false,
  };

})(jQuery);
