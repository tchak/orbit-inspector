import * as React from 'react';
import { useState, useContext } from 'react';

import { Context } from '../orbit';
import ModelList from './model-list';
import RecordList from './record-list';

export default function App() {
  const schema = useContext(Context).schema;
  const firstModelName = Object.keys(schema.models)[0];
  const [modelName, selectModel] = useState(firstModelName);

  return (
    <div className="flex">
      <ModelList selectedModelName={modelName} selectModel={selectModel} />
      <div className="flex-grow">
        <RecordList modelName={modelName} />
      </div>
    </div>
  );
}
