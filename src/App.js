import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./frontend/css/main.css";
import * as d3 from "d3";

const JSON_URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

/*
 * Converts a string in the time format (mm:ss) and returns a new Date object
 *
 * @param time - string in the time format (mm:ss)
 */
const convertTimeToDate = (time) => {
  const index = time.indexOf(":");
  const minutes = time.substring(0, index);
  const seconds = time.substring(index + 1);

  return new Date(1970, 0, 1, 0, minutes, seconds);
};

/*
 * Converts a year to a Date object
 *
 * @param year - integer type of the year value
 */
const convertYearToDate = (year) => {
  return new Date(year, 0, 1, 0, 0, 0);
};

/*
 * Finds out which bikers doped or did not doped
 *
 * @param bikedData - biked data of racers
 * @param flag - true results in research for those who doped, false otherwise
 */
const didDope = (bikedData, flag = true) => {
  let count = 0;

  if (flag) {
    bikedData.forEach((d) => {
      if (d.Doping.length > 0) {
        count++;
      }
    });
  } else {
    bikedData.forEach((d) => {
      if (d.Doping.length <= 0) {
        count++;
      }
    });
  }

  return count;
};

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
            TimeToDate: convertTimeToDate(e.Time),
            YearToDate: convertYearToDate(e.Year),
          });
        });

        console.log(didDope(bikedData, false));

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
    // Settings
    const padding = {
      top: 50,
      right: 25,
      bottom: 50,
      left: 25,
    };
    const width = 700 + padding.left + padding.right;
    const height = 300 + padding.top + padding.bottom;
    const xAxisFactor = {
      top: 0,
      right: 7,
      bottom: 0,
      left: 3,
    };
    const yAxisFactor = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
    const radius = 5;
    const dopeColor = d3.schemeCategory10[1];
    const nonDopeColor = d3.schemeCategory10[0];
    const dopedBikers = didDope(bikedata, true);
    const nonDopedBikers = didDope(bikedata, false);

    // Setting up graph
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

    // Scale x-axis year
    const xScale = d3.scaleLinear();
    xScale.domain([
      d3.min(bikedata, (d) => d.YearToDate.getFullYear()),
      d3.max(bikedata, (d) => d.YearToDate.getFullYear()),
    ]);
    xScale.range([
      padding.left * xAxisFactor.left,
      width - padding.right * xAxisFactor.right,
    ]);

    // Scale y-axis minutes
    const yScale = d3.scaleLinear();
    yScale.domain([
      d3.min(bikedata, (d) => d.TimeToDate),
      d3.max(bikedata, (d) => d.TimeToDate),
    ]);
    yScale.range([height - padding.bottom, padding.top]);

    svg
      .selectAll("circle")
      .data(bikedata)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.YearToDate.getFullYear()))
      .attr("cy", (d) => yScale(d.TimeToDate))
      .attr("r", (d) => radius)
      .attr("data-xvalue", (d) => d.YearToDate.getFullYear())
      .attr("data-yvalue", (d) => d.TimeToDate)

      .style("fill", (d) => (d.Doping.length > 0 ? nonDopeColor : dopeColor));

    // X-axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + (height - padding.bottom) + ")")
      .call(xAxis);

    // Y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S "));
    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", "translate(" + padding.left * xAxisFactor.left + ",0)")
      .call(yAxis);

    svg
      .append("text")
      .style("font-size", "0.75em")
      .attr("id", "y-axis-title")
      .attr("x", width / 2)
      .attr("y", -1 * (xAxisFactor.left + xAxisFactor.left) * padding.left)
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-90," + width / 2 + "," + height / 2 + ")")
      .text("Time (MM:SS)");

    // Legend
    let legendContainer = svg
      .append("g")
      .attr("id", "legend")
      .attr("width", 100)
      .attr("height", 100)
      .attr("x", width / 2)
      .attr("y", height / 2)
      .text("testing");
  };

  return (
    <div id="scattergraph-container">
      <div id="scattergraph"></div>
    </div>
  );
}

export default App;
