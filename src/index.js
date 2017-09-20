/* eslint no-unused-vars: off */
import { forceGraph } from './index.scss';
const d3 = require('d3');

const svgWidth = 1200;
const svgHeight = 800;
const linkDistance = 90;



const app = document.getElementById('app');
const svg = d3.select(
  document.createElementNS('http://www.w3.org/2000/svg', 'svg')
);

svg
  .attr('width', svgWidth)
  .attr('height', svgHeight)
  .classed(forceGraph, true);

app.appendChild(svg.node());


const graph = {
  nodes: [
    {id: 'x'},
    {id: 'y'},
    {id: 'z'}
  ],
  links: [
    {source: 'x', target: 'y'},
    {source: 'y', target: 'z'},
    {source: 'z', target: 'x'}
  ]
};

const simulation = d3.forceSimulation()
  .force(
    'link',
    d3.forceLink()
      .id(d => d.id)
      .distance(linkDistance)
  )
  .force(
    'center',
    d3.forceCenter(svgWidth / 2, svgHeight / 2)
  );

const link = svg.append('g')
  .attr('class', 'links')
  .selectAll()
  .data(graph.links)
  .enter().append('line')
  .attr('stroke', 'red')
  .attr('stroke-width', 3);

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
  .text(d => d.id)
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
