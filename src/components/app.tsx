import * as React from 'react';
import { useState } from 'react';
import { MemoryCache } from '@orbit/memory';

import ModelList from './model-list';
import RecordList from './record-list';

interface Params {
  cache: MemoryCache;
}

export default function App({ cache }: Params) {
  const firstModelName = Object.keys(cache.schema.models)[0];
  const [modelName, selectModel] = useState(firstModelName);

  return (
    <div className="flex">
      <ModelList
        cache={cache}
        selectedModelName={modelName}
        selectModel={selectModel}
      />
      <div className="flex-grow">
        <RecordList cache={cache} modelName={modelName} />
      </div>
    </div>
  );
}
