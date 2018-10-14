import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }
let height = 400 - margin.top - margin.bottom
let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

let colorScale = d3
  .scaleOrdinal()
  .range([
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69',
    '#fccde5'
  ])

let projection = d3.geoAlbersUsa()
let graticule = d3.geoGraticule()

// out geoPath needs a PROJECTION variable
let path = d3.geoPath().projection(projection)

Promise.all([
  d3.json(require('./data/us_states.topojson')),
  d3.csv(require('./data/wafflehouses.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  let states = topojson.feature(json, json.objects.us_states)

  // Not sure how to do scale/center/etc?
  // Just use .fitSize to center your map
  projection.fitSize([width, height], states)

  svg
    .selectAll('.state')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('fill', d => colorScale(d.properties.region))

  svg
    .selectAll('.state-label')
    .data(states.features)
    .enter()
    .append('text')
    .attr('class', 'state-label')
    .text(d => d.properties.postal)

  svg
    .selectAll('.wafflehouse')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'wafflehouse')
    .attr('r', 2)
    .attr('transform', d => {
      let coords = projection([d.long, d.lat])
      return `translate(${coords})`
    })
    // here's the bad way of spreading out circles:
    // .attr('cx', d => {
    //   let coords = projection([d.long, d.lat])
    //   return coords[0]
    // })
    // .attr('cy', d => {
    //   let coords = projection([d.long, d.lat])
    //   return coords[1]
    // })
}
