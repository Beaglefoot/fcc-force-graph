/* eslint no-unused-vars: off */
import { forceGraph, link as linkClass, title } from './index.scss';
import Loading from './Loading/Loading';
import Footer from './Footer/Footer';

const d3 = require('d3');

const url = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';
const getWidth  = () => d3.min([window.innerWidth, 1200]);
const getHeight = () => d3.min([window.innerHeight - 5, 800]);
const linkDistance = 60;
const flagWidth = 32;
const flagHeight = 24;
const titleFontSize = 30;



const app = document.getElementById('app');
const loading = new Loading();
loading.appendToNode(app).startAnimation();
new Footer().appendToDocument();



const buildForceGraph = ({ nodes, links }) => {
  // Fix Yugoslavia -> Macedonia
  const findCountryIndex = name => nodes.findIndex(({ country }) => country === name);

  const skip = findCountryIndex('Yugoslavia');
  const redirect = findCountryIndex('Macedonia');
  nodes = nodes.filter((_, i) => i !== skip);
  links = links.map(({ target, source }) => {
    if (target === skip) target = redirect;
    if (source === skip) source = redirect;
    if (target > skip) target--;
    if (source > skip) source--;
    return { target, source };
  });

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

  const link = svg.append('g')
    .attr('class', 'links')
    .selectAll()
    .data(links)
    .enter().append('line')
    .classed(linkClass, true);

  const node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll()
    .data(nodes)
    .enter().append('image')
    .attr('id', d => `flag-${d.code}`)
    .attr('width', flagWidth)
    .attr('height', flagHeight)
    .attr('xlink:href', 'blank')
    .attr('transform', `translate(-${flagWidth / 2}, -${flagHeight / 2})`)
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

  nodes.forEach(({ code }) => {
    import(`flag-icon-css/flags/4x3/${code}.svg`).then(flagImg => (
      d3.select(`#flag-${code}`).attr('xlink:href', flagImg)
    ));
  });

  // Pop-up
  node.append('title')
    .text(d => d.country);

  simulation
    .nodes(nodes)
    .on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

  simulation.force('link')
    .links(links);


  svg.call(d3.zoom()
    .scaleExtent([0.5, 4])
    .on('zoom', () => d3.selectAll('g').attr('transform', d3.event.transform)));



  // Title
  svg.append('defs')
    .append('filter')
    .attr('id', 'shadow')
    .attr('width', '150%')
    .attr('height', '150%')
    .html(
      '<feOffset result="offOut" in="SourceAlpha" dx="2" dy="2" />' +
      '<feGaussianBlur result="blurOut" in="offOut" stdDeviation="2" />' +
      '<feBlend in="SourceGraphic" in2="blurOut" mode="normal" />'
    );

  svg
    .append('text')
    .text('National Contiguity with a Force Directed Graph')
    .style('font-size', titleFontSize)
    .classed(title, true)
    .attr('x', svg.attr('width') / 2)
    .attr('y', titleFontSize * 1.5)
    .style('filter', 'url(#shadow)');


  window.addEventListener('resize', () => {
    svg.attr('width', getWidth()).attr('height', getHeight());
    simulation.force(
      'center',
      d3.forceCenter(svg.attr('width') / 2, svg.attr('height') / 2)
    );
    simulation.restart();

    d3.select(`.${title}`).attr('x', svg.attr('width') / 2);
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
