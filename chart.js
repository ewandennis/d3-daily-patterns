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
 *   startDate: date of first cycle (optional - defaults to first entry of first dataset)
 *   centreWidth : width of empty centre in device units
 *   arcWidth : thickness of arcs in device units
 *   arcSpacing : spacing between concentric circles in device units
 *   annotationRadius : size of annotation dots
 *   annotationPadding : padding from edge of outermost cycle to end of annotation line
 *   annotationLineWidth : annotation line width
 *
 * Note: renderModel() may be called with multiple datasets to overlay onto a single chart.
 * Caveat: set options.startDate if rendering >1 dataset.
 *
 */

class PeriodicPatternChart {
  constructor(svgNode, options) {
    options = options || {};
    this.svg = svgNode;
    this.period = options.period || (24 * 60 * 60 * 1000);
    this.startDate = options.startDate || null;
    this.centreWidth = options.centreWidth || 50;
    this.arcWidth = options.arcWidth || 1;
    this.arcSpacing = options.arcSpacing || 2;
    this.annotationRadius = options.annotationRadius || 20;
    this.annotationPadding = options.annotationPadding || 15;
    this.annotationLineWidth = options.annotationLineWidth || 3;
    this.datasetLength = 0;
  }

  // Accepts: timestamp in MS
  // Returns: input timestamp's position within a cycle (0-2π : real)
  _dateToAngle(date) {
    return ((date % this.period) / this.period) * Math.PI * 2;
  }

  // Accepts: timestamp in MS, start date in MS
  // Returns: input timestamp's cycle count (0+ :integer) 
  _dateToCycleIndex(date) {
    return Math.floor(date / this.period) - this.startDate;
  }

  _conditionRecord(rec) {
    return {
      // start: normalised to this.period (0..1)
      // end:  normalised to this.period (0..1)
      // idx: 0-N (where N is the number of periods represented by the dataset)
      start: this._dateToAngle(rec.start.getTime()),
      end: this._dateToAngle(rec.start.getTime() + rec.duration),
      idx: this._dateToCycleIndex(rec.start.getTime()),
      date: rec.start,
      duration: rec.duration
    };
  }

  _prepareDataset(records) {
    this.startDate = this.startDate || Math.floor(d3.min(records.map(d => d.start)).getTime() / this.period);
    return records.map(d => this._conditionRecord(d))
    .map(d => ({
      // If start > end, the event spans 0 in period space.
      // d3.svg.arc will render 'by going around the long way'.
      // This produces an almost 360 degree arc so we adjust
      // start to be -ve to force a minimal arc.
      start: d.start > d.end ? - ((2*Math.PI) - d.start) : d.start,
      end: d.end,
      idx: d.idx
    }));
  }

  _makeLayer() {
    return this.svg.append('g')
      .attr('transform', 'translate(' + (this.svg.attr('width')/2) + ', ' + (this.svg.attr('height')/2) + ')');
  }

  _cycleIndexToRadius(idx) {
    return Math.floor(this.centreWidth + (idx * (this.arcWidth+this.arcSpacing)));
  }

  renderModel(model, color) {
    let records = this._prepareDataset(model);
    let arc = d3.svg.arc()
      .startAngle(d => d.start)
      .endAngle(d => d.end)
      .innerRadius(d => this._cycleIndexToRadius(d.idx))
      .outerRadius(d => this._cycleIndexToRadius(d.idx+1) - this.arcSpacing)
      .padRadius(0)
      .padAngle(0);

    this.datasetLength = d3.max([this.datasetLength, d3.max(records, d=>d.idx)]);

    let svgInsertionPoint = this._makeLayer();

    svgInsertionPoint.selectAll('path')
      .data(records)
    .enter().append('svg:path')
      .attr('d', arc)
      .style('fill', color)
      .style('opacity', 1);
  }

  annotatePoint(title, date, color) {
    if (!this.annotationLayer) {
      this.annotationLayer = this._makeLayer();
    }

    let maxRadius = this._cycleIndexToRadius(this.datasetLength);
    let radius = this._cycleIndexToRadius(this._dateToCycleIndex(date));
    let angleRad = this._dateToAngle(date);
    let angleDeg = (angleRad / Math.PI) * 180;
    let startPos = this.centreWidth + radius + this.annotationRadius;
    let endPos = this.centreWidth + maxRadius + this.annotationRadius;
    let endPtX = endPos * Math.sin(angleRad);
    let endPtY = endPos * Math.cos(angleRad);

    this.annotationLayer.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', this.annotationRadius)
      .attr('transform', 'rotate(' + angleDeg + ') translate(0,' + (-(radius+this.centreWidth)) + ')')
      .style('fill', color);

    let line = this.annotationLayer.append('line')
      .attr('x1', 0)
      .attr('y1', -startPos)
      .attr('x2', 0)
      .attr('y2', -endPos)
      .attr('transform', 'rotate(' + angleDeg + ')')
      .style('stroke', color)
      .style('stroke-width', this.annotationLineWidth + 'px')

    this.annotationLayer.append('text')
      .attr('x', endPtX)
      .attr('y', -endPtY)
      .attr('font-size', '30px')
      .attr('stroke', 'none')
      .attr('fill', color)
      .text(title);
  }
}

