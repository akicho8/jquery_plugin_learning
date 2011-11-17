// jQuery Plugin A Part Hide
// A plugin to hide part of a long list
// Version 0.2 - 28. 5. 2011
// by Fredi Bach

(function($) {
  $.aPartHide = function(element, options) {
    var defaults = {
      showHTML: 'more ...',
      hideHTML: 'less ...',
      hidingTriggerLength: 5,
      hideToLength: 3,
      listElement: 'ul',
      listItems: 'li',
      listControlElement: '.showhide',
      showSpeed: 'fast',
      hideSpeed: 'fast',
      controlElementShowClass: 'showHTML',
      controlElementHideClass: 'hideHTML',
      onHide: function() {},
      onShow: function() {}
    }

    var plugin = this;

    plugin.settings = {}

    var $element = $(element),
      element = element;

    plugin.init = function() {
      plugin.settings = $.extend({}, defaults, options);

      if ($element.find(plugin.settings.listElement+" "+plugin.settings.listItems).length > plugin.settings.hidingTriggerLength) {
        plugin.hideElements();
        $element.find('.'+plugin.settings.controlElementShowClass).live('click',function() {
          plugin.showElements();
        });
        $element.find('.'+plugin.settings.controlElementHideClass).live('click',function() {
          plugin.hideElements();
        });
      } else {
        $element.find(plugin.settings.listControlElement).hide();
      }
    }

    plugin.hideElements = function() {
      $element.find(plugin.settings.listElement+" "+plugin.settings.listItems+":gt("+(plugin.settings.hideToLength-1)+")")
      .slideUp(plugin.settings.hideSpeed);
      $element.find(plugin.settings.listControlElement)
      .html(plugin.settings.showHTML)
      .addClass(plugin.settings.controlElementShowClass)
      .removeClass(plugin.settings.controlElementHideClass);
      plugin.settings.onHide();
    }

    plugin.showElements = function() {
      $element.find(plugin.settings.listElement+" "+plugin.settings.listItems)
      .slideDown(plugin.settings.showSpeed);
      $element.find(plugin.settings.listControlElement)
      .html(plugin.settings.hideHTML)
      .addClass(plugin.settings.controlElementHideClass)
      .removeClass(plugin.settings.controlElementShowClass);
      plugin.settings.onShow();
    }

    plugin.init();
  }

  $.fn.aPartHide = function(options) {
    return this.each(function() {
      if (undefined == $(this).data('aPartHide')) {
        var plugin = new $.aPartHide(this, options);
        $(this).data('aPartHide', plugin);
      }
    });
  }
})(jQuery);
