import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 30, right: 0, bottom: 20 }
let height = 610 - margin.top - margin.bottom
let width = 940 - margin.left - margin.right

let svg = d3
  .select('#chart-6')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .style('background', 'black')
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

let projection = d3.geoAlbersUsa()

// out geoPath needs a PROJECTION letiable
let path = d3.geoPath().projection(projection)

Promise.all([
  d3.json(require('./pudding/us.topojson')),
  d3.csv(require('./pudding/incarceration_2.csv')),
  d3.csv(require('./pudding/all_points_5.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, incarceration, allPoints]) {
  let states = topojson.feature(json, json.objects.states)
  states.features = states.features.filter(d => d.id !== 72 && d.id !== 78)
  let stateData = {}
  incarceration.forEach(function(d) {
    stateData[d.id] = d
  })
  // Not sure how to do scale/center/etc?
  // Just use .fitSize to center your map
  // and set everything up nice
  // projection.fitSize([width, height], states)

  svg
    .append('g')
    .attr('transform', 'translate(-140,-10) scale(1.22)')
    .selectAll('.state')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('fill', 'rgba(0,0,0,0.01)')
    .on('mouseenter', function(d) {
      d3.select(this).attr('stroke', 'white')
    })
    .on('mouseleave', function(d) {
      d3.select(this).attr('stroke', 'none')
    })

  /* Weird pudding stuff goes here */
  let radiusScale = d3
    .scaleSqrt()
    .domain([1000, 50000])
    .range([1, 3.5])
    .clamp(true)

  let xExtent = d3.extent(allPoints, d => +d.x)
  let yExtent = d3.extent(allPoints, d => +d.y)

  let jailExtent = d3.extent(allPoints, d => d.jail_black_2010 / d.total_2010)

  let colorScale = d3
    .scaleSequential(d3.interpolatePlasma)
    .domain(jailExtent)
    .clamp(true)

  let xPositionScale = d3
    .scaleLinear()
    .domain(xExtent)
    .range([0, width])
  let yPositionScale = d3
    .scaleLinear()
    .domain(yExtent)
    .range([height, 0])

  svg
    .append('g')
    .lower()
    .selectAll('circle')
    .data(allPoints)
    .enter()
    .append('circle')
    .attr('r', 2)
    .attr('cx', d => xPositionScale(d.x))
    .attr('cy', d => yPositionScale(d.y))
    .attr('fill', d => {
      return colorScale((d.jail_black_2010 / d.total_2010) * 50)
    })
}
