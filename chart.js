/*
 * A circular view of a series of events each with a start time and duration.
 * Each event is rendered as an arc on a circle.  The circle radius depicts the 
 * day of the event so later events occur on concentric circles of increasing size.
 * Size of arc denotes duration. Arc angle denotes start time on a 24-hour cycle.
 * 
 * Expected data structure:
 *  [
 *    {
 *      start: Number,
 *      end: Number,
 *      idx: Number
 *    },
 *    ...
 *  ]
 *
 * start and end are in hours.  e.g. 3.30pm = 15.5.
 * idx is a integer index showing the day of the event.
 *
 */

class DailyPatternChart {
  constructor(model) {
    this.model = model;
  }

  /*
   * Add an SVG element to the given node and render into it
   */
  renderTo(domNode) {
   let self = this
      , margin = {top: 10, right: 10, bottom: 10, left: 10}
      , nodeWidth = parseInt(window.getComputedStyle(domNode).width)
      , width = nodeWidth - margin.left - margin.right
      , height = 700 - margin.top - margin.bottom
      , centreWidth = 50
      , arcWidth = 1 
      , spaceWidth = 2 
      , scale = 0.65 
      , arc = d3.svg.arc()
        .startAngle(d => (d.start / 24) * Math.PI * 2)
        .endAngle(d => (d.end / 24) * Math.PI * 2)
        .innerRadius(d => Math.floor(centreWidth + (d.idx * (arcWidth+spaceWidth))))
        .outerRadius(d => Math.floor(centreWidth + ((d.idx+1) * (arcWidth+spaceWidth)) - spaceWidth))
        .padRadius(0)
        .padAngle(0)

    self.svg = d3.select('#frame')
      .append('svg:svg')
        .attr('width', width+margin.left+margin.right)
        .attr('height', height+margin.top+margin.bottom)

    self.svg.append('g')
        .attr('transform', 'translate(' + (width+margin.left+margin.right)/2 + ', ' + (height+margin.top+margin.bottom)/2 + ') scale(' + scale + ', ' + scale + ')')
      .selectAll('path')
        .data(self.model.records)
      .enter().append('svg:path')
        .attr('d', arc)
        .style('fill', '#FFF')
        .style('opacity', 1);
  }
}

