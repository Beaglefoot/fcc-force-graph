/* eslint no-unused-vars: off */
import { forceGraph } from './index.scss';
import Loading from './Loading/Loading';
import './flags/flags.css';

const d3 = require('d3');

const url = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';
const getWidth  = () => d3.min([window.innerWidth, 1200]);
const getHeight = () => d3.min([window.innerHeight - 5, 800]);
const linkDistance = 60;



const app = document.getElementById('app');
const loading = new Loading();
loading.appendToNode(app).startAnimation();



const buildForceGraph = graph => {
  const svg = d3.select(
    document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  );

  svg
    .attr('width', getWidth())
    .attr('height', getHeight())
    .classed(forceGraph, true);

  app.appendChild(svg.node());

  const simulation = d3.forceSimulation()
    .force(
      'link',
      d3.forceLink()
        .id((_, i) => i)
        .distance(linkDistance)
    )
    .force(
      'center',
      d3.forceCenter(svg.attr('width') / 2, svg.attr('height') / 2)
    )
    .force(
      'charge',
      d3.forceManyBody().distanceMax(200)
    )
    .force(
      'collide',
      d3.forceCollide(20)
    );

  window.simulation = simulation;

  const link = svg.append('g')
    .attr('class', 'links')
    .selectAll()
    .data(graph.links)
    .enter().append('line')
    .attr('stroke', '#666')
    .attr('stroke-width', 1);

  const node = d3.select('#app').append('g')
    .attr('class', 'nodes')
    .selectAll()
    .data(graph.nodes)
    .enter()
    .append('div')
    .attr('class', d => `flag flag-${d.code}`)
    .style('position', 'absolute')
    .call(
      d3.drag()
        .on('start', d => {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', d => {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        })
        .on('end', d => {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

  simulation
    .nodes(graph.nodes)
    .on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .style('top', d => `${d.y}px`)
        .style('left', d => `${d.x}px`)
        .style('transform', 'translate(-50%, -50%)');
    });

  simulation.force('link')
    .links(graph.links);

  window.addEventListener('resize', () => {
    svg.attr('width', getWidth()).attr('height', getHeight());
    simulation.force(
      'center',
      d3.forceCenter(svg.attr('width') / 2, svg.attr('height') / 2)
    );
    simulation.restart();
  });

  loading.removeFromNode(app);
};



fetch(url)
  .then(response => {
    if (response.status >= 200 && response.status < 300) return response;
    else {
      const error = new Error(`${response.status} ${response.statusText}`);
      throw error;
    }
  })
  .then(response => response.json())
  .then(buildForceGraph)
  .catch(({ message }) => app.textContent = message);
