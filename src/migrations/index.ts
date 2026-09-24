import * as migration_20260924_140928_initial from './20260924_140928_initial';

export const migrations = [
  {
    up: migration_20260924_140928_initial.up,
    down: migration_20260924_140928_initial.down,
    name: '20260924_140928_initial'
  },
];
