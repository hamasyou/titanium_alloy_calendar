var Alloy, TiDomParser, moment, _;

Alloy = require('alloy');

_ = Alloy._;

moment = require('alloy/moment');

TiDomParser = require('/jp.co.mountposition.calendar/TiDomParser');

exports.fetch = function(month, callback) {
  var client, key, params, url, val;
  if (!moment.isMoment(month)) {
    month = moment(month);
  }
  params = {
    'max-results': 31,
    'start-min': month.startOf('month').format('YYYY-MM-DD'),
    'start-max': month.endOf('month').format('YYYY-MM-DD')
  };
  url = 'http://www.google.com/calendar/feeds/japanese__ja@holiday.calendar.google.com/public/full?' + ((function() {
    var _results;
    _results = [];
    for (key in params) {
      val = params[key];
      _results.push("" + key + "=" + (Ti.Network.encodeURIComponent(val)));
    }
    return _results;
  })()).join('&');
  client = Ti.Network.createHTTPClient({
    onload: function(e) {
      var entries, entry, json, res, xml, _i, _len;
      xml = Ti.XML.parseString(this.responseText);
      json = new TiDomParser().dom2Json(xml.documentElement);
      res = {};
      entries = json['feed']['entry'];
      if (!_.isArray(entries)) {
        entries = [entries];
      }
      for (_i = 0, _len = entries.length; _i < _len; _i++) {
        entry = entries[_i];
        res[entry['title']['#text']] = entry['gd:when']['startTime'];
      }
      callback.call(this, res);
      json = null;
      res = null;
      client = null;
      return callback = null;
    },
    onerror: function(e) {
      return Ti.API.warn('error #{error}');
    },
    timeout: 5000
  });
  client.open('GET', url);
  return client.send();
};
