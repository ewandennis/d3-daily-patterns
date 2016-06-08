'use strict';

/*
 * Molly's sleep and feeding patterns: 0-6 months
 */

// Parse the slightly odd incoming date format
function parseTimestamp(timestr) {
  let dateRE = /^\s*(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+)\s*$/
    , dateParts = dateRE.exec(timestr)
    , hours = +dateParts[4]
    , mins = +dateParts[5];
    return new Date(dateParts[3], dateParts[2], dateParts[1], hours, mins);
}

let svg = d3.select('#canvas'); 

let chart = new PeriodicPatternChart(svg, { centreWidth: 10 });

let sleepModel = new CSVModel('Molly_sleep.csv', (rec, idx) => ({
  start: parseTimestamp(rec.Time),
  duration: +rec['Duration(minutes)'] * 60 * 1000
}));

let eatModel = new CSVModel('Molly_nursing.csv', (rec, idx) => { 
  let duration = (+rec['Left duration'] + +rec['Right duration']) * 60 * 1000;
  // Short events don't render well on cycles close to the centre
  if (duration < 10*60*1000) {
    duration = 10*60*1000;
  }
  return {
    start: parseTimestamp(rec.Time),
    duration: duration
  };
});

Promise.all([sleepModel.loadP(), eatModel.loadP()])
.then(() => {
  chart.renderModel(eatModel.records, '#F33');
  chart.renderModel(sleepModel.records, '#333');
})
.catch(err => { throw err; });

