import { AdapterEvents, AdapterInterface, AdapterOption } from '../core';

export interface RegistryEvents extends AdapterEvents {
  adapterUpdated: AdapterInterface | null;
  adapterOptionsUpdated: readonly AdapterOption[];
}

export interface RegistryInterface extends Omit<AdapterInterface, 'id' | 'name' | 'initialConnect'> {
  activeAdapter: AdapterInterface | null;
}
