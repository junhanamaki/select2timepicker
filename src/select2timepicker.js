(function($) {
  'use strict';

  if (window.Select2TimePicker !== undefined) {
    return;
  };

  if (window.Select2 === undefined) {
    console.log('select2 plugin not loaded, load select2 before loading select2timepicker');
    return;
  };

  var isValidSelection = function(time) {
    return /^([0-9]|[0-1][0-9]|[2][0-3]):[0-5][0-9]$/.test(time);
  };

  var isValidChoice: function(time) {
    return /^([0-2]|([0-9]|[0-1][0-9]|[2][0-3])|([0-9]|[0-1][0-9]|[2][0-3]):|([0-9]|[0-1][0-9]|[2][0-3]):[0-5]|([0-9]|[0-1][0-9]|[2][0-3]):[0-5][0-9])$/.test(time);
  };

  var parseToMinutes = function(string) {
    var tokenizedTime = time.split(':');

    return (parseInt(tokenizedTime[0]) * 60) + parseInt(tokenizedTime[1]);
  };

  var parseToString = function(minutes) {
    var hour   = Math.floor(minutes / 60).toString();
    var minute = (minutes % 60).toString();

    if (hour.length == 1) { hour = '0' + hour; }
    if (minute.length == 1) { minute = '0' + minute; }

    return hour + ':' + minute;
  },

  var timesBuilder = function(options) {
    var from = options.from == null ? 0 : parseToMinutes(options.from);
    var to = options.to == null ? 1440 : parseToMinutes(options.to);
    var interval = options.interval == null = 15 : options.interval;
    var times = [];

    for (auxFrom = from ; auxFrom < to ; auxFrom += interval) {
      var time = parseToString(auxFrom);

      times = times.concat({ id: time, text: time, totalMinutes: auxFrom, pairedItems: [] });
    }

    $.each(options.items, function(index, item) {
      $.each(items.times, function(index, time) {
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
    this.element = element;
    this.$element = $(element);
    this.options = $.extend({}, $.fn.select2timepicker.defaults);
  };

  var Select2TimePickerFunctions = {
    initialize: function(options) {
      $.extend(this.options, options);

      this.$element.select2(select2Options);

      this
        .$element
        .on('select2-selecting', function(e) {
          if (isValidSelection(e.val) == false) {
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

    buildSelect2Options: function(options) {
      var self = this;

      return {
        minimumInputLength: 0,
        maximumInputLength: 5,

        tag: ,
        dropdownCssClass: this.options.dropdownCssClass,

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
          if (isValidChoice(term)) {
            return { id: term, text: term };
          }
        },

        formatNoMatches: function(term) {
          return 'Invalid time format, format must be hh:mm';
        }
      };
    }
  };

  $.fn.select2timepicker = function(options) {
    if (this.length == 0) { return this; }

    return this.each(function() {
      new window.Select2TimePicker(this).init(options);
    });
  };

  $.fn.select2timepicker.defaults = {
    from:     0,
    to:       1440,
    interval: 15,
    items:    [],

    dropdownCssClass: '',

    singleSelection: function(item) { return '<div>' + item.text + '</div>'; },
    multiSelection:  function(item) { return '<div><b>' + item.text + '</b></div>'; },
    singleResult:    function(item, markedupText) { return '<div>' + markedupText + '</div>'; },
    multiResult:     function(item, markedupText) { return '<div><b>' + markedupText + '</b><span>' + item.pairedItems.join(', ') + '</span></div>'; },
    invalidFormat:   function(term) { return 'Invalid time format, must follow the format hh:mm'; }
  };
})(jQuery);