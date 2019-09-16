let labelColorArray = ["mdB0BEC5","mdEEEEEE","mdBCAAA4","mdFFAB91","mdFFCC80","mdFFE082","mdFFF59D","mdE6EE9C","mdC5E1A5","mdA5D6A7","md80CBC4","md80DEEA","md81D4FA","md90CAF9","md9FA8DA","mdB39DDB","mdCE93D8","mdF48FB1","mdef9a9a"]
let barColorArray = ["md607D8B","md9E9E9E","md795548","mdFF5722","mdFF9800","mdFFC107","mdFFEB3B","mdCDDC39","md8BC34A","md4CAF50","md009688","md00BCD4","md03A9F4","md2196F3","md3F51B5","md673AB7","md9C27B0","mdE91E63","mdf44336"]

class RainbowDashboard extends HTMLElement {
  connectedCallback() {
    let dataURL = this.dataset.src;
    let element = this;
    fetch(dataURL).then(function(response) {
      return response.json();
    })
    .then(function(json) {
      // apply the logo

      let output = `<div class="rainbowDashboard">
        <header>
          <img class="logo" src="${json.meta.logo}" />
          <h1>${json.meta.title} Dashboard</h1>
        </header>
        <nav>
          <ul>
            ${json.sections.map( (section, sectionCounter) => {
              return `<li><a href="#section${sectionCounter}">${section.title}</a></li>`
            }).join(' ')}
          </ul>
        </nav>
        <content>
          ${json.sections.map( (section, sectionCounter) => {
          return `<div class="section${sectionCounter}">          
            ${section.content.charts.map( (item, index) => {
              let colorArrayIndex = index % parseInt(labelColorArray.length - 1);
              return `<span class="barChart section${sectionCounter}Graph${index} ${labelColorArray[colorArrayIndex]} ${barColorArray[colorArrayIndex]}">
                <h3>${item.title}</h3>
              </span>`
            }).join(' ')}
          </div>`}).join('  ')}
        </content>`;
      
      element.innerHTML = output;

      json.sections.forEach( (section, sectionCounter) => {
        section.content.charts.forEach( (item, index) => {
          drawBars(item,'.section'+sectionCounter+'Graph'+index);
        })
      })

    })
  }
}
customElements.define("rainbow-dash", RainbowDashboard);


function drawBars(json, containerQuery) {
  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 100, left: 40},
      width = 360 - margin.left - margin.right,
      height = 270 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
  var y = d3.scaleLinear()
            .range([height, 0]);
            
  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select(containerQuery).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

  // get the data
  let dataString = 'Field,Count\n';
  for (let [key, value] of Object.entries(json.data)) {
    dataString += `${key},${value}\n`;
  }

  // now we can do d3 chart stuff
  let data = d3.csvParse(dataString);

  // Scale the range of the data in the domains
  x.domain(data.map(function(d) { return d.Field; }));
  y.domain([0, d3.max(data, function(d) { return d.Count; })]);

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.Field); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.Count); })
      .attr("height", function(d) { return height - y(d.Count); });

  // add the x Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")	
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-35)");

  // add the y Axis
  svg.append("g")
    .call(d3.axisLeft(y));
}