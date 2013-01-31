var CALENDAR_WIDTH, DAY_COLOR, OUTDAY_COLOR, TILE_WIDTH, WEEK_COLOR, args, calendarMonth, col, createWeekView, day, dayOfWeek, doClick, i, moment, nextMonth, period, prevMonth, row, tile, weekView, _i, _j, _k, _len, _ref, _ref1, _ref2;

moment = require('alloy/moment');

args = arguments[0] || {};

period = args.period != null ? moment(args.period) : moment();

WEEK_COLOR = ['#FF9999', '#999999', '#999999', '#999999', '#999999', '#999999', '#91C176'];

DAY_COLOR = ['#FF0000', '#333333', '#333333', '#333333', '#333333', '#333333', '#64A515'];

OUTDAY_COLOR = ['#FF9999', '#999999', '#999999', '#999999', '#999999', '#999999', '#91C176'];

exports.TILE_WIDTH = TILE_WIDTH = Math.floor(Ti.Platform.displayCaps.platformWidth / 7);

CALENDAR_WIDTH = TILE_WIDTH * 7;

$.days.width = $.dates.width = CALENDAR_WIDTH;

$.selected = null;

doClick = function(e) {
  var _ref, _ref1, _ref2;
  if ((e.source.date != null) && !e.source._isEntry) {
    if ($.selected != null) {
      if ((_ref = $.selected.children[0]) != null) {
        _ref.backgroundImage = WPATH('/images/calendar/tile.png');
      }
    }
    $.selected = e.source;
    return (_ref1 = $.selected) != null ? (_ref2 = _ref1.children[0]) != null ? _ref2.backgroundImage = WPATH('/images/calendar/selected.png') : void 0 : void 0;
  }
};

_ref = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
  day = _ref[i];
  $.days.add(Ti.UI.createLabel({
    color: WEEK_COLOR[i],
    textAlign: 'center',
    font: {},
    text: day,
    width: TILE_WIDTH
  }));
}

$.calendar = {};

calendarMonth = moment(period);

period.date(1);

dayOfWeek = period.day();

prevMonth = moment(period).subtract('months', 1);

nextMonth = moment(period).add('months', 1);

_.defer(function() {
  return require(WPATH('holiday')).fetch(calendarMonth, function(holidays) {
    var name, ui, _ref1;
    for (name in holidays) {
      day = holidays[name];
      day = moment(day, 'YYYY-MM-DD').date();
      ui = (_ref1 = $.calendar) != null ? _ref1["" + day] : void 0;
      if ((ui != null ? ui.date : void 0) != null) {
        ui.add(Ti.UI.createLabel({
          text: name,
          font: {
            fontSize: '8dp'
          },
          color: OUTDAY_COLOR[0],
          top: 0,
          left: '2dp',
          touchEnabled: false
        }));
        ui.children[0].color = DAY_COLOR[0];
      }
    }
  });
});

col = 0;

row = 0;

createWeekView = function() {
  return Ti.UI.createView({
    layout: 'horizontal',
    width: CALENDAR_WIDTH,
    height: TILE_WIDTH
  });
};

weekView = createWeekView();

if (dayOfWeek !== 0) {
  for (i = _j = _ref1 = dayOfWeek - 1; _ref1 <= 0 ? _j <= 0 : _j >= 0; i = _ref1 <= 0 ? ++_j : --_j) {
    weekView.add(Ti.UI.createLabel({
      color: OUTDAY_COLOR[col],
      textAlign: 'center',
      text: prevMonth.daysInMonth() - i,
      font: {},
      backgroundImage: WPATH('/images/calendar/inactive.png'),
      width: TILE_WIDTH,
      height: TILE_WIDTH,
      prevMonth: true
    }));
    col++;
  }
}

for (i = _k = 1, _ref2 = period.daysInMonth(); 1 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 1 <= _ref2 ? ++_k : --_k) {
  tile = Ti.UI.createView({
    backgroundColor: 'transparent',
    width: TILE_WIDTH,
    height: TILE_WIDTH,
    date: period.unix()
  });
  tile.add(Ti.UI.createLabel({
    color: DAY_COLOR[period.day()],
    backgroundImage: WPATH('/images/calendar/tile.png'),
    font: {},
    textAlign: 'center',
    text: period.date(),
    width: TILE_WIDTH,
    height: TILE_WIDTH,
    _isEntry: false,
    touchEnabled: false
  }));
  weekView.add(tile);
  $.calendar["" + (period.date())] = tile;
  period.add('days', 1);
  col++;
  if (col === 7) {
    $.dates.add(weekView);
    weekView = createWeekView();
    col = 0;
    row++;
  }
}

while (col !== 0) {
  weekView.add(Ti.UI.createLabel({
    color: OUTDAY_COLOR[col],
    textAlign: 'center',
    text: nextMonth.date(),
    font: {},
    backgroundImage: WPATH('/images/calendar/inactive.png'),
    width: TILE_WIDTH,
    height: TILE_WIDTH,
    nextMonth: true
  }));
  nextMonth.add('days', 1);
  col++;
  if (col === 7) {
    $.dates.add(weekView);
    col = 0;
    row++;
  }
}

exports.setImage = function(day, image, options) {
  var _ref3;
  if (options == null) {
    options = {};
  }
  if (moment.isMoment(day)) {
    day = day.date();
  }
  tile = (_ref3 = $.calendar) != null ? _ref3["" + day] : void 0;
  if ((tile != null ? tile.date : void 0) != null) {
    tile.remove(tile.children[0]);
    _.extend(tile, {
      _isEntry: true
    }, options);
    return tile.add(Ti.UI.createImageView({
      image: image,
      width: TILE_WIDTH,
      height: TILE_WIDTH,
      touchEnabled: false
    }));
  }
};

exports.setView = function(day, view, options) {
  var _ref3;
  if (options == null) {
    options = {};
  }
  if (moment.isMoment(day)) {
    day = day.date();
  }
  tile = (_ref3 = $.calendar) != null ? _ref3["" + day] : void 0;
  if (tile != null) {
    _.extend(tile, options);
    return tile.add(view);
  }
};

exports.calendarMonth = function() {
  return calendarMonth;
};

exports.select = function(day) {
  var touchEvent, _ref3;
  if (moment.isMoment(day)) {
    day = day.date();
  }
  touchEvent = OS_ANDROID ? 'singletap' : 'click';
  tile = (_ref3 = $.calendar) != null ? _ref3["" + day] : void 0;
  return tile != null ? tile.fireEvent(touchEvent, {
    source: tile
  }) : void 0;
};

exports.selectedDate = function() {
  if ($.selected != null) {
    return moment.unix($.selected.date);
  } else {
    return moment();
  }
};

exports.destroy = function() {
  $.calendar = null;
  $.selected = null;
  return $.destroy();
};
