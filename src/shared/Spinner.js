import React from 'react';
import { Loader, Dimmer } from 'semantic-ui-react';

export default function() {
  return (
    <Dimmer active>
      <Loader size="huge" content={'Loading...'}/>
    </Dimmer>
  );
}
