/* eslint no-unused-vars: off */
import { forceGraph } from './index.scss';
import Loading from './Loading/Loading';

const d3 = require('d3');

const url = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';
const svgWidth = window.innerWidth;
const svgHeight = window.innerHeight - 5;
const linkDistance = 40;



const app = document.getElementById('app');
const loading = new Loading();
loading.appendToNode(app).startAnimation();



const buildForceGraph = graph => {
  const svg = d3.select(
    document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  );

  svg
    .attr('width', svgWidth)
    .attr('height', svgHeight)
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
      d3.forceCenter(svgWidth / 2, svgHeight / 2)
    )
    .force(
      'charge',
      d3.forceManyBody()
        .strength(-10)
        .distanceMax(200)
    )
    .force(
      'collide',
      d3.forceCollide(20)
    );

  const link = svg.append('g')
    .attr('class', 'links')
    .selectAll()
    .data(graph.links)
    .enter().append('line')
    .attr('stroke', '#666')
    .attr('stroke-width', 2);

  const node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll()
    .data(graph.nodes)
    .enter().append('circle')
    .attr('r', 10)
    .attr('fill', 'orange')
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

  const desc = svg.append('g')
    .selectAll()
    .data(graph.nodes)
    .enter().append('text')
    .text(d => d.code)
    .attr('text-anchor', 'middle')
    .attr('transform', 'translate(0, 4)');

  simulation
    .nodes(graph.nodes)
    .on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      desc
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

  simulation.force('link')
    .links(graph.links);

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
