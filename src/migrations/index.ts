import * as migration_20260924_140928_initial from './20260924_140928_initial';
import * as migration_20260924_143136_hero_style from './20260924_143136_hero_style';
import * as migration_20260928_110614_status_history from './20260928_110614_status_history';

export const migrations = [
  {
    up: migration_20260924_140928_initial.up,
    down: migration_20260924_140928_initial.down,
    name: '20260924_140928_initial',
  },
  {
    up: migration_20260924_143136_hero_style.up,
    down: migration_20260924_143136_hero_style.down,
    name: '20260924_143136_hero_style',
  },
  {
    up: migration_20260928_110614_status_history.up,
    down: migration_20260928_110614_status_history.down,
    name: '20260928_110614_status_history'
  },
];
