/**
 * Service tree helpers (plan §4.2): a site's services are either top-level
 * (Growing's activities, Hikview's areas) or sub-services of an area
 * (`parent`), served at /services/<area>/<sub>. Dependency-free.
 */

type Rel = number | { id: number } | null | undefined;

export interface ServiceNode {
  id: number;
  slug: string;
  parent?: Rel;
}

export const parentId = (service: Pick<ServiceNode, "parent">): number | null => {
  const p = service.parent;
  return p === null || p === undefined ? null : typeof p === "object" ? p.id : p;
};

/** Locale-less path: /services/<slug> or /services/<area>/<slug>. */
export function servicePath(service: ServiceNode, all: readonly ServiceNode[]): string {
  const pid = parentId(service);
  const parent = pid === null ? undefined : all.find((s) => s.id === pid);
  return parent ? `/services/${parent.slug}/${service.slug}` : `/services/${service.slug}`;
}

export function topLevel<S extends ServiceNode>(all: readonly S[]): S[] {
  return all.filter((s) => parentId(s) === null);
}

export function childrenOf<S extends ServiceNode>(all: readonly S[], id: number): S[] {
  return all.filter((s) => parentId(s) === id);
}
