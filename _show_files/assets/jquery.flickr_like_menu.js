// 2011-06-29 HTMLからjs化した(だけなのでセレクタが固定になっている) by A.Ikeda

$.flickr_like_menu = function() {
  $("#flmenu img.arrow").click(function(){

    $("span.head_menu").removeClass("active");

    submenu = $(this).parent().parent().find("div.sub_menu");

    if(submenu.css("display")=="block"){
      $(this).parent().removeClass("active");
      submenu.hide();
      $(this).attr("src", "images/flickr_like_menu/arrow_hover.png");
    }else{
      $(this).parent().addClass("active");
      submenu.fadeIn();
      $(this).attr("src", "images/flickr_like_menu/arrow_select.png");
    }

    $("div.sub_menu:visible").not(submenu).hide();
    $("#flmenu img.arrow").not(this).attr("src", "images/flickr_like_menu/arrow.png");

  })
  .mouseover(function(){ $(this).attr("src", "images/flickr_like_menu/arrow_hover.png"); })
  .mouseout(function(){
    if($(this).parent().parent().find("div.sub_menu").css("display")!="block"){
      $(this).attr("src", "images/flickr_like_menu/arrow.png");
    }else{
      $(this).attr("src", "images/flickr_like_menu/arrow_select.png");
    }
  });

  $("#flmenu span.head_menu").mouseover(function(){ $(this).addClass("over")})
  .mouseout(function(){ $(this).removeClass("over") });

  $("#flmenu div.sub_menu").mouseover(function(){ $(this).fadeIn(); })
  .blur(function(){
    $(this).hide();
    $("span.head_menu").removeClass("active");
  });

  $(document).click(function(event){
    var target = $(event.target);
    if (target.parents("#flmenu").length == 0) {
      $("#flmenu span.head_menu").removeClass("active");
      $("#flmenu div.sub_menu").hide();
      $("#flmenu img.arrow").attr("src", "images/flickr_like_menu/arrow.png");
    }
  });
};
