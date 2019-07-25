import { Source } from '@orbit/data';
import MemorySource from '@orbit/memory';
import Coordinator, {
  SyncStrategy,
  EventLoggingStrategy
} from '@orbit/coordinator';

export default async function Orbit(source: Source) {
  const memory = new MemorySource({ schema: source.schema });

  const eventLog = new EventLoggingStrategy();
  const sync = new SyncStrategy({
    source: source.name,
    target: 'memory',

    blocking: false
  });

  const coordinator = new Coordinator({
    sources: [memory, source],
    strategies: [eventLog, sync]
  });

  await coordinator.activate();

  return memory;
}
