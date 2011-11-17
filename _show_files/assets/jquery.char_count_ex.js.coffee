# Character Count Plugin - jQuery plugin
# Dynamic character count for text areas and input fields
# written by Alen Grakalic
# http://cssglobe.com/post/7161/jquery-plugin-simplest-twitterlike-dynamic-character-count-for-textareas
#
# Copyright (c) 2009 Alen Grakalic (http://cssglobe.com)
# Dual licensed under the MIT (MIT-LICENSE.txt)
# and GPL (GPL-LICENSE.txt) licenses.
#
# Built for jQuery library
# http://jquery.com

$.fn.charCountEx = options ->
  defaults =
    allowed: 140
    warning: 25
    css: 'counter'
    counterElement: 'span'
    cssWarning: 'warning'
    cssExceeded: 'exceeded'
    counterText: ''

  options = $.extend(defaults, options)

  def calculate(obj)
    count = $(obj).val().length
    available = options.allowed - count
    if available <= options.warning && available >= 0
      $(obj).next().addClass(options.cssWarning)
    else
      $(obj).next().removeClass(options.cssWarning)
  
    if available < 0
      $(obj).next().addClass(options.cssExceeded)
      $(obj).next().next().attr("disabled", true)
    else
      $(obj).next().removeClass(options.cssExceeded)
      $(obj).next().next().attr("disabled", false)
  
    $(obj).next().html(options.counterText + available)
  
  # this.each( ->
  #   $(this).after('<'+ options.counterElement +' class="' + options.css + '" id=\"countText\">'+ options.counterText +'</'+ options.counterElement +'>')
  #   calculate(this)
  #   $(this).keyup(-> calculate(this))
  #   $(this).change(-> calculate(this))
  # )
