/* eslint no-unused-vars: off */
import { forceGraph } from './index.scss';
const d3 = require('d3');

const app = document.getElementById('app');

const svg = d3.select(
  document.createElementNS('http://www.w3.org/2000/svg', 'svg')
);

svg.attr('width', 1200).attr('height', 600).classed(forceGraph, true);
app.appendChild(svg.node());
