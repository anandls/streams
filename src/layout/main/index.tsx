import React from 'react';

import styles from './styles.module.scss';

import Stream from '../../views/Stream';

const Main: React.FC = () => {
  return (
    <>
      <div className={styles.main}>
        <Stream />
      </div>
    </>
  );
};

export default Main;
