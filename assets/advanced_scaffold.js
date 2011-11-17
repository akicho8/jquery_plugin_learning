// 2011-06-13 jQuery 1.6.1 だと動かなかったので  $(this).data("checkbox_all_flag", true/false) のところを修正

//
// 確認画面用。
// 編集画面のフォーム内にある class="_with_confirm_submit" の通常リンクをクリックすると、
// 自分を囲むフォームに _confirm_submit=true をつけてそのフォームをsubmitする。
//
jQuery(function($){
  $("._with_confirm_submit").click(function(e){
    var form = $(this).parents("form");
    form.append('<input type="hidden" name="_confirm_submit" value="true" />'); // </form> の直前に埋める
    e.preventDefault(); // リンクの処理は無効にする
    form.submit();
  });
});

//
// 一覧用の row_checkbox_tag 用
// チェックマークをチェックすると対応するチェックボックス全体に作用する
//
jQuery(function($){
  //
  // 制御リンクがクリックされたら全チェックボックスを変更する
  //
  $("table.list th.checkbox") // 使いやすいようにアイコン画像だけでなくth全体をクリック領域にする
  .css("cursor", "pointer")   // aリンクは設定してないのでかわりにマウスオーバー時にハンドマークにする
  .click(function(e){
    // console.debug("全体制御cb" + " " + e.shiftKey);

    // 全体のトグル状態は自分自身に保持する
    // TODO: shiftボタンでトグル対応
    if ($(this).data("checkbox_all_flag")) {
      $(this).data("checkbox_all_flag", false);
    } else {
      $(this).data("checkbox_all_flag", true);
    }
    // $.inspect($(this).data("checkbox_all_flag"));

    // 他のtableに影響がないよう、自分が所属するtableに上がってから下りて全体に設定する。
    // ただ設定しただけだとchangeイベントが発動しないしようなので呼んで行の色を変更する。
    $(this).parents("table").find(".checkbox :checkbox").attr("checked", $(this).data("checkbox_all_flag")).change();
  });

  var cb_list = $("table.list tbody .checkbox input:checkbox");

  // SHIFT + Click で連続トグル
  cb_list.shiftclick();

  // 行チェックボックスに変化があったらその行の色を変更する(色をつけるかどうかの問題なので別になくてもいい)
  cb_list.change(function(e){
    // console.debug("行の左端のcbに変化あり");
    $(this).parents("tr").toggleClass("context-menu-selection", $(this).is(":checked"));
  }).change(); // リロード時にも反映させたいため

  // TODO: 以下はかろうじて動くけど予測以上のチェインが発生しているようなので理解してから実装する
  //
  // // チェックボックス自体が押されたらチェックする(これなんで自動的に反応しない？)
  // cb_list.click(function(e){
  //   // console.debug("行の左端のcb");
  //   $(this).attr("checked", $(this).is(":checked") ? "" : "checked");
  //   // e.preventDefault();
  //   // e.stopPropagation();
  // });
  //
  // // 行のどこがクリックされてもチェックボックスをトグルする
  // // これを入れるとチェックボックスが反応しなくなるのはなぜだろう
  // $("table.list tbody td").click(function(e){
  //   // console.debug("行全体");
  //   // クリックしたtdと並列にあるtd(自分を含む)→checkboxクラスがついているもの(左端のtdがマッチ)→その中にあるinputがチェックボックス
  //   var cb = $(this).siblings().andSelf().filter(".checkbox").find("input");
  //   // チェックボックスを反転して行の色を変更するためにchangeイベントを呼ぶ(自動的に呼ぶ方法はないのか)
  //   cb.attr("checked", cb.is(":checked") ? "" : "checked").change();
  // });
});

//
// 一覧の collapsible_content_tag 用
// fieldset legend の兄弟の div をトグル
//
jQuery(function($){
  $(".collapsible > legend").click(function(e){
    var fieldset = $(this).parents("fieldset");
    if (fieldset.hasClass("collapsed")) {
      fieldset.removeClass("collapsed");
      $(this).siblings("div").show();
    } else {
      fieldset.addClass("collapsed");
      $(this).siblings("div").hide();
    }
  });
});

//
// サムネ画像にマウスオーバーされたら大きいサイズに変更する
//
if (false) {
  jQuery(function($){
    $("table.list tbody td a img").hover(
      function(){
        $(this).attr("src", $(this).attr("src").replace(/tiny/, "double_half"));
      },
      function(){
        $(this).attr("src", $(this).attr("src").replace(/double_half/, "tiny"));
      });
  });
}
