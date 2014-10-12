## Select2TimePicker

Time selector with a few tricks

## What is it

Select2TimePicker is a jQuery plugin powered by Select2, which allows to select
time from a predetermined list, or by accepting user input. Besides that, it also
shows in the list the events that are happening that that time.

## Dependencies

  * [jQuery](https://github.com/jquery/jquery)
  * [Select2](https://github.com/ivaynberg/select2)

## Usage

1. Create html input

    <input id='target'></input>

2. Start the plugin

  2.1 With default configuration

    $('input#target').select2timepicker();

  2.2 Setting the range of times to display and the interval

    $('input#target').select2timepicker({
        from:     '05:00',
        to:       '18:00',
        interval: 10
      });

  2.3 With a collection of items to show in the list

    $('input#target').select2timepicker({
        from: '05:00',
        to:   '18:00',
        interval: 10,
        items: [
          { name: 'Wake up', times: ['05:20'] },
          { name: 'Dance', times: ['05:20'] },
          { name: 'Eat', times: ['07:00', '13:00'] },
          { name: 'Drink', times: ['07:14'] }
        ]
      });

  2.4 With customized select2

    $('input#target').select2timepicker({
        select2: {
          width: '100%'
        }
      });

## Test drive

You can try it out at http://jsfiddle.net/csad0g6s/3/