const state = {
    data: [],
    college: "",
  };

  function createBarChart(svgSelector) {
    const margin = { top: 40, bottom: 10, left: 300, right: 20 };
      const width = 800 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;

      // Creates sources <svg> element
      const svg = d3
        .select(svgSelector)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      // Group used to enforce margin
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      // Global variable for all data
      let data;

      // Scales setup
      const xscale = d3.scaleLinear().range([0, width]);
      const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.1);

      // Axis setup
      const xaxis = d3.axisTop().scale(xscale);
      const g_xaxis = g.append("g").attr("class", "x axis");
      const yaxis = d3.axisLeft().scale(yscale);
      const g_yaxis = g.append("g").attr("class", "y axis");

      function update(new_data, data_key, cat_key) {
        //update the scales
        xscale.domain([0, 2]);
        yscale.domain(new_data.map((d) => d[cat_key]));
        //render the axis
        g_xaxis.transition().call(xaxis);
        g_yaxis.transition().call(yaxis);

        // Render the chart with new data

        // DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
        const rect = g
          .selectAll("rect")
          .data(new_data, (d) => d[cat_key])
          .join(
            // ENTER
            // new elements
            (enter) => {
              const rect_enter = enter.append("rect").attr("x", 0);
              rect_enter.append("title");
              return rect_enter;
            },
            // UPDATE
            // update existing elements
            (update) => update,
            // EXIT
            // elements that aren't associated with data
            (exit) => exit.remove()
          );

        // ENTER + UPDATE
        // both old and new elements
        rect
          .transition()
          .attr("height", yscale.bandwidth())
          .attr("width", (d) => xscale(d[data_key]))
          .attr("y", (d) => yscale(d[cat_key]))
          .attr("fill", function(d){
            if (d.Year === 2018) {
                return "grey";
            } else {
                return "steelblue";
            }
          })
          .attr("fill-opacity", function(d){
            if (d.Year === 2018) {
                return 0.9;
            } else {
                return 0.5;
            }
          });

        rect.select("title").text((d) => d.Year);
      }

      return update;
  }

  function createScatter(svgSelector){
        // Specify the chart’s dimensions.
    const width = 500;
    const height = 300;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 100;

    // Create the horizontal (x) scale, positioning N/A values on the left margin.
    const x = d3.scaleLinear()
        .domain([-1,2])
        .range([marginLeft, width - marginRight])
        .unknown(marginLeft);

    // Create the vertical (y) scale, positioning N/A values on the bottom margin.
    const y = d3.scaleLinear()
        .domain([-1,2])
        .range([height - marginBottom, marginTop])
        .unknown(height - marginBottom);

    // Create the SVG container.
    const svg = d3.select(svgSelector)
        .attr("viewBox", [0, 0, width, height])
        .property("value", []);

    // Append the axes.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", width - marginRight)
            .attr("y", -4)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .text("2018 Score"));

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("2023 Score"));

    function update(oldData, newData){
        const combinedData = {"old": oldData,
                "new": newData}
        // Append the dots.
        console.log(oldData);
        console.log(newData);
        const dot = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(combinedData)
            .join("circle")
            .attr("transform", d => `translate(${x(d.old["tos_mean"])},${y(d.new["tos_mean"])})`)
            .attr("r", 3);
    }
    return update;
  }

  /////////////////////////
  const tosBar = createBarChart("#tos-bar")
  const losBar = createBarChart("#los-bar")
  const cpagBar = createBarChart("#cpag-bar")
  const totalScatter = createScatter("#scatter")

  function filterData() {
    return state.data.filter((d) => {
      if (state.college && d.College !== state.college) {
        return false;
      }
      return true;
    });
  }

  function updateApp() {
    const filtered = filterData();
    console.log(filtered)
    tosBar(filtered, "tos_mean", "Department")
    losBar(filtered, "los_mean", "Department")
    cpagBar(filtered, "cpag_mean", "Department")
    totalScatter(filtered.filter((d) => {
                    if (d.Year === 2018) {
                    return true;
                    }
                    return false;}),
                filtered.filter((d) => {
                    if (d.Year === 2023) {
                    return true;
                    }
                    return false;}));
  }

  d3.csv("values_comparison.csv").then((parsed) => {
    state.data = parsed.map((row) => {
      row.Year = parseInt(row.Year, 10);
      row.tos_mean = parseFloat(row.tos_mean);
      row.los_mean = parseFloat(row.los_mean);
      row.cpag_mean = parseFloat(row.cpag_mean);
      return row;
    });

    updateApp();
  });

  //interactivity
  d3.select("#college-select").on("change", function () {
    const selected = d3.select(this).property("value");
    state.college = selected;
    updateApp();
  });