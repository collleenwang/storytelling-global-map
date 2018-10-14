import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 20, left: 20, right: 20, bottom: 20 }
let height = 500 - margin.top - margin.bottom
let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

let projection = d3.geoMercator()

let nyc = [-74, 40]
let london = [0, 51]
let tehran = [51, 35]
let perth = [115, -31]

let path = d3.geoPath().projection(projection)
let basicLine = d3.line()

d3.json(require('./data/world.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(json) {
  let world = topojson.feature(json, json.objects.countries)
  // console.log('world', world)

  svg
    .selectAll('.country')
    .data(world.features)
    .enter()
    .append('path')
    .attr('fill', 'lightgray')
    .attr('stroke', 'white')
    .attr('d', path)

  // console.log(projection(nyc))

  svg
    .append('circle')
    .attr('r', 3)
    .attr('transform', `translate(${projection(nyc)})`)

  svg
    .append('circle')
    .attr('r', 3)
    .attr('transform', `translate(${projection(london)})`)

  svg
    .append('circle')
    .attr('r', 3)
    .attr('transform', `translate(${projection(tehran)})`)

  svg
    .append('circle')
    .attr('r', 3)
    .attr('transform', `translate(${projection(perth)})`)

  let coords = [nyc, london]

  let geoLine = {
    type: 'LineString',
    coordinates: coords
  }

  // svg
  //   .append('path')
  //   .attr('stroke', 'red')
  //   .attr('d', path(geoLine))
  //   .attr('fill', 'none')

  // another way to do the above:
  svg
    .append('path')
    .datum(geoLine)
    .attr('stroke', 'red')
    .attr('fill', 'none')
    .attr('d', path)

  // here's how to draw a straight line:
  svg
    .append('path')
    .datum([projection(nyc), projection(london)])
    .attr('stroke', 'blue')
    .attr('fill', 'none')
    .attr('d', basicLine)

  // adding more lines

  // nyc to perth
  coords = [nyc, perth]
  geoLine = {
    type: 'LineString',
    coordinates: coords
  }
  svg
    .append('path')
    .datum(geoLine)
    .attr('stroke', 'red')
    .attr('fill', 'none')
    .attr('d', path)

  // straight line from nyc to perth
  svg
    .append('path')
    .datum([projection(nyc), projection(perth)])
    .attr('stroke', 'blue')
    .attr('fill', 'none')
    .attr('d', basicLine)

  // nyc to tehran
  coords = [nyc, tehran]
  geoLine = {
    type: 'LineString',
    coordinates: coords
  }
  svg
    .append('path')
    .datum(geoLine)
    .attr('stroke', 'red')
    .attr('fill', 'none')
    .attr('d', path)
}
