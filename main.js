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
  let chart = new PeriodicPatternChart(svg, {
    centreWidth: 10,
    startDate: d3.min(sleepModel.records[0].start, eatModel.records[0].start),
    annotationRadius: 3
  });

  console.log(`First date ${sleepModel.records[0].start}`);
  console.log(`Last date ${sleepModel.records[sleepModel.records.length-1].start}`);

  chart.renderModel(sleepModel.records, 'black');
  chart.renderModel(eatModel.records, '#CC0000');

  // Timezone: BST -> GMT
  chart.annotate(new Date('2015-10-25T02:00'), 'green');

  let date = sleepModel.records[0].start;
  let glalat = 55.864237;
  let glalong = -4.251806;
  while (date <= sleepModel.records[sleepModel.records.length-1].start) {
    let sun = SunCalc.getTimes(date, glalat, glalong);
    chart.annotate(sun.sunrise, 'yellow');
    chart.annotate(sun.sunset, 'orange');
    date.setDate(date.getDate() + 1);
  }
})
.catch(err => { throw err; });

