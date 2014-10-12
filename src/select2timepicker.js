(function($) {
  'use strict';

  if (window.Select2TimePicker !== undefined) {
    return;
  };

  if (window.Select2 === undefined) {
    console.log('select2 plugin not loaded, load select2 before loading select2timepicker');
    return;
  };

  var parseToMinutes = function(time) {
    var tokenizedTime = time.split(':');

    return (parseInt(tokenizedTime[0]) * 60) + parseInt(tokenizedTime[1]);
  };

  var parseToString = function(minutes) {
    var hour   = Math.floor(minutes / 60).toString();
    var minute = (minutes % 60).toString();

    if (hour.length == 1) { hour = '0' + hour; }
    if (minute.length == 1) { minute = '0' + minute; }

    return hour + ':' + minute;
  };

  var tagsBuilder = function(options) {
    var from     = options.from == null ? 0 : parseToMinutes(options.from);
    var to       = options.to == null ? 1440 : parseToMinutes(options.to);
    var interval = options.interval == null ? 15 : options.interval;
    var items    = options.items == null ? [] : options.items;

    var times = [];

    for (var auxFrom = from ; auxFrom < to ; auxFrom += interval) {
      var time = parseToString(auxFrom);

      times = times.concat({ id: time, text: time, totalMinutes: auxFrom, pairedItems: [] });
    }

    $.each(items, function(index, item) {
      $.each(item.times, function(index, time) {
        var totalMinutes = parseToMinutes(time),
            low          = 0,
            high         = times.length,
            mid          = 0;

        while (low < high) {
          mid = low + high >> 1;

          if (times[mid].totalMinutes < totalMinutes) {
            low = ++mid;
          } else {
            high = mid;
          }
        }

        if (times[mid].id == time) {
          times[mid].pairedItems.push(item.name);
        } else {
          times.splice(mid, 0, { id: time, text: time, totalMinutes: totalMinutes, pairedItems: [item.name] });
        }
      })
    });

    return times;
  };

  window.Select2TimePicker = function(element) {
    this.element  = element;
    this.$element = $(element);
    this.options  = $.extend({}, $.fn.select2timepicker.defaults);
    this.select2options = $.extend({}, $.fn.select2timepicker.defaults.select2);
    delete this.options.select2;
  };

  var Select2TimePickerFunctions = {
    init: function(options) {
      if (options !== undefined) {
        $.extend(this.options, options);
        $.extend(this.select2options, options.select2);
        delete this.options.select2;
      }

      this.initSelect2();

      this.$element.data('select2timepicker', this);
    },

    initSelect2: function() {
      this.$element.select2(this.buildSelect2Options());

      this
        .$element
        .on('select2-selecting', function(e) {
          if (/^([0-9]|[0-1][0-9]|[2][0-3]):[0-5][0-9]$/.test(e.val) == false) {
            e.preventDefault();
            return;
          }

          if (e.val.length == 4) {
            // happens when hour is single digit, normalize
            e.object.id   = '0' + e.object.id;
            e.object.text = '0' + e.object.text;
          }
        });
    },

    buildSelect2Options: function() {
      var self = this;

      return $.extend(this.select2options, {
        minimumInputLength: 0,
        maximumInputLength: 5,

        tags: tagsBuilder(this.options),

        matcher: function(term, text) {
          if (term.length == 1) {
            if (['3', '4', '5', '6', '7', '8', '9'].indexOf(term[0]) != -1) {
              return text.indexOf('0' + term) == 0;
            } else {
              return text.indexOf(term) == 0 || text.indexOf('0' + term) == 0;
            }
          } else if (term[1] == ':') {
            return text.indexOf(('0' + term)) == 0;
          } else {
            return text.indexOf(term) == 0;
          }
        },

        formatSelection: function(item) {
          if (item.pairedItems == null || item.pairedItems.length == 0) {
            return self.options.singleSelection(item);
          } else {
            return self.options.multiSelection(item);
          }
        },

        formatResult: function(item, container, query, escapeMarkup) {
          var markup = [], markedupText;
          window.Select2.util.markMatch(item.text, query.term, markup, escapeMarkup);
          markedupText = markup.join('');

          if (item.pairedItems == null || item.pairedItems.length == 0) {
            return self.options.singleResult(item, markedupText);
          } else {
            return self.options.multiResult(item, markedupText);
          }
        },

        createSearchChoice: function(term, data) {
          if(/^([0-2]|([0-9]|[0-1][0-9]|[2][0-3])|([0-9]|[0-1][0-9]|[2][0-3]):|([0-9]|[0-1][0-9]|[2][0-3]):[0-5]|([0-9]|[0-1][0-9]|[2][0-3]):[0-5][0-9])$/.test(term)) {
            return { id: term, text: term };
          }
        },

        formatNoMatches: function(term) {
          return self.options.invalidFormat(term);
        }
      });
    }
  };

  $.extend(window.Select2TimePicker.prototype, Select2TimePickerFunctions);

  $.fn.select2timepicker = function(options, select2Options) {
    if (this.length == 0) { return this; }

    return this.each(function() {
      new window.Select2TimePicker(this).init(options);
    });
  };

  $.fn.select2timepicker.defaults = {
    from:     null,
    to:       null,
    interval: 15,
    items:    [],

    singleSelection: function(item) { return '<div>' + item.text + '</div>'; },
    multiSelection:  function(item) { return '<div><b>' + item.text + '</b></div>'; },
    singleResult:    function(item, markedupText) { return '<div>' + markedupText + '</div>'; },
    multiResult:     function(item, markedupText) { return '<div><b>' + markedupText + '</b><span>' + item.pairedItems.join(', ') + '</span></div>'; },
    invalidFormat:   function(term) { return 'Invalid time format, must follow the format hh:mm'; },

    select2: {
      // you can still mess around with select2 by passing options in here
      // except the following values will always be overridden by select2timepicker:
      // - minimumInputLength
      // - maximumInputLength
      // - tags
      // - matcher
      // - formatSelection
      // - formatResult
      // - createSearchChoice
      // - formatNoMatches
    }
  };
})(jQuery);