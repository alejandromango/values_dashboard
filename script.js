const state = {
    data: [],
    excluded: [],
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
        yscale.domain(new_data.map((d) => d.old[cat_key]));
        //render the axis
        g_xaxis.transition().call(xaxis);
        g_yaxis.transition().call(yaxis);

        // Render the chart with new data

        // DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
        const rect_old = g
            .selectAll(".rect_old")
            .data(new_data, (d) => d.old[cat_key])
            .join(
                // ENTER
                // new elements
                (enter) => {
                    const rect_enter = enter.append("rect").attr("x", 0)
                        .attr('class', 'rect_old')
                        .attr("fill", "grey")
                        .attr("fill-opacity", 0.5);
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

        // DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
        const rect_new = g
            .selectAll(".rect_new")
            .data(new_data, (d) => d.new[cat_key])
            .join(
                // ENTER
                // new elements
                (enter) => {
                    const rect_enter = enter.append("rect").attr("x", 0)
                        .attr('class', 'rect_new')
                        .attr("fill", "steelblue")
                        .attr("fill-opacity", 0.8);
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
        rect_old
            .transition()
            .attr("height", yscale.bandwidth())
            .attr("width", (d) => xscale(d.old[data_key]))
            .attr("y", (d) => yscale(d.old[cat_key]));

        rect_new
            .transition()
            .attr("height", yscale.bandwidth())
            .attr("width", (d) => xscale(d.new[data_key]))
            .attr("y", (d) => yscale(d.new[cat_key]));

        // rect.select("title").text((d) => d.Year);
    }

    return update;
}

function createScatter(svgSelector) {
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

    //update the scales
    xscale.domain([0, 2]);
    yscale.domain([0, 2]);
    g.append("line")
        .attr("x1", xscale(0))
        .attr("y1", yscale(0))
        .attr("x2", xscale(2))
        .attr("y2", yscale(2))
        .attr("stroke", "black")
        .attr("stroke-width", 4);
    g.append("polygon")
        .attr("points", `${xscale(0)},${yscale(0)} ${xscale(2)},${yscale(0)} ${xscale(2)},${yscale(2)}`)
        .attr("fill-opacity", 0.5)
        .attr("fill", "pink");
    g.append("polygon")
        .attr("points", `${xscale(0)},${yscale(0)} ${xscale(0)},${yscale(2)} ${xscale(2)},${yscale(2)}`)
        .attr("fill-opacity", 0.5)
        .attr("fill", "lightgreen");
    function update(new_data, cat_key) {
        //render the axis
        g_xaxis.transition().call(xaxis);
        g_yaxis.transition().call(yaxis);
        const circle = g
            .selectAll("circle")
            .data(new_data, (d) => d.old["Department"])
            .join(
                // ENTER
                // new elements
                (enter) => {
                    const circle_enter = enter.append("circle")
                        .attr("fill-opacity", 0.5)
                        .attr("fill", "steelblue");
                    circle_enter.append("title");
                    return circle_enter;
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
        circle
            .transition()
            .attr("r", 20)
            .attr("cx", (d) => {
                tos = d.old["tos_mean"];
                los = d.old["los_mean"];
                cpag = d.old["cpag_mean"];
                mean = (tos + los + cpag) / 3.0;
                return xscale(mean)
            })
            .attr("cy", (d) => {
                tos = d.new["tos_mean"];
                los = d.new["los_mean"];
                cpag = d.new["cpag_mean"];
                mean = (tos + los + cpag) / 3.0;
                return xscale(mean)
            });

        circle.select("title").text((d) => d.old["Department"]);
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
        if (state.college && d.old.College !== state.college) {
            return false;
        }
        return true;
    });
}

function updateApp() {
    const filtered = filterData();
    tosBar(filtered, "tos_mean", "Department")
    losBar(filtered, "los_mean", "Department")
    cpagBar(filtered, "cpag_mean", "Department")
    totalScatter(filtered, "tos_mean");
}

d3.csv("values_comparison.csv").then((parsed) => {
    state.data = parsed.map((row) => {
        row.Year = parseInt(row.Year, 10);
        row.tos_mean = parseFloat(row.tos_mean);
        row.los_mean = parseFloat(row.los_mean);
        row.cpag_mean = parseFloat(row.cpag_mean);
        return row;
    });
    state.data = state.data.map((row) => {
        if (row.Year === 2018) {
            return {
                "old": row,
                "new": state.data.filter(function (d) {
                    if ((d.Department === row.Department) & (d.Year === 2023)) {
                        return true;
                    }
                    return false;
                })[0]
            };
        }
    });

    state.data = state.data.filter((d) => d !== undefined)
    state.data = state.data.filter((d) => !isNaN(d.new["cpag_mean"]))
    state.excluded = state.data.filter((d) => isNaN(d.new["cpag_mean"]))
    updateApp();
});

//interactivity
d3.select("#college-select").on("change", function () {
    const selected = d3.select(this).property("value");
    state.college = selected;
    updateApp();
});