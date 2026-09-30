import type { SiteKey } from "../../src/sites/config";
import type { Localized } from "./types";

/**
 * The group (Paramètres → Groupe) and the default cross-selling between its
 * companies (plan §3.3, §4.3). Seeded once; edited in the admin afterwards.
 * The group's name is a placeholder until the holding name is decided.
 */
export const group = {
  name: {
    fr: "Groupe Growing & Hikview",
    ar: "مجموعة Growing وHikview",
    en: "Growing & Hikview Group",
  } satisfies Localized,
  tagline: {
    fr: "Deux sociétés d'ingénierie basées à Sbeitla : l'énergie solaire et la sécurité électronique au service des particuliers, des entreprises et des institutions.",
    ar: "شركتا هندسة مقرّهما سبيطلة: الطاقة الشمسية والأمن الإلكتروني في خدمة الخواص والمؤسسات والهياكل العمومية.",
    en: "Two engineering companies based in Sbeitla: solar energy and electronic security for homes, businesses and public institutions.",
  } satisfies Localized,
  story: {
    fr: "Growing Technologies et Hikview Engineering partagent la même équipe dirigeante, la même exigence technique et le même ancrage dans le centre-ouest tunisien.\n\nEnsemble, elles couvrent l'énergie — pompage solaire, installations raccordées, sites isolés, centrales photovoltaïques — et les technologies du bâtiment et de la ville : sécurité électronique, réseaux, solutions de gestion, audiovisuel, IoT et projets publics. Un client peut ainsi confier à un seul groupe l'alimentation, la sécurité et la connectivité de son site.",
    ar: "تتقاسم Growing Technologies وHikview Engineering نفس الفريق المسيّر ونفس الصرامة التقنية ونفس الجذور في الوسط الغربي التونسي.\n\nتغطّي الشركتان معاً الطاقة — الضخّ الشمسي والتركيبات المربوطة بالشبكة والمواقع المعزولة والمحطات الكهروضوئية — وتقنيات البناء والمدينة: الأمن الإلكتروني والشبكات وحلول التسيير والسمعي البصري وإنترنت الأشياء والمشاريع العمومية. يمكن للحريف بذلك أن يعهد لمجموعة واحدة بتزويد موقعه بالطاقة وتأمينه وربطه.",
    en: "Growing Technologies and Hikview Engineering share the same management team, the same technical standards and the same roots in central-west Tunisia.\n\nTogether they cover energy — solar pumping, grid-connected systems, off-grid sites, PV plants — and building and city technologies: electronic security, networks, management solutions, AV, IoT and public-sector projects. A client can entrust one group with powering, securing and connecting their site.",
  } satisfies Localized,
  members: [
    {
      site: "growing",
      summary: {
        fr: "Installateur solaire certifié ANME : pompage, sites isolés et éclairage public, installations raccordées STEG et centrales photovoltaïques.",
        ar: "مركّب شمسي معتمد: الضخّ والمواقع المعزولة والإنارة العمومية والتركيبات المربوطة بالستاغ والمحطات الكهروضوئية.",
        en: "ANME-certified solar installer: pumping, off-grid and street lighting, STEG grid-connected systems and PV plants.",
      },
    },
    {
      site: "hikview",
      summary: {
        fr: "Intégrateur de solutions technologiques : sécurité électronique, réseaux, gestion et point de vente, audiovisuel, IoT et projets publics.",
        ar: "مُدمج للحلول التكنولوجية: الأمن الإلكتروني والشبكات والتسيير ونقاط البيع والسمعي البصري وإنترنت الأشياء والمشاريع العمومية.",
        en: "Technology solutions integrator: electronic security, networks, retail management, AV, IoT and public-sector projects.",
      },
    },
  ] satisfies { site: SiteKey; summary: Localized }[],
};

/** Default "Chez notre société sœur" suggestions (plan §4.3): [site, service] → [site, service][]. */
export const crossSell: { from: [SiteKey, string]; to: [SiteKey, string][] }[] = [
  { from: ["growing", "pompage-solaire"], to: [["hikview", "iot-telemetrie"], ["hikview", "videosurveillance"]] },
  { from: ["growing", "site-isole"], to: [["hikview", "smart-city"], ["hikview", "integration-b2g"]] },
  { from: ["growing", "centrale-photovoltaique"], to: [["hikview", "videosurveillance"], ["hikview", "fibre-optique-cablage"]] },
  { from: ["hikview", "securite-electronique"], to: [["growing", "installation-raccordee"], ["growing", "site-isole"]] },
  { from: ["hikview", "reseaux-infrastructures"], to: [["growing", "installation-raccordee"]] },
  { from: ["hikview", "integration-b2g"], to: [["growing", "site-isole"], ["growing", "centrale-photovoltaique"]] },
];
