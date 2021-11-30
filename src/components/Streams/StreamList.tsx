import React, { useState, useEffect } from 'react';

import StreamGraph from './StreamGraph';
import useWindowSize from '../../hooks/useWindowSize';

import styles from './styles.module.scss';
import Select from '../common/select';
// export interface FormProps {
//   onSubmit: React.FormEventHandler;
// }

const StreamList: React.FC = () => {
  const [width] = useWindowSize();
  const [start, setStart] = useState<String>('');
  const [stop, setStop] = useState<String>('');
  const [error, setError] = useState<Boolean>(false);
  const [periods, setPeriods] = useState<any>([]);
  const [data, setData] = useState<any>([]);
  const [diff, setDiff] = useState<Number>();
  const [total, setTotal] = useState<Number>();

  let tot = 0;
  let totAll = 0;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods]);

  useEffect(() => {
    setTimeout(() => {
      setError(false);
    }, 3000);
  }, [error]);

  let totalPeriods = Object.keys(periods);

  const getTimeRanges = (interval: number) => {
    const ranges = [];
    const date = new Date();

    for (let minutes = 0; minutes < 24 * 60; minutes = minutes + interval) {
      date.setHours(0);
      date.setMinutes(minutes);
      ranges.push(
        date.toLocaleTimeString([], {
          hour: 'numeric',
          minute: 'numeric',
        })
      );
    }

    return ranges;
  };

  const times = getTimeRanges(15);

  const handleTimeChange = (type, period) => {
    type === 'start' ? setStart(period) : setStop(period);
  };

  const handleRemove = (e) => {
    e.stopPropagation();

    const index = e.currentTarget.getAttribute('data-index');
    const newPeriod = [...periods];
    newPeriod.splice(index, 1);

    setDiff(0);
    setTotal(0);

    setPeriods(newPeriod);
  };

  const handleAdd = () => {
    const startHourMin = start.split(':');
    const stopHourMin = stop.split(':');

    const startTime = new Date();
    startTime.setHours(parseInt(startHourMin[0]));
    startTime.setMinutes(parseInt(startHourMin[1]));

    const stopTime = new Date();
    stopTime.setHours(parseInt(stopHourMin[0]));
    stopTime.setMinutes(parseInt(stopHourMin[1]));

    if (startTime > stopTime) {
      setError(true);
      return;
    }

    let stream = `stream${totalPeriods.length + 1}`;

    start &&
      stop &&
      setPeriods((periods) => [...periods, { stream, start, stop }]);

    setStart('');
    setStop('');
    loadData();
  };

  let periodArr = periods
    ? Object.keys(periods).map((time) => {
        return { stream: time, period: periods[time] };
      })
    : null;

  const loadData = () => {
    let chartData = [];

    Object.entries(periodArr).map(([index, item]) => {
      let splitStartPeriod = item.period.start.split(':');
      let startHours = parseInt(splitStartPeriod[0]);
      let startMinutes = parseInt(splitStartPeriod[1]);

      let splitStopPeriod = item.period.stop.split(':');
      let stopHours = parseInt(splitStopPeriod[0]);
      let stopMinutes = parseInt(splitStopPeriod[1]);

      chartData.push([
        item.period.stream,
        new Date(0, 0, 0, startHours, startMinutes, 0),
        new Date(0, 0, 0, stopHours, stopMinutes, 0),
      ]);
      setData(chartData);
      return null;
    });

    findOverlappying(periods);
  };

  const totalTime = (value) => {
    totAll = totAll + value;
    setTotal(totAll);
  };

  const overlapTotal = (value) => {
    tot = tot + value;
    setDiff(tot);
  };

  const toMinutes = (time) => {
    const [hour, minute] = time.split(':');
    return Number(hour) * 60 + Number(minute);
  };

  const findOverlappying = (allPeriods) => {
    console.log('render');
    const l = allPeriods.length;
    const streamObj: Object = {};

    let totalStreamTime: Number;
    let difference: Number;

    for (let i = 0; i < l; i++) {
      for (let j = 0; j < l; j++) {
        const left = allPeriods[j];
        const right = allPeriods[i];

        streamObj[left.stream] = streamObj[left.stream] || {
          ...left,
          overlap: [],
        };

        if (i === j) {
          continue;
        }

        const leftStart = toMinutes(left.start);
        const leftStop = toMinutes(left.stop);
        const rightStart = toMinutes(right.start);
        const rightStop = toMinutes(right.stop);

        if (
          (leftStart > rightStart && leftStart < rightStop) ||
          (leftStop > rightStart && leftStop < rightStop)
        ) {
          streamObj[left.stream].overlap.push(right.stream);
        }
      }
    }

    //console.log(JSON.stringify(streamObj, null, 2));
    if (streamObj) {
      Object.keys(streamObj).map((key) => {
        let streamStart = streamObj[key].start.replace(':', '.');
        streamStart = parseFloat(streamStart) * 60;

        let streamStop = streamObj[key].stop.replace(':', '.');
        streamStop = parseFloat(streamStop) * 60;

        totalStreamTime = streamStop - streamStart;
        totalTime(totalStreamTime);

        console.log(
          `  ${streamObj[key].stream} :: ${streamStart} - ${streamStop} `
        );

        streamObj[key].overlap.map((el) => {
          const index = streamObj[el].overlap.indexOf(key);
          streamObj[el].overlap.splice(index, 1);
          return null;
        });

        return null;
      });

      Object.keys(streamObj).map((key) => {
        streamObj[key].overlap.map((el) => {
          let withFiltered = streamObj;

          let parentStart = withFiltered[key].start.replace(':', '.');
          parentStart = parseFloat(parentStart) * 60;

          let parentStop = withFiltered[key].stop.replace(':', '.');
          parentStop = parseFloat(parentStop) * 60;

          let childStart = withFiltered[el].start.replace(':', '.');
          childStart = parseFloat(childStart) * 60;

          let childStop = withFiltered[el].stop.replace(':', '.');
          childStop = parseFloat(childStop) * 60;

          if (childStop > parentStop) {
            difference = parentStop - childStart;
            overlapTotal(difference);
          }

          if (childStop < parentStop) {
            difference = childStop - parentStart;
            overlapTotal(difference);
          }
          return null;
        });
        return null;
      });
    }

    return streamObj;
  };

  let differenceTotal: Number = diff ? Number(diff) / 60 : 0;
  let displayStreamTotal: Number = total
    ? (Number(total) - Number(diff)) / 60
    : null;

  let checkTotalStream = Number('displayStreamTotal').toString() === 'NaN';

  console.log(checkTotalStream);
  return (
    <>
      <div className={styles.container}>
        <div>
          <h1>Streams</h1>
          <h2>
            To add a stream, please select start &amp; end times, then click the{' '}
            <span style={{ color: '#257aa6' }}>Add</span> button
          </h2>
          <form>
            <div className={styles.parent}>
              <div className={styles.child}>
                <label>Start Time: </label>
                <Select
                  value={start}
                  onChange={(value) => handleTimeChange('start', value)}
                  options={times}
                />
              </div>
              <div className={styles.child}>
                <label>End Time: </label>
                <Select
                  value={stop}
                  onChange={(value) => handleTimeChange('stop', value)}
                  options={times}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!periods && true}
                >
                  Add
                </button>
              </div>
            </div>
          </form>
          {error && (
            <div
              style={{
                paddingTop: '24px',
                paddingLeft: '4px',
                fontWeight: '500',
                color: 'red',
                letterSpacing: '2px',
              }}
            >
              Please select a later end time
            </div>
          )}
          <div>
            {periods.length > 0 && (
              <h3 style={{ paddingLeft: '4px', paddingTop: '10px' }}>Times</h3>
            )}
            <ul>
              {Object.entries(periodArr).map(([index, item]) => (
                <li data-index={index} key={item.stream}>
                  <div className={styles.item}>
                    <div className={styles.subitem}>
                      <span
                        style={{
                          textTransform: 'capitalize',
                          fontWeight: '500',
                          paddingRight: '15px',
                        }}
                      >
                        {item.period.stream}:
                      </span>
                      <span
                        style={{
                          textTransform: 'capitalize',
                          fontWeight: '400',
                        }}
                      >
                        start
                      </span>{' '}
                      <span style={{ letterSpacing: '2px', fontWeight: '600' }}>
                        {item.period.start}
                      </span>{' '}
                      - End{' '}
                      <span style={{ letterSpacing: '2px', fontWeight: '600' }}>
                        {item.period.stop}
                      </span>
                    </div>
                    <div>
                      <button
                        style={{
                          margin: '8px',
                          padding: '0 8px 0 8px',
                          borderRadius: '100px',
                        }}
                        aria-label={`remove todo ${index}`}
                        data-index={index}
                        onClick={handleRemove}
                      >
                        x
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {displayStreamTotal
              ? periods.length > 0 &&
                checkTotalStream && (
                  <div>
                    <div className={styles.totals}>
                      The total streaming time is :{' '}
                      {displayStreamTotal ? (
                        <span className={styles.greenbadge}>
                          {displayStreamTotal.toFixed(2)}
                        </span>
                      ) : null}{' '}
                      hour/s with{' '}
                      <span className={styles.orangebadge}>
                        {differenceTotal.toFixed(2)}
                      </span>{' '}
                      hour/s overlapping
                    </div>
                  </div>
                )
              : null}

            {periods.length > 0 ? (
              <StreamGraph chartData={data} width={width} />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};
export default StreamList;
