import * as React from 'react';
import { useContext } from 'react';
import { DateTime } from 'luxon';
import {
  Record,
  Schema,
  RelationshipDefinition,
  AttributeDefinition
} from '@orbit/data';

import { Context, useQuery } from '../orbit';

interface RecordListParams {
  modelName: string;
}

export default function RecordList({ modelName }: RecordListParams) {
  const schema = useContext(Context).schema;
  const [{ data }] = useQuery(q => q.findRecords(modelName));
  const records = (data || []) as Record[];
  const columns = getColumns(schema, modelName);

  return (
    <div className="bg-white">
      <table className="text-left w-full border-collapse">
        <thead>
          <tr>
            <th className="py-2 px-3 bg-gray-100 uppercase text-sm text-gray-500 border-b border-gray-400 max-w-xs">
              ID
            </th>
            {columns.map(column => {
              return (
                <th
                  className="py-2 px-3 bg-gray-100 uppercase text-sm text-gray-500 border-b border-gray-400 max-w-xs"
                  key={column.name}
                >
                  {column.name}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {records.map(record => {
            return (
              <tr
                className="hover:bg-gray-100 text-sm"
                key={`${record.type}-${record.id}`}
              >
                <td className="py-2 px-3 border-b border-gray-400">
                  {record.id}
                </td>
                {columns.map(column => {
                  return (
                    <td
                      className="py-2 px-3 border-b border-gray-400"
                      key={column.name}
                    >
                      {getColumnValue(column, record)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface Column {
  isAttribute: boolean;
  isRelationship: boolean;
  name: string;
  meta: RelationshipDefinition | AttributeDefinition;
}

function getColumnValue(column: Column, record: Record): string {
  if (column.isAttribute) {
    const value = record.attributes && record.attributes[column.name];
    if (value && value instanceof Date) {
      return DateTime.fromJSDate(value).toISODate();
    }
    return value;
  } else {
    const relationship =
      record.relationships && record.relationships[column.name];
    if (relationship && relationship.data) {
      if (Array.isArray(relationship.data)) {
        return relationship.data.map(identity => identity.id).join(', ');
      } else {
        return relationship.data.id;
      }
    }
  }
}

function getColumns(schema: Schema, modelName: string) {
  const columns: Column[] = [];
  schema.eachAttribute(modelName, (attributeName, attribute) => {
    columns.push({
      isAttribute: true,
      isRelationship: false,
      name: attributeName,
      meta: attribute
    });
  });
  schema.eachRelationship(modelName, (relationshipName, relationship) => {
    columns.push({
      isAttribute: false,
      isRelationship: true,
      name: relationshipName,
      meta: relationship
    });
  });
  return columns;
}
