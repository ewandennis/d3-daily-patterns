/*
 * A circular view of a series of events useful for showing patterns within a given period.
 *
 * Each event is rendered as an arc.  The circle radius depicts the cycle the event occurs upon.
 *
 * A full revolution represents 1 cycle of a given period (e.g. 24 hours).
 * Arc length denotes duration and arc angle denotes start and end time .
 *
 * Events of differing cycle therefore appear in concentric circles of increasing size.
 *
 * Expected data structure:
 *  [
 *    {
 *      start: Date,
 *      duration: Number // in milliseconds
 *    },
 *    ...
 *  ]
 *
 * Options:
 *   period : cycle length in milliseconds
 *   centreWidth : width of empty centre in device units
 *   arcWidth : thickness of arcs in device units
 *   arcSpacing : spacing between concentric circles in device units
 */

class PeriodicPatternChart {
  constructor(svgNode, options) {
    options = options || {};
    this.svg = svgNode;
    this.period = options.period || (24 * 60 * 60 * 1000);
    this.centreWidth = options.centreWidth || 50;
    this.arcWidth = options.arcWidth || 1;
    this.arcSpacing = options.arcSpacing || 2;
  }

  _prepareDataset(records) {
    let firstDate = Math.floor(d3.min(records.map(d => d.start)).getTime() / this.period);
    return records.map(d => ({
      // start: normalised to this.period (0..1)
      // end:  normalised to this.period (0..1)
      // idx: 0-N (where N is the number of periods represented by the dataset)
      start: (d.start.getTime() % this.period) / this.period,
      end: ((d.start.getTime() + d.duration) % this.period) / this.period,
      idx: Math.floor(d.start.getTime() / this.period) - firstDate,
      date: d.start,
      duration: d.duration
    })).map(d => ({
      // If start > end, the event spans 0 in period space.
      // d3.svg.arc will render 'by going around the long way'.
      // This produces an almost 360 degree arc so we adjust
      // start to be -ve to force a minimal arc.
      start: d.start > d.end ? - (1 - d.start) : d.start,
      end: d.end,
      idx: d.idx
    }));
  }

  renderModel(model, color) {
    let records = this._prepareDataset(model);
    let arc = d3.svg.arc()
      .startAngle(d => d.start * Math.PI * 2)
      .endAngle(d => d.end * Math.PI * 2)
      .innerRadius(d => Math.floor(this.centreWidth + (d.idx * (this.arcWidth+this.arcSpacing))))
      .outerRadius(d => Math.floor(this.centreWidth + ((d.idx+1) * (this.arcWidth+this.arcSpacing)) - this.arcSpacing))
      .padRadius(0)
      .padAngle(0);

    let svgInsertionPoint = this.svg.append('g')
      .attr('transform', 'translate(' + (this.svg.attr('width')/2) + ', ' + (this.svg.attr('height')/2) + ')');

    svgInsertionPoint.selectAll('path')
      .data(records)
    .enter().append('svg:path')
      .attr('d', arc)
      .style('fill', color)
      .style('opacity', 1);
  }
}

