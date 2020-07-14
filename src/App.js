import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./frontend/css/main.css";
import * as d3 from "d3";

const JSON_URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

function App() {
  const [data, setBikeRaceData] = useState([]);

  useEffect(() => {
    getData(JSON_URL);
  }, []);

  /*
   * Gets bike data asynchronously from a remte json file
   *
   */
  const getData = (url) => {
    const req = new XMLHttpRequest();

    req.open("GET", url, true);
    req.onreadystatechange = () => {
      if (req.readyState == 4 && req.status == 200) {
        const bikedData = JSON.parse(req.responseText);

        let newData = [];

        bikedData.forEach((e) => {
          newData.push({
            Time: e.Time,
            Place: e.Place,
            Seconds: e.Seconds,
            Name: e.Name,
            Year: e.Year,
            Nationality: e.Nationality,
            Doping: e.Doping,
            URL: e.URL,
          });
        });
        console.log(newData);

        setBikeRaceData(() => newData);
      }
    };

    req.send();
  };

  return (
    <div class="container h-100">
      <div class="row h-100">
        <div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 d-flex flex-column justify-content-center align-items-center">
          <div>
            <ScatterPlot data={data} />
          </div>

          <div class="text-center font-weight-bold text-black mt-2 pt-2 d-none">
            Designed and coded by{" "}
            <a class="credits" href="https://github.com/peter-huang">
              Peter Huang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScatterPlot({ data }) {
  useEffect(() => {
    if (data != null && data.length > 0) {
      drawScatterGraph(data);
    }
  }, [data]);

  /*
   * Draws the scatter graph
   *
   * @param bikeddata - "Time", "Place", "Seconds", "Name", "Year",  "Nationality", "Doping", "URL"
   */
  const drawScatterGraph = (bikedata) => {
    const width = 700;
    const height = 500;
    const padding = 25;
    const xFactor = 5;
    const radius = 2;

    d3.select("#scattergraph")
      .append("div")
      .attr("id", "title")
      .text("Doping in Professional Bicycle Racing");
    d3.select("#title")
      .append("div")
      .attr("id", "subtitle")
      .text("35 Fastest times up Alpe d'Huez");

    const svg = d3
      .select("#scattergraph")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // scales
    const xScale = d3.scaleLinear();
    xScale.domain([
      d3.min(bikedata, (d) => d.Year - xFactor),
      d3.max(bikedata, (d) => d.Year + xFactor),
    ]);
    xScale.range([padding, width - padding]);

    const yScale = d3.scaleLinear();
    yScale.domain([
      d3.min(bikedata, (d) => parseFloat(d.Time)),
      d3.max(bikedata, (d) => parseFloat(d.Time)),
    ]);
    yScale.range([height - padding, padding]);

    svg
      .selectAll("circle")
      .data(bikedata)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.Year))
      .attr("cy", (d) => yScale(parseFloat(d.Time)))
      .attr("r", (d) => radius);

    // x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr(
        "transform",
        "translate(" + padding + "," + (height - 2 * padding) + ")"
      )
      .call(xAxis);

    // y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".2f"));
    svg
      .append("g")
      .attr("id", "y-axis")
      .attr(
        "transform",
        "translate(" + 2 * padding + "  ," + -1 * padding + ")"
      )
      .call(yAxis);
  };

  return (
    <div id="scattergraph-container">
      <div id="scattergraph"></div>
    </div>
  );
}

export default App;
