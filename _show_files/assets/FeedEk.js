(function($){
  $.fn.FeedEk = function(opt){
    var options = {
      FeedUrl:'',
      MaxCount:5,
      ShowDesc:true,
      ShowPubDate:true
    };

    if (opt) {
      $.extend(options, opt);
    }

    var idd = $(this).attr('id');
    if(options.FeedUrl==null||options.FeedUrl==''){
      $('#' + idd).empty();
      return;
    }

    var pubdt;

    $('#'+idd).empty().append('<div style="text-align:left;padding:3px;"><img src="loader.gif"/></div>');
    $.ajax({
      url:'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num='+options.MaxCount+'&output=json&q='+encodeURIComponent(options.FeedUrl)+'&callback=?',dataType:'json',success:function(data){
        $('#'+idd).empty();
        $.each(data.responseData.feed.entries,function(i,entry){
          $('#'+idd).append('<div class="ItemTitle"><a href="'+entry.link+'" target="_blank" >'+entry.title+'</a></div>');
          if (options.ShowPubDate) {
            pubdt = new Date(entry.publishedDate);
            $('#' + idd).append('<div class="ItemDate">' + pubdt.toLocaleDateString() + '</div>')
          }
          if (options.ShowDesc)
            $('#'+idd).append('<div class="ItemContent">'+entry.content+'</div>')
        })
      }
    })
  }
})(jQuery);
