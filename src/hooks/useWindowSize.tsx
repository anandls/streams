import { useEffect, useState } from 'react';
//import { isBrowser } from '../utils';

function useWindowSize() {
  const [size, setSize] = useState([window.innerHeight, window.innerWidth]);
  useEffect(() => {
    const handleResize = () => {
      setSize([window.innerHeight, window.innerWidth]);
    };
    window.addEventListener('resize', handleResize);
    // Clean up!
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return size;
}

// function on (obj: Window, ...args: [string, () => void]) {
//   if (obj && obj.addEventListener) {
//     obj.addEventListener(...args);
//   }
// }
// function off(obj: Window, ...args: [string, () => void]) {
//   if (obj && obj.removeEventListener) {
//     obj.removeEventListener(...args);
//   }
// }

// const useWindowSize = (
//   initialWidth = Infinity,
//   initialHeight = Infinity
// ): { width: number; height: number } => {
//   const [state, setState] = useState({
//     width: isBrowser ? window.outerWidth : initialWidth,
//     height: isBrowser ? window.outerHeight : initialHeight,
//   });
//   useEffect(() => {
//     if (isBrowser) {
//       const handler = () => {
//         setState({
//           width: window.outerWidth,
//           height: window.outerHeight,
//         });
//       };
//       on(window, 'resize', handler);
//       return () => {
//         off(window, 'resize', handler);
//       };
//     }
//   }, []);
//   return state;
// };
export default useWindowSize;
