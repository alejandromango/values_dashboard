const state = {
    data: [],
    college: "",
  };

  function createBarChart(svgSelector) {
    const margin = { top: 40, bottom: 40, left: 300, right: 20 };
      const width = 920 - margin.left - margin.right;
      const height = 680 - margin.top - margin.bottom;

      // Creates sources <svg> element
      const svg = d3
        .select(svgSelector)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      // Group used to enforce margin
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales setup
      const xscale = d3.scaleLinear().range([0, width]);
      const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.1);

      // Axis setup
      const xaxis = d3.axisBottom().scale(xscale);
      const g_xaxis = g.append("g").attr("class", "x axis")
      .attr("transform", `translate(0,${height})`);
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
    const margin = { top: 40, bottom: 40, left: 300, right: 20 };
    const width = 920 - margin.left - margin.right;
    const height = 680 - margin.top - margin.bottom;

    // Creates sources <svg> element
    const svg = d3
        .select(svgSelector)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Group used to enforce margin
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    // Create the horizontal (x) scale, positioning N/A values on the left margin.
    const xscale = d3.scaleLinear()
        .range([0, width])
        .unknown(0);

    // Create the vertical (y) scale, positioning N/A values on the bottom margin.
    const yscale = d3.scaleLinear()
        .range([height, 0])
        .unknown(height);

    // Axis setup
    const xaxis = d3.axisBottom().scale(xscale);
    const g_xaxis = g.append("g").attr("class", "x axis")
        .attr("transform", `translate(0,${height})`);
    const yaxis = d3.axisLeft().scale(yscale);
    const g_yaxis = g.append("g").attr("class", "y axis");

    function update(oldData, newData){
        //update the scales
        xscale.domain([-1, 2]);
        yscale.domain([-1, 2]);
        //render the axis
        g_xaxis.transition().call(xaxis);
        g_yaxis.transition().call(yaxis);

        const combinedData = {"old": oldData,
                "new": newData}
        // Append the dots.
        console.log(combinedData.new);
        // console.log(combinedData.old);
        // const dot = svg.append("g")
        //     .attr("fill", "none")
        //     .attr("stroke", "steelblue")
        //     .attr("stroke-width", 1.5)
        //     .selectAll("circle")
        //     .data(combinedData)
        //     .join("circle")
        //     .attr("transform", d => `translate(${x(d.old["tos_mean"])},${y(d.new["tos_mean"])})`)
        //     .attr("r", 3);
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