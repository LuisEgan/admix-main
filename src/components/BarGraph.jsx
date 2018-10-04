import React from 'react';
import { Bar } from "react-chartjs-2";

class BarGraph extends React.Component {

    render() {
        const { graphTitle, data, graphProps } = this.props;        

        return (
            <div className="graph">
            {graphTitle}
            <Bar
               data={data}
               {...graphProps}
            />
            </div>
        )
    }
}

export default BarGraph;