Alloy = require('alloy')
_ = Alloy._
moment = require('alloy/moment')
TiDomParser = require('/jp.co.mountposition.calendar/TiDomParser')


# @return {'成人の日' => '2013-01-14', ...}
exports.fetch = (month, callback) ->
    unless moment.isMoment(month)
        month = moment(month)

    # カレンダー取得
    params = {
        'max-results': 31
        'start-min': month.startOf('month').format('YYYY-MM-DD')
        'start-max': month.endOf('month').format('YYYY-MM-DD')
    }
    url = 'http://www.google.com/calendar/feeds/japanese__ja@holiday.calendar.google.com/public/full?' + ("#{key}=#{Ti.Network.encodeURIComponent(val)}" for key, val of params).join('&')
    client = Ti.Network.createHTTPClient({
        onload: (e) ->
            xml = Ti.XML.parseString(@responseText)
            json = new TiDomParser().dom2Json(xml.documentElement)

            res = {}
            entries = json['feed']['entry']
            entries = [entries] unless _.isArray(entries)

            res[entry['title']['#text']] = entry['gd:when']['startTime'] for entry in entries
            callback.call(this, res)

            json = null
            res = null
            client = null
            callback = null
        ,
        onerror: (e) ->
            Ti.API.warn 'error #{error}'
        timeout: 5000
    })
    client.open('GET', url)
    client.send()

