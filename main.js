'use strict';

/*
 * Molly's sleep and feeding patterns: 0-6 months
 */

// Parse the slightly odd incoming date format
let bstWindows = {
  2013: [Date.UTC(2013, 2, 31), Date.UTC(2013, 9, 27)],
  2014: [Date.UTC(2014, 2, 30), Date.UTC(2014, 9, 26)],
  2015: [Date.UTC(2015, 2, 29), Date.UTC(2015, 9, 25)],
  2016: [Date.UTC(2016, 2, 27), Date.UTC(2016, 9, 30)]
};

function parseTimestamp(timestr) {
  let dateRE = /^\s*(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+)\s*$/
    , dateParts = dateRE.exec(timestr)
    , hours = +dateParts[4]
    , mins = +dateParts[5]
    , date = new Date(Date.UTC(dateParts[3], dateParts[2]-1, dateParts[1], hours, mins));

  // Incoming dates are in local time: correct BST -> UTC where appropriate
  if (bstWindows.hasOwnProperty(date.getFullYear())) {
    let bst = bstWindows[date.getFullYear()];
    if (date >= bst[0] && date < bst[1]) {
      date.setHours(date.getHours() - 1);
    }
  }

  return date;
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
    annotationRadius: 10
  });

  console.log(`First date ${sleepModel.records[0].start}`);
  console.log(`Last date ${sleepModel.records[sleepModel.records.length-1].start}`);

  chart.renderModel(sleepModel.records, 'black');
  chart.renderModel(eatModel.records, '#CC0000');

  // Timezone: BST -> GMT
  chart.annotatePoint('BST → GMT', new Date(Date.UTC(2015, 9, 25, 1, 0)), 'green');
})
.catch(err => { throw err; });

