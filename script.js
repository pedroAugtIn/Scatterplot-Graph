fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
  .then(response => response.json())
  .then(data => {
    const dataset = data;

    const w = 920;
    const h = 630;
    const padding = 70;

    function Time(time) {
      time = time.split(':');

      let date = new Date();
      date.setMinutes(time[0])
      date.setSeconds(time[1])

      return date.getTime();
    }

    const customTimeFormat = d3.timeFormat("%M:%S");

    const firstYear = d3.min(dataset, d => d.Year);
    const lastYear = d3.max(dataset, d => d.Year);

    const slowestTime = d3.max(dataset, d => d.Seconds);
    const fastestTime = d3.min(dataset, d => d.Seconds);

    const xScale = d3.scaleLinear()
      .domain([firstYear - 1, lastYear + 1])
      .range([padding, w - padding]);

    const yScale = d3.scaleTime()
      .domain([fastestTime, slowestTime])
      .range([padding, h - padding]);

    const svg = d3.select('body')
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    let tooltip = d3.select('body')
      .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0)
      .attr("data-date", "");

    svg.selectAll("circle")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.Year))
      .attr("cy", d => yScale(d.Seconds))
      .attr("r", 5)
      .attr("class", "dot")
      .attr("fill", d => d.Doping !== "" ? "red" : "blue")
      .attr("data-xvalue", d => d.Year)
      .attr('data-yvalue', d => (new Date(Time(d.Time))).toISOString())

      .on("mouseover", function (event, d) {
        const circle = this.getBoundingClientRect();
        const xPosition = d3.select(this).attr("cx");
        const yPosition = circle.top + 10;

        const dataDate = d3.select(this).attr("data-xvalue")

        const doping = d.Doping !== "" ? "<br><br>" + d.Doping : "";

        tooltip.transition()
          .style("opacity", .9);

        tooltip.html(`${d.Name}, ${d.Nationality}<br>${dataDate}, ${d.Time}${doping}`)
          .style("left", (xPosition) + "px")
          .style("top", (yPosition) + "px")
          .attr("data-date", dataDate)
          .attr("data-year", d.Year);

      })
      .on("mouseout", function (d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => customTimeFormat(new Date(0, 0, 0, 0, Math.floor(d / 60), d % 60)));

    svg.append("g")
      .attr("transform", "translate(0," + (h - padding) + ")")
      .attr("id", "x-axis")
      .call(xAxis);

    svg.append("g")
      .attr("transform", "translate(" + padding + ",0)")
      .attr("id", "y-axis")
      .call(yAxis);

    svg.append("text")
      .attr("x", w / 2)
      .attr("y", padding / 2)
      .attr("text-anchor", "middle")
      .attr("id", "title")
      .text("Doping in Professional Bicycle Racing")
      .attr("font-size", 20);

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", "translate(" + (w - padding * 3) + "," + (h / 2) + ")");

    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", -20)
      .attr("r", 3)
      .style("fill", "red");

    legend.append("text")
      .attr("x", 15)
      .attr("y", -15)
      .text("Doping Allegations")
      .style("font-size", "14px")
      .attr("alignment-baseline", "middle");

    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 20)
      .attr("r", 3)
      .style("fill", "blue");

    legend.append("text")
      .attr("x", 15)
      .attr("y", 25)
      .text("No Doping Allegations")
      .style("font-size", "14px")
      .attr("alignment-baseline", "middle");
  })