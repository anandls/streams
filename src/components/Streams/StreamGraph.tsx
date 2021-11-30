import React, { useState, useEffect } from 'react';
import Chart from 'react-google-charts';

const StreamGraph = ({ chartData, width }) => {
  const [newWidth, setWidth] = useState<string>('');
  const columns = [
    { type: 'string', id: 'Stream' },
    { type: 'date', id: 'Start' },
    { type: 'date', id: 'End' },
  ];

  useEffect(() => {
    let changeWidth = width > 968 ? '68em' : '68em';
    setWidth(changeWidth);
  }, [width]);

  let cdata = [columns, ...chartData];

  return (
    <>
      {newWidth ? (
        <Chart
          width={newWidth}
          height={'300px'}
          chartType="Timeline"
          loader={<div>Loading Chart</div>}
          data={cdata}
          // options={
          //   {
          //     // showRowNumber: false,
          //   }
          // }
          options={{
            chartArea: {
              width: '100%',
            },
          }}
          rootProps={{ 'data-testid': '1' }}
        />
      ) : null}
    </>
  );
};

export default StreamGraph;
