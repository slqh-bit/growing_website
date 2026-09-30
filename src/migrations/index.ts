import * as migration_20260924_140928_initial from './20260924_140928_initial';
import * as migration_20260924_143136_hero_style from './20260924_143136_hero_style';
import * as migration_20260928_110614_status_history from './20260928_110614_status_history';
import * as migration_20260928_155418_quote_documents from './20260928_155418_quote_documents';
import * as migration_20260929_154016_sites from './20260929_154016_sites';
import * as migration_20260929_154030_drop_site_settings from './20260929_154030_drop_site_settings';
import * as migration_20260930_082300_multisite_content from './20260930_082300_multisite_content';
import * as migration_20260930_082326_drop_navigation_footer from './20260930_082326_drop_navigation_footer';
import * as migration_20260930_090146_service_tree_references from './20260930_090146_service_tree_references';

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
    name: '20260928_110614_status_history',
  },
  {
    up: migration_20260928_155418_quote_documents.up,
    down: migration_20260928_155418_quote_documents.down,
    name: '20260928_155418_quote_documents',
  },
  {
    up: migration_20260929_154016_sites.up,
    down: migration_20260929_154016_sites.down,
    name: '20260929_154016_sites',
  },
  {
    up: migration_20260929_154030_drop_site_settings.up,
    down: migration_20260929_154030_drop_site_settings.down,
    name: '20260929_154030_drop_site_settings',
  },
  {
    up: migration_20260930_082300_multisite_content.up,
    down: migration_20260930_082300_multisite_content.down,
    name: '20260930_082300_multisite_content',
  },
  {
    up: migration_20260930_082326_drop_navigation_footer.up,
    down: migration_20260930_082326_drop_navigation_footer.down,
    name: '20260930_082326_drop_navigation_footer',
  },
  {
    up: migration_20260930_090146_service_tree_references.up,
    down: migration_20260930_090146_service_tree_references.down,
    name: '20260930_090146_service_tree_references'
  },
];
