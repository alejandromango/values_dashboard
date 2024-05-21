const state = {
    data: [],
    excluded: [],
    college: "",
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
    };

    Plotly.newPlot(selector, traces, layout, {responsive: true});
}

function plotlyScatter(data, selector, data_name, category){
    let trace = {
        y: data.map((d)=>d.new[data_name]),
        x: data.map((d)=>d.old[data_name]),
        text: data.map((d)=>d.old[category]),
        type: 'scatter',
        mode: 'markers',
        type: 'scatter',
        textposition: 'top center',
        marker: { size: 20 }
    };
    let layout = {
        xaxis: {
          range: [0, 2]
        },
        yaxis: {
          range: [0, 2]
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
              type: 'path',
              path: 'M 0 0 L 0 2 L 2 2 Z',
              fillcolor: 'rgba(44, 160, 101, 0.5)',
              opacity: 0.2
            },
            {
              type: 'path',
              path: 'M 0 0 L 2 0 L 2 2 Z',
              fillcolor: 'rgba(160, 44, 101, 0.5)',
              opacity: 0.2
            }]
    };

    Plotly.newPlot(selector, [trace], layout, {responsive: true});
}

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
    plotlyBar(filtered, "tos-bar", "tos_mean", "Department")
    plotlyBar(filtered, "los-bar", "los_mean", "Department")
    plotlyBar(filtered, "cpag-bar", "cpag_mean", "Department")
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

//interactivity
d3.select("#college-select").on("change", function () {
    const selected = d3.select(this).property("value");
    state.college = selected;
    updateApp();
});