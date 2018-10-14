import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }
let height = 500 - margin.top - margin.bottom
let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-7')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

let projection = d3.geoMercator()

let path = d3.geoPath().projection(projection)

let lineWidthScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([0, 20])

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/coordinates.csv')),
  d3.csv(require('./data/transit-data.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

let coordinateStore = d3.map()

function ready([json, coordinateData, transitData]) {
  // loop through the city/coord data
  // and save the coords inside our
  // coordinateStore
  coordinateData.forEach(d => {
    let name = d.name
    let coords = [d.lon, d.lat]
    coordinateStore.set(name, coords)
  })

  let countries = topojson.feature(json, json.objects.countries)
  svg
    .append('g')
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', 'lightgrey')

  // plotting cities on our map
  svg
    .selectAll('.city')
    .data(coordinateData)
    .enter()
    .append('circle')
    .attr('class', 'city')
    .attr('r', 3)
    .attr('transform', d => `translate(${projection([d.lon, d.lat])})`)

  svg
    .selectAll('.transit')
    .data(transitData)
    .enter()
    .append('path')
    .attr('d', d => {
      // console.log(d.from)
      // console.log(coordinateStore.get(d.from))
      let fromCoords = coordinateStore.get(d.from)
      let toCoords = coordinateStore.get(d.to)

      let geoLine = {
        type: 'LineString',
        coordinates: [fromCoords, toCoords]
      }

      return path(geoLine)
    })
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', d => lineWidthScale(d.amount))
    .attr('opacity', 0.5)
    .attr('stroke-linecap', 'round')
}
