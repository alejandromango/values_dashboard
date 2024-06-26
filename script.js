const state = {
    data: [],
    wc: [],
    excluded: [],
    college: "",
    departments: []
};

function plotlyBar(data, selector, data_name, category){
    let trace1 = {
        y: data.map((d)=>d.old[category]),
        x: data.map((d)=>d.old[data_name]),
        name: '2018',
        type: 'bar',
        orientation: 'h'
    };


    let trace2 = {
        y: data.map((d)=>d.new[category]),
        x: data.map((d)=>d.new[data_name]),
        name: '2023',
        type: 'bar',
        orientation: 'h'
    };

    let traces = [trace2, trace1];
    let layout = {
        xaxis: {
          range: [0, 2]
        },
        barmode: 'group',
        margin:{l:200},
        legend: {
            orientation: "h",
            yanchor: "bottom",
            y: 1,
            x:0.5
        },
        xaxis: {
            title: {
                text: "Average Score"
            }
        }
    };

    Plotly.newPlot(selector, traces, layout, {responsive: true});
}


function middleBar(data, selector, data_name, category){
    let trace1 = {
        x: data.map((d)=>d[category]),
        y: data.map((d)=>d[data_name]),
        type: 'bar'
    };

    let traces = [trace1];
    let layout = {
        barmode: 'group',
        margin:{b:150},
        legend: {
            orientation: "h",
            yanchor: "bottom",
            y: 1,
            x:0.5
        },
        yaxis: {
            title: {
                text: "Difference in Ratios"
            }
        }
    };

    Plotly.newPlot(selector, traces, layout, {responsive: true});
}

function plotlyScatter(data, selector, data_name, category){
    let traces = data.map((d)=>{
       return {
        y: [d.new["tos_mean"],d.new["los_mean"]],
        x: [d.old["tos_mean"],d.old["los_mean"]],
        name: d.old[category],
        type: 'scatter',
        mode: 'markers',
        type: 'scatter',
        textposition: 'top center',
        marker: {
            size: 20,
            symbol: ['circle', 'square']
        } };
    });

    let layout = {
        xaxis: {
          range: [-0.1, 2.1],
          fixedrange: true,
          title: {
              text: "2018 Average Score"
          }
        },
        yaxis: {
          range: [-0.1, 2.1],
          fixedrange: true,
          title: {
              text: "2023 Average Score"
          }
        },
        legend: {
          y: 0.5,
          yref: 'paper',
          font: {
            family: 'Arial, sans-serif',
            size: 20,
            color: 'grey',
          }
        },
        shapes: [
            {
                type: 'line',
                x0: 0,
                y0: 0,
                x1: 2,
                y1: 2,
                line: {
                    color: 'rgb(0, 0, 0)',
                    width: 4,
                    dash: 'dashdot'

                },
                label: {
                    text: 'Score Increase',
                    font: { size: 20, color: 'black' },
                    textposition: 'end',
                    yanchor: 'bottom'
                }
            },
            {
                type: 'line',
                x0: 0,
                y0: 0,
                x1: 2,
                y1: 2,
                line: {
                    color: 'rgb(0, 0, 0)',
                    width: 4,
                    dash: 'dashdot'

                },
                label: {
                    text: 'Score Decrease',
                    font: { size: 20, color: 'black' },
                    textposition: 'end',
                    yanchor: 'top'
                }
            }
            ]
    };

    Plotly.newPlot(selector, traces, layout, {responsive: true});
}

function filterData() {
    let inter = state.data.filter((d) => {
        if (state.college && d.old.College !== state.college) {
            return false;
        }
        return true;
    });

    return inter.filter((d) => {
        if (state.departments.includes(d.old.Department)) {
            return true;
        }
        return false;
    });
}

function assignOptions(options, selectors){
    for (i=0;i<selectors.length;i++) {
        d3.select(selectors[i])
            .selectAll("option")
            .data(options)
            .enter()
            .append("option")
            .attr("value",(d)=>d)
            .text((d)=>d);
    };
}

function setupCharts(){
    var departments = Array.from(new Set(state.data.map((d)=>d.new["Department"])));
    state.departments = departments;
    assignOptions(departments, ["#department-select"]);
}

function updateApp() {
    const filtered = filterData();
    setupCharts()
    plotlyBar(filtered, "tos-bar", "tos_mean", "Department");
    plotlyBar(filtered, "los-bar", "los_mean", "Department");
    middleBar(state.wc, "service-bar", "change in service wc ratios over time", "Department");
    plotlyScatter(filtered, "scatter", "tos_mean", "Department");
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

d3.csv("sbs_service_word_counts.csv").then((parsed) => {
    state.wc = parsed.map((row) => {
        row["change in service wc ratios over time"] = parseFloat(row["change in service wc ratios over time"], 10);
        row["2018wc"] = parseFloat(row["2018wc"], 10);
        row["difference"] = parseFloat(row["difference"], 10);
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


d3.select("#department-select").on("change", function () {
    let values =[];
    const selected = d3.select(this) // select the select
    .selectAll("option:checked")  // select the selected values
    .each(function() { values.push(this.value) });
    state.departments = values;
    updateApp();
});