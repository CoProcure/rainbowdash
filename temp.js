// this is a temporary script that reformats my data
// eventually have to put this into my data creation tool, should not be in this repository

let fs = require('fs')
let fetch = require('node-fetch')

fetch("https://data-pipeline-post-db.s3-us-west-2.amazonaws.com/dashboard/data.json").then(function(response) {
  return response.json();
})
.then(function(json) {
  let o = {
    "meta": {
      "logo": "https://www.coprocure.us/img/logo_coprocure_white-min.png"
    },
    "sections": []
  }

  o.sections.push(createSection('National Coops', JSON.parse(json.coops)))

  // aggregate all the buyers data into Misc if there are less than 3 total records
  let buyerData = JSON.parse(json.buyers);
  let cleanBuyerData = [];
  let misc = [ 'Misc', {} ];
  buyerData.forEach( (item) => {
    if(item[1].total > 2) {
      cleanBuyerData.push(item);
    } else {
      // add everything to misc
      for(var key in item[1]) {
        if(misc[1][key]) {
          misc[1][key] += item[1][key];
        } else {
          misc[1][key] = item[1][key];
        }
      }
    }
  })
  cleanBuyerData.push(misc);
  o.sections.push(createSection('Non Coop Affiliated Buyers',cleanBuyerData));

  fs.writeFileSync('./data.json',JSON.stringify(o),'utf8')
})

function createSection(title, data) {
  let sectionObj = {
    "title": title,
    "content": { 
      headers: [],
      charts: []
    }
  }
  let allFields = 0;
  let totalContracts = 0;
  data.forEach( (item) => {
    let chartObj = {
      "type": "bar",
      "title": item[0],
      "data": {}
    }
    let lowestValue = 10000000;
    for(var key in item[1]) {
      if(item[1][key] < lowestValue) {
        lowestValue = item[1][key];
      }
      chartObj.data[key] = item[1][key];
    }
    allFields += lowestValue;
    totalContracts += item[1].total;
    sectionObj.content.charts.push(chartObj);
  })
  // tally total
  sectionObj.content.headers.push({ "text": "Number of records with all fields", "value": allFields })
  sectionObj.content.headers.push({ "text": "Total Records from these sources", "value": totalContracts })
  return sectionObj;
}