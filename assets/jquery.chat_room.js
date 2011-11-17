// Twitter専用クライアント

;(function($) {
  function timeago_setting() {
    $.extend($.timeago.settings.strings, {
      suffixAgo: "前",
      suffixFromNow: "後",
      seconds: "数秒",
      minute: "1分",
      minutes: "%d分",
      hour: "1時間",
      hours: "2時間",
      day: "1日",
      days: "%d日",
      month: "1ヶ月",
      months: "%dヶ月",
      year: "1年",
      years: "%d年",
      dummy: 0
    });
  };

  // クラスメソッドっぽい使い方
  $.chat_room = function(options) {
    // $.fx.off = true;
    timeago_setting();
    // FIXME: できれば $chat_room.options をローカルにしたい
    $.chat_room.options = $.extend({}, $.chat_room.default_settings, options);
    $.chat_room.startup();
  };

  $.chat_room.default_settings = {
    twitter_query_key: null,                  // 部屋名(ハッシュやURL。別になんでもいい)
    reload_interval: 10,                       // リロード間隔(秒数)
    rows_limit: 5,                        // タイムライン表示行数
    post_path: "/social/stream",               // POSTで投稿するときのパス
    allowed_char_count: 110,                   // 入力可能な文字数
    tweet_rows_selector: "#tweet_rows",        // タイムラインを流す場所
    tweet_input_selector: "#form1 input:text", // メッセージの入力場所
    tweet_send_selector: "#message_send",      // メッセージの送信タグ
    dummy: 0
  };

  $.extend($.chat_room, {
    startup: function() {
      // 入力可能な残り文字数の表示
      if ($.chat_room.options.tweet_input_selector) {
        $($.chat_room.options.tweet_input_selector).charCount({allowed: $.chat_room.options.allowed_char_count});
      }

      // 最初のツイートを読み込んで表示
      $.chat_room.streams_reload();

      // メッセージを入力されたら投稿リンクを表示
      if ($.chat_room.options.tweet_input_selector) {
        $($.chat_room.options.tweet_input_selector).bind("keyup change mouseout", function(){
          if ($.trim($(this).val()) == "") {
            $($.chat_room.options.tweet_send_selector).fadeOut();
          } else {
            $($.chat_room.options.tweet_send_selector).fadeIn();
          }
        });
      }

      // フィルタ編集モードのときリロードが発生するとグダグダになるので通常のときだけリロードする
      if ($.chat_room.options.filter_edit_mode) {
      } else {
        if ($.chat_room.options.reload_interval) {
          setInterval($.chat_room.streams_reload, 1000 * $.chat_room.options.reload_interval);
        }
      }

      // 投稿ボタンクリックの処理
      $($.chat_room.options.tweet_send_selector).click(function(e){
        $.post($.chat_room.options.post_path, {
          tw_message: $($.chat_room.options.tweet_input_selector).val(), // 投稿する発言内容
        }, function(data) {
          // 正常にレスポンスが返ってきたときの処理。
          // レスポンスがあるだけで実際に投稿されたかどうかは別。
          $($.chat_room.options.tweet_send_selector).fadeOut();
          $($.chat_room.options.tweet_input_selector).val("");

          if (true) {
            // 残り入力文字数を元に戻す。もっとかっこいい戻し方があるはず。
            $("#countText").text($.chat_room.options.allowed_char_count);
          }

          // Twitterに正しく投稿できたら行の一番上にスルっと入れる
          if (data.id) {
            $($.chat_room.options.tweet_rows_selector).prepend($.chat_room.build_message(data, "display:none"));
            $(".tweet_row:first").show(1000);
          }
        });

        // false を返すとイベントは停止されるようだけど念のため入れている
        e.preventDefault();
        e.stopPropagation();

        return false;
      });
    },

    build_message: function(obj, style) {
      var out = "";
      if (obj.display_flag || $.chat_room.options.filter_edit_mode) {
        out += "<div style='" + style + "' class='tweet_row " + "display_" + obj.display_flag + "' id='tweet-" + obj.id + "'>";
        out += "<a href='http://twitter.com/" + obj.from_user + "' class='tweet_user'>";
        out += "<img width=\"48\" height=\"48\" alt='" + obj.from_user + " on Twitter' src='" + obj.profile_image_url + "' />";
        out += "</a>"
        out += "<span class=\"text\">" + $.chat_room.linkify(obj.text) + "<\/span>";
        out += "<br/>";
        out += "<abbr class=\"timeago\" title=\"" + obj.created_at + "\">" + $.timeago(new Date(obj.created_at)).replace(" ", "") + "<\/abbr>";
        out += " - ";
        out += "<span class=\"from_user\">" + obj.from_user + "<\/span>";
        if ($.chat_room.options.tweet_allow_flag && $.chat_room.options.filter_edit_mode) {
          out += "<span class=\"click_button-good button blue small\" id=\"click_button-" + obj.id + "\">" + "Good" + "<\/span>";
          out += "<span class=\"click_button-bad button red  small\" id=\"click_button-" + obj.id + "\">" + "Bad"  + "<\/span>";
          out += "<span class=\"click_type button green small\" id=\"click_type-" + obj.id + "\">" + obj.display_flag_str + "<\/span>";
          out += "<span class=\"click_status\" id=\"click_status-" + obj.id + "\">" + ""  + "<\/span>";
        }
        if ($.chat_room.options.debug_mode) {
          out += "<span class=\"debug\">" + obj.id + "<\/span>";
        }
        out += "</div>";
      }
      return out;
    },

    streams_reload: function() {
      var url;
      var since_id = $(".tweet_row:first").attr("id");
      if (since_id) {
        since_id = since_id.replace("tweet-", "");
      }

      if ($.chat_room.options.tweet_allow_flag) {
        // フィルタが必要なのでアプリの方から取得する
        var params = {q: $.chat_room.options.twitter_query_key, filter_edit_mode: $.chat_room.options.filter_edit_mode};
        if (since_id) {
          $.extend(params, {since_id: since_id});
        }
        url = $.chat_room.options.tweet_filter_url + "?" + "callback=?" + "&" + $.param(params);
      } else {
        // 直接 Twitter の方から取得する
        // url = "http://search.twitter.com/search.json?callback=?&q=%23" + $.chat_room.options.twitter_query_key + "&";
        // if (since_id) {
        //   url = base_url + "since_id=" + since_id;
        // } else {
        //   url = base_url + "rpp=" + $.chat_room.options.rows_limit;
        // }
        var params = {q: $.chat_room.options.twitter_query_key};
        if (since_id) {
          $.extend(params, {since_id: since_id});
        } else {
          $.extend(params, {rpp: $.chat_room.options.rows_limit});
        }
        url = "http://search.twitter.com/search.json" + "?" + "callback=?" + "&" + $.param(params);
      }

      // $.getJSON("http://localhost:3000/top/simple_stream_test?callback=?", {k1:1, k2:2}, function(data, status, XMLHttpRequest) {alert(status); alert(data.foo);});

      // JSONPで取得
      $.getJSON(url, function(data) {
        if (data.debug_info) {
          $("#debug_area").prepend("<div>" + data.debug_info + "</div>");
        }

        var rows = [];
        $(data.results).each(function() {
          if (this.id == undefined) { // このチェックは不要かもしれない
            return;
          }
          rows.push($.chat_room.build_message(this, ""));
        });
        $($.chat_room.options.tweet_rows_selector).prepend(rows.join(""));

        var new_elements = $($.chat_room.options.tweet_rows_selector).children(":lt(" + rows.size() + ")");
        if (true) {
          // new_elements.css("background", "red");
          new_elements.hide();
          // new_elements.filter(":even").css({backgroundColor: "#eee"});
          new_elements.css({backgroundColor: "#eee"});
          new_elements.fadeIn("slow");
        }

        if ($.chat_room.options.tweet_allow_flag && $.chat_room.options.filter_edit_mode) {
          // FIXME: tweet_since_number は $(this).parent().attr("id") で取れるならあこちで id を書かなくてもよい
          new_elements.find(".click_button-good").click(function(e){
            var tweet_since_number = $(this).attr("id");
            tweet_since_number = tweet_since_number.replace("click_button-", "");
            // $("#tweet-" + tweet_since_number).children("[class|=click_button]").hide();
            $.post($.chat_room.options.tweet_allow_info_url, {tweet_allow_info:{tweet_since_number:tweet_since_number, display_flag:true}}, function(data, status, XMLHttpRequest){
              if (data.status == "success") {
                $("#click_type-" + tweet_since_number).text("Good設定済み")
                $("#tweet-" + tweet_since_number).fadeTo("fast", 0.5);
                // $("#tweet-" + tweet_since_number).find(".button").css("background", "red");
              } else {
                alert(data.message);
              }
            });
          });
          new_elements.find(".click_button-bad").click(function(e){
            var tweet_since_number = $(this).attr("id");
            tweet_since_number = tweet_since_number.replace("click_button-", "");
            // $(this).hide("fast");
            $.post($.chat_room.options.tweet_allow_info_url, {tweet_allow_info:{tweet_since_number:tweet_since_number, display_flag:false}}, function(data, status, XMLHttpRequest){
              if (data.status == "success") {
                $("#click_type-" + tweet_since_number).text("Bad設定済み")
                $("#tweet-" + tweet_since_number).fadeTo("fast", 0.2);
                // alert(data.message);
              } else {
                alert(data.message);
              }
            });
          });
        }

        // $($.chat_room.options.tweet_rows_selector).children(":lt(" + rows.size() + ")").css("background", "red");
        // $("#main").children(":lt(2)").hide();
        // $("#main").children(":lt(2)").fadeIn(3000);
        // getJSONのブロックの中で呼ぶこと(getJSONは非同期なのでこのブロックの外で設定してもまだ .tweet_row が存在しないため)
        // $(".tweet_row:even").css({backgroundColor: "#eee"});

        $(".tweet_row:gt(" + $.chat_room.options.rows_limit + ")").remove();
      });

      $("<div>" + url + "</div>").prependTo("#debug_area");
    },

    // modified from TwitterGitter by David Walsh (davidwalsh.name)
    // courtesy of Jeremy Parrish (rrish.org)
    linkify: function(text) {
      return text.replace(/(https?:\/\/[\w\-:;?&=+.%#\/]+)/gi, '<a href="$1">$1</a>')
      .replace(/(^|\W)@(\w+)/g, '$1<a href="http://twitter.com/$2">@$2</a>')
      .replace(/(^|\W)#(\w+)/g, '$1#<a href="http://search.twitter.com/search?q=%23$2">$2</a>');
    },

    test_my_func1: function(value) {
      alert(value);
      alert($.chat_room.options.twitter_query_key);
    },

    test_my_func3: function(value) {
      alert($.chat_room.options.rows_limit);
      __private_method1(123);
    },

    dummy: function() {
    }
  });

  $.fn.chat_room = function() {
    // ここで全部かくとローカルになるのか？
  };

  // ここに書くと private method っぽくなる
  function __private_method1(x) {
    alert(x);
  };

})(jQuery);
