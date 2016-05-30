/*
 * Molly's sleep patterns
 */

// Parse the incoming date format
let dateRE = /^\s*(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+)\s*$/
  , oneDayMS = 1000 * 60 * 60 * 24;

// CSV fields: timestamp, duration
// Dataset fields: start, end, time 
var model = new CSVModel('Molly_sleep.csv', (rec, idx) => {
    let dateParts = dateRE.exec(rec.Time)
      , hours = +dateParts[4]
      , mins = +dateParts[5]
      , durationMins = +rec['Duration(minutes)']
      , start = hours + (mins / 60)
      , end = start + (durationMins / 60)
      , time = new Date(dateParts[3], dateParts[2], dateParts[1], hours, mins);
    return {
      time: time,
      start: start,
      end: end
    };
  })
  , chart = new DailyPatternChart(model);

model.loadP().then(mdl => {
  let date0 = d3.min(mdl.records.map(d => d.time))
    , date0Day = Math.floor(date0.getTime() / oneDayMS);

  mdl.records = mdl.records.map(d => ({
    start: d.start,
    end: d.end,
    idx: Math.floor(d.time.getTime()/oneDayMS) - date0Day 
  }));

  chart.renderTo(document.getElementById('frame'));
})
.catch(err => { throw err; });

