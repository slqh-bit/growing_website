import { Gutter } from "@payloadcms/ui";
import { ArrowLeft, Plus, Search } from "lucide-react";
import Link from "next/link";
import type { ServerProps, Where } from "payload";
import { devisStatusOptions } from "@/cms/options";
import { inboxTabs, parseTab, tabStatuses, type InboxTab } from "@/lib/devis/inbox";
import { pick, type FormSnapshot } from "@/lib/devis/form-def";
import { governorateOptions, labelOf } from "@/lib/devis/options";
import type { DevisRequest } from "@/payload-types";
import { accentStyle, adminLang, currentWorkspace, type Lang } from "../shared";
import { RequestDetail } from "./request-detail";
import { inboxText } from "./text";

const PAGE_SIZE = 25;
const BASE = "/admin/collections/devis-requests";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** "il y a 2 h" / "2 h ago": how long a request has been waiting. */
function ago(date: string, lang: Lang): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60_000));
  const format = new Intl.RelativeTimeFormat(lang, { numeric: "always", style: "narrow" });
  if (minutes < 60) return format.format(-minutes, "minute");
  if (minutes < 60 * 24) return format.format(-Math.round(minutes / 60), "hour");
  return format.format(-Math.round(minutes / (60 * 24)), "day");
}

/** What a list row says under the client's name: the service asked for and where. */
function subject(request: DevisRequest, lang: Lang): string {
  const service =
    typeof request.service === "object" && request.service
      ? request.service.title
      : pick((request.formSnapshot as FormSnapshot | null)?.serviceTitle, lang);
  return [service, labelOf(governorateOptions, request.region, lang)].filter(Boolean).join(" · ");
}

/**
 * Quote-request inbox (replaces the collection's list): the workspace's
 * requests by stage on one side, the selected one on the other. The tab, the
 * search and the selection live in the URL, so a request can be linked to.
 */
export async function Inbox({ payload, user, i18n, searchParams }: ServerProps) {
  if (!user) return null;
  const lang = adminLang(i18n);
  const t = inboxText[lang];
  const params = (searchParams ?? {}) as SearchParams;
  const tab = parseTab(params.tab);
  const q = first(params.q)?.trim() ?? "";
  const page = Math.max(1, Number(first(params.page)) || 1);
  const selectedId = Number(first(params.id)) || null;

  const { current } = await currentWorkspace(payload, user);
  const inSite: Where[] = current ? [{ site: { equals: current.id } }] : [];
  const matching: Where[] = q
    ? [{ or: ["reference", "fullName", "phone", "email"].map((field) => ({ [field]: { like: q } })) }]
    : [];
  const inTab = (name: InboxTab): Where => ({ and: [...inSite, { status: { in: tabStatuses(name) } }, ...matching] });

  // Everything is read with the user's own access: an editor only ever gets their sites' requests.
  const [list, counts, selected] = await Promise.all([
    payload.find({
      collection: "devis-requests",
      where: inTab(tab),
      sort: "-createdAt",
      limit: PAGE_SIZE,
      page,
      depth: 1,
      locale: lang,
      overrideAccess: false,
      user,
    }),
    Promise.all(
      inboxTabs.map((name) =>
        payload.count({ collection: "devis-requests", where: inTab(name), overrideAccess: false, user }),
      ),
    ),
    selectedId
      ? payload
          .findByID({ collection: "devis-requests", id: selectedId, depth: 1, locale: lang, overrideAccess: false, user })
          .catch(() => null)
      : null,
  ]);

  // Wide screens always show a request; phones show the list until one is chosen.
  const shown = selected ?? list.docs[0] ?? null;
  const query = (changes: Record<string, string | number | null>) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries({ tab, q: q || null, ...changes })) {
      if (value !== null && value !== "") next.set(key, String(value));
    }
    return `${BASE}?${next}`;
  };

  return (
    <Gutter className={selected ? "ws-inbox ws-inbox--chosen" : "ws-inbox"}>
      <div style={accentStyle(current)}>
        <header className="ws-inbox__header">
          <h1>{t.title}</h1>
          <form className="ws-search" action={BASE} role="search">
            <input type="hidden" name="tab" value={tab} />
            <label className="ws-visually-hidden" htmlFor="ws-inbox-search">
              {t.search}
            </label>
            <Search size={16} aria-hidden="true" />
            <input id="ws-inbox-search" type="search" name="q" defaultValue={q} placeholder={t.searchPlaceholder} />
          </form>
          <Link href={`${BASE}/create`} className="ws-button" prefetch={false}>
            <Plus size={16} aria-hidden="true" />
            {t.newRequest}
          </Link>
        </header>

        <div className="ws-inbox__panes">
          <section className="ws-inbox__list" aria-label={t.title}>
            <nav className="ws-tabs" aria-label={t.steps}>
              {inboxTabs.map((name, index) => (
                <Link
                  key={name}
                  href={query({ tab: name, page: null })}
                  className={name === tab ? "ws-tabs__tab ws-tabs__tab--active" : "ws-tabs__tab"}
                  aria-current={name === tab ? "page" : undefined}
                  prefetch={false}
                >
                  {t.tabs[name]}
                  <span className="ws-tabs__count">{counts[index]?.totalDocs ?? 0}</span>
                </Link>
              ))}
            </nav>

            {list.docs.length === 0 ? (
              <p className="ws-empty">{q ? t.noMatch : t.empty[tab]}</p>
            ) : (
              <ul className="ws-rows">
                {list.docs.map((request) => (
                  <li key={request.id}>
                    <Link
                      href={query({ id: request.id, page: page > 1 ? page : null })}
                      className={request.id === shown?.id ? "ws-row ws-row--active" : "ws-row"}
                      aria-current={request.id === shown?.id ? "true" : undefined}
                      prefetch={false}
                    >
                      <span className="ws-row__top">
                        <span className="ws-row__name">{request.fullName}</span>
                        <span className="ws-row__time">{ago(request.createdAt, lang)}</span>
                      </span>
                      <span className="ws-row__subject">{subject(request, lang) || request.reference}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {(list.hasPrevPage || list.hasNextPage) && (
              <nav className="ws-pager">
                {list.hasPrevPage ? <Link href={query({ page: page - 1 })}>{t.previous}</Link> : <span />}
                {list.hasNextPage && <Link href={query({ page: page + 1 })}>{t.next}</Link>}
              </nav>
            )}
          </section>

          <section className="ws-inbox__detail">
            {shown ? (
              <>
                <Link href={query({ page: page > 1 ? page : null })} className="ws-inbox__back" prefetch={false}>
                  <ArrowLeft size={16} aria-hidden="true" className="ws-flip" />
                  {t.back}
                </Link>
                <RequestDetail
                  request={shown}
                  lang={lang}
                  statusLabels={Object.fromEntries(devisStatusOptions.map((option) => [option.value, option.label[lang]]))}
                />
              </>
            ) : (
              <p className="ws-empty">{t.pick}</p>
            )}
          </section>
        </div>
      </div>
    </Gutter>
  );
}
