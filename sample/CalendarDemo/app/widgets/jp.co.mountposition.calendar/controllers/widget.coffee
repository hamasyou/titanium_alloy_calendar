moment = require('alloy/moment')

args = arguments[0] or {}
period = if args.period? then moment(args.period) else moment() # 表示年月


# 曜日の文字色(Sun, Mon, ... Sat)
WEEK_COLOR = ['#FF9999', '#999999', '#999999', '#999999', '#999999', '#999999', '#91C176']

# 今月の文字色
DAY_COLOR = ['#FF0000', '#333333', '#333333', '#333333', '#333333', '#333333', '#64A515']

# 今月以外の文字色
OUTDAY_COLOR = ['#FF9999', '#999999', '#999999', '#999999', '#999999', '#999999', '#91C176']

# 表示マスのサイズ
exports.TILE_WIDTH = TILE_WIDTH = Math.floor(Ti.Platform.displayCaps.platformWidth / 7)

# カレンダーの横幅
CALENDAR_WIDTH = TILE_WIDTH * 7
$.days.width = $.dates.width = CALENDAR_WIDTH

# 選択されている日のラベルオブジェクト
$.selected = null


# カレンダーの選択処理
doClick = (e) ->
    if e.source.date? and not e.source._isEntry
        # 背景色を変えるのは Label 部分
        if $.selected?
            $.selected.children[0]?.backgroundImage = WPATH('/images/calendar/tile.png')
        $.selected = e.source
        $.selected?.children[0]?.backgroundImage = WPATH('/images/calendar/selected.png')


#
# 曜日
#
for day, i in ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    $.days.add(Ti.UI.createLabel({
        color: WEEK_COLOR[i]
        textAlign: 'center'
        font: {}
        text: day
        width: TILE_WIDTH
    }))

#
# 日付
#

$.calendar = {}   # カレンダーオブジェクト {'1' => Ti.UI.View, '2' => Ti.UI.View ...}
calendarMonth = moment(period)

period.date(1)
dayOfWeek = period.day()    # 今月の最初の曜日
prevMonth = moment(period).subtract('months', 1)
nextMonth = moment(period).add('months', 1)


# 祝日の取得
# 非同期処理
_.defer ->
    require(WPATH('holiday')).fetch calendarMonth, (holidays) ->
        for name, day of holidays
            day = moment(day, 'YYYY-MM-DD').date()
            ui = $.calendar?["#{day}"]
            if ui?.date? # 登録がない
                # 祝日の表示
                ui.add(Ti.UI.createLabel({
                    text: name
                    font: {fontSize: '8dp'}
                    color: OUTDAY_COLOR[0]
                    top: 0
                    left: '2dp'
                    touchEnabled: false
                }))
                # ラベルを赤くする
                ui.children[0].color = DAY_COLOR[0]
        return

col = 0
row = 0

# 一週間分のビュー
createWeekView = -> Ti.UI.createView({layout: 'horizontal', width: CALENDAR_WIDTH, height: TILE_WIDTH})
weekView = createWeekView()

# 前月の表示
if dayOfWeek != 0 # Not Sunday
    for i in [dayOfWeek-1..0]
        weekView.add(Ti.UI.createLabel({
            color: OUTDAY_COLOR[col]
            textAlign: 'center'
            text: prevMonth.daysInMonth() - i
            font: {}
            backgroundImage: WPATH('/images/calendar/inactive.png')
            width: TILE_WIDTH
            height: TILE_WIDTH
            prevMonth: true
        }))
        col++

# 今月の表示
for i in [1..period.daysInMonth()]
    tile = Ti.UI.createView({
        backgroundColor: 'transparent'
        width: TILE_WIDTH
        height: TILE_WIDTH
        date: period.unix()
    })

    tile.add(Ti.UI.createLabel({
        color: DAY_COLOR[period.day()]
        backgroundImage: WPATH('/images/calendar/tile.png')
        font: {}
        textAlign: 'center'
        text: period.date()
        width: TILE_WIDTH
        height: TILE_WIDTH
        _isEntry: false
        touchEnabled: false
    }))
    weekView.add(tile)
    $.calendar["#{period.date()}"] = tile

    period.add('days', 1)
    col++
    if col is 7 # 週の最後
        $.dates.add(weekView)
        weekView = createWeekView()
        col = 0
        row++

# 来月の表示
until col is 0
    weekView.add(Ti.UI.createLabel({
        color: OUTDAY_COLOR[col]
        textAlign: 'center'
        text: nextMonth.date()
        font: {}
        backgroundImage: WPATH('/images/calendar/inactive.png')
        width: TILE_WIDTH
        height: TILE_WIDTH
        nextMonth: true
    }))
    nextMonth.add('days', 1)
    col++
    if col is 7 # 週の最後
        $.dates.add(weekView)
        col = 0
        row++


#
# 指定日に画像を表示する
#
# @param {Intenger or String or moment} day 日
# @param {String or Blob} image 画像
# @param {Object} options 画像を表示する日に設定するオプション
#
exports.setImage = (day, image, options = {}) ->
    if moment.isMoment(day)
        day = day.date()

    tile = $.calendar?["#{day}"]
    if tile?.date?
        tile.remove(tile.children[0])

        _.extend(tile, {_isEntry: true}, options)
        tile.add(Ti.UI.createImageView({
            image: image
            width: TILE_WIDTH
            height: TILE_WIDTH
            touchEnabled: false
        }))

#
# 指定日に指定された Ti.UI.View オブジェクトを add する
#
# @param {Integer or String or moment} day 日
# @param {Ti.UI.View} view 表示する View
# @param {Object} options 表示する日に設定するオプション
#
exports.setView = (day, view, options = {}) ->
    if moment.isMoment(day)
        day = day.date()

    tile = $.calendar?["#{day}"]
    if tile?
        _.extend(tile, options)
        tile.add(view)


#
# カレンダー表示日付を返す
#
# @return {moment}
#
exports.calendarMonth = ->
    calendarMonth

#
# カレンダー上の指定日を選択状態にする
#
# @param {Integer or String or moment} day 日
#
exports.select = (day) ->
    if moment.isMoment(day)
        day = day.date()

    touchEvent = if OS_ANDROID then 'singletap' else 'click'
    tile = $.calendar?["#{day}"]
    tile?.fireEvent touchEvent, {source: tile}


#
# 選択されている日付を返す
#
# @return {Moment} 選択されている日付。選択されていない場合は現在日付を返す
exports.selectedDate = () ->
    if $.selected? then moment.unix($.selected.date) else moment()


exports.destroy = ->
    $.calendar = null
    $.selected = null
    $.destroy()