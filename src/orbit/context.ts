import { createContext } from 'react';
import MemorySource from '@orbit/memory';
import { Schema } from '@orbit/data';

const defaultSource = new MemorySource({ schema: new Schema() });
export const Context = createContext<MemorySource>(defaultSource);
export const Provider = Context.Provider;
export const Consumer = Context.Consumer;
