import React from 'react';
import { Progress } from 'semantic-ui-react';

const ProgressBar = ({ upload, percentUploaded }) => {
  return (
    upload === 'uploading' && (
      <Progress
        className="progress-bar"
        percent={percentUploaded}
        progress
        indicating
        size="medium"
        inverted
      />
    )
  );
};

export default ProgressBar;
