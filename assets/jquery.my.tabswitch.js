//
// タブの切り替え
//
// ・$.tabswitch("...") を指定しない場合、普通に遷移できるようにしておくこと
//
// 使い方
//
//   <ul class="tabs1-menu">
//     <li><a href="?mode=tab1" tab-name="tab1" class="selected">TAB1</a></li>
//     <li><a href="?mode=tab2" tab-name="tab2">TAB2</a></li>
//   </ul>
//   <div class="tabs1-group">
//     <input type="hidden" name="tab" value="tab1" /> ※必要であれば設定
//     <div tab-name="tab1" class="active">TAB1 CONTENT</div>
//     <div tab-name="tab2" class="inactive">TAB2 CONTENT</div>
//   </div>
//
//   のHTMLに対して
//
//   $.tabswitch(".tabs1");
//
// 2011-02-04 hiddenの部分修正
//
// TODO: .foo.bar で class は2つ指定できるのだから tabs1-menu に対して tabs1-menu(".tabs1") とするのはやめる
//
(function($){
  $.tabswitch = function(tabs_name) {
    $(tabs_name + "-menu a").click(function(e){ // TODO: + "-menu" がダサいのでどうにかする
      // メニューで押したところだけを目立たせる
      $(this)
        .parents("li").siblings().find("a").removeClass("selected") // 自分以外の selected を外す
        .end().end().end().addClass("selected");                    // 自分に selected を設定

      // 対応するコンテンツだけを有効にする
      $(tabs_name + "-group > div[tab-name=" + $(this).attr("tab-name") + "]")
        .siblings("div[tab-name]") // hiddenタグがマッチしないように厳密に指定
                .removeClass("active").addClass("inactive") // 自分以外を無効
        .end().removeClass("inactive").addClass("active");  // 自分を有効

      // 同じ場所に戻ってこれるようにhiddenタグがあれば現在のタブ名を入れておく
      var tag = $(tabs_name + "-group > input[name=tab]");
      if (tag.size() != 0) {
        tag.val($(this).attr("tab-name"));
      }

      // タブが切り替わったときにコールバックする(jqplot等用)
      //
      // 待っている方
      // $(".tabs1-group").bind("tabsshow", function(event, tab_name){$.inspect(tab_name)});
      $(tabs_name + "-group").trigger("tabsshow", $(this).attr("tab-name"));

      // 元のリンク処理の抑制
      e.preventDefault();
    });
  };
})(jQuery);
