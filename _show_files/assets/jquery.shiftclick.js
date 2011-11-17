/*
 * Copyright (c) 2008 John Sutherland <john@sneeu.com>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * 2011-02-02 bugfix
 * ・ロード直後に shift + click したときの undefined last_selected のエラー修正
 * ・設定後に change() を呼ぶように変更
 * ・名前の変更
 */

(function($) {
  //
  // 仕様
  // ・最初にクリックしたところのインデックスを保持する
  // ・shiftを押しながらクリックしたときは保持したインデックスの上下に対してそのインデックスの値を広げていく
  // ・shiftなしでクリックしたらインデックスは移動する
  //
  $.fn.shiftclick = function() {
    var last_selected;
    var check_boxes = $(this);

    this.each(function() {
      $(this).click(function(ev) {
        if (ev.shiftKey && last_selected) {
          var last = check_boxes.index(last_selected);
          var first = check_boxes.index(this);
          // console.debug([first, last]);

          var start = Math.min(first, last);
          var end = Math.max(first, last);

          var flag = last_selected.checked;
          for (var i = start; i < end; i++) {
            check_boxes[i].checked = flag;
            $(check_boxes[i]).change(); // これを呼ばないとマウスでクリックしたのと同じ挙動にならない
          }
        } else {
          last_selected = this;
        }
      })
    });
  };
})(jQuery);
