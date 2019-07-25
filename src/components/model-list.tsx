import * as React from 'react';
import { MemoryCache } from '@orbit/memory';
import { useCount } from '../orbit';

interface ModelListParams {
  cache: MemoryCache;
  selectedModelName: string;
  selectModel: (modelName: string) => void;
}

export default function ModelList({
  cache,
  selectedModelName,
  selectModel
}: ModelListParams) {
  return (
    <ul className="bg-white border-r border-gray-400">
      <li className="text-sm text-gray-500 p-2 text-center">Model Types</li>
      {Object.keys(cache.schema.models).map(modelName => {
        const isSelected = selectedModelName === modelName;
        return (
          <ModelItem
            key={modelName}
            cache={cache}
            isSelected={isSelected}
            modelName={modelName}
            selectModel={selectModel}
          />
        );
      })}
    </ul>
  );
}

interface ModelItemParams {
  cache: MemoryCache;
  modelName: string;
  isSelected: boolean;
  selectModel: (modelName: string) => void;
}

function ModelItem({
  cache,
  isSelected,
  selectModel,
  modelName
}: ModelItemParams) {
  const count = useCount(cache, q => q.findRecords(modelName));
  const linkColor = isSelected ? 'bg-blue-500 text-white' : 'text-gray-700';
  const pillColor = isSelected
    ? 'bg-blue-400 text-white'
    : 'bg-gray-400 text-black';
  return (
    <li key={modelName}>
      <a
        href="#"
        onClick={() => selectModel(modelName)}
        className={`flex items-center justify-between p-2 ${linkColor}`}
      >
        <div className="mr-5 text-xs">{modelName}</div>
        <div className={`rounded-full px-2 py-0 text-xs ${pillColor}`}>
          {count}
        </div>
      </a>
    </li>
  );
}
