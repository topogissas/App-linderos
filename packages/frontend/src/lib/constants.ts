/** Catálogo de departamentos y municipios de Colombia */
export const DEPARTAMENTOS_MUNICIPIOS: Record<string, string[]> = {
  "Amazonas": ["Leticia", "Puerto Nariño"],
  "Antioquia": ["Medellín", "Bello", "Envigado", "Itagüí", "Rionegro", "Apartadó", "Turbo", "Caucasia"],
  "Arauca": ["Arauca", "Saravena", "Tame"],
  "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Sabanalarga"],
  "Bolívar": ["Cartagena", "Magangué", "Turbaco", "El Carmen de Bolívar"],
  "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa"],
  "Caldas": ["Manizales", "La Dorada", "Villamaría", "Chinchiná"],
  "Caquetá": ["Florencia", "San Vicente del Caguán"],
  "Casanare": ["Yopal", "Aguazul", "Villanueva", "Tauramena"],
  "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada"],
  "Cesar": ["Valledupar", "Aguachica", "Codazzi"],
  "Chocó": ["Quibdó", "Istmina", "Tadó"],
  "Córdoba": [
    "Montería", "Cereté", "Lorica", "Sahagún", "Tierralta", "Montelíbano",
    "Planeta Rica", "San Pelayo", "San Carlos", "Ciénaga de Oro", "Pueblo Nuevo",
    "San Andrés de Sotavento", "Chinú", "Purísima", "Momil",
    "San Bernardo del Viento", "Moñitos", "Los Córdobas", "Puerto Escondido",
    "Canalete", "Valencia", "Ayapel", "Buenavista", "La Apartada",
    "Puerto Libertador", "San Antero", "San José de Uré", "Cotorra", "Tuchin"
  ],
  "Cundinamarca": ["Bogotá D.C.", "Soacha", "Zipaquirá", "Facatativá", "Chía", "Fusagasugá", "Girardot", "Madrid"],
  "Guainía": ["Inírida"],
  "Guaviare": ["San José del Guaviare"],
  "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia"],
  "Magdalena": ["Santa Marta", "Ciénaga", "Fundación", "El Banco"],
  "Meta": ["Villavicencio", "Acacías", "Granada"],
  "Nariño": ["Pasto", "Tumaco", "Ipiales"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona", "Los Patios"],
  "Putumayo": ["Mocoa", "Puerto Asís"],
  "Quindío": ["Armenia", "Calarcá", "La Tebaida"],
  "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
  "San Andrés y Providencia": ["San Andrés", "Providencia"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja"],
  "Sucre": ["Sincelejo", "Corozal", "San Marcos"],
  "Tolima": ["Ibagué", "Espinal", "Melgar", "Honda"],
  "Valle del Cauca": ["Cali", "Buenaventura", "Palmira", "Tuluá", "Buga", "Cartago", "Yumbo", "Jamundí"],
  "Vaupés": ["Mitú"],
  "Vichada": ["Puerto Carreño"],
};

/** Lista de departamentos ordenados */
export const DEPARTAMENTOS = Object.keys(DEPARTAMENTOS_MUNICIPIOS).sort();

/** Catálogo de sistemas CRS por país */
export const CRS_CATALOG: Record<string, { label: string; epsg: number }[]> = {
  "Colombia": [
    { label: "MAGNA-SIRGAS / Colombia Bogotá zone", epsg: 3116 },
    { label: "MAGNA-SIRGAS / Colombia Este Central zone", epsg: 3117 },
    { label: "MAGNA-SIRGAS / Colombia Este zone", epsg: 3118 },
    { label: "MAGNA-SIRGAS / Colombia Oeste zone", epsg: 3114 },
    { label: "MAGNA-SIRGAS / Colombia Far West zone", epsg: 3115 },
    { label: "MAGNA-SIRGAS / Origen Nacional (EPSG:9377)", epsg: 9377 },
    { label: "WGS 84 (Geográficas)", epsg: 4326 },
  ],
  "Perú": [
    { label: "WGS 84 / UTM zone 17S", epsg: 32717 },
    { label: "WGS 84 / UTM zone 18S", epsg: 32718 },
    { label: "WGS 84 / UTM zone 19S", epsg: 32719 },
    { label: "WGS 84 (Geográficas)", epsg: 4326 },
  ],
  "México": [
    { label: "WGS 84 / UTM zone 11N", epsg: 32611 },
    { label: "WGS 84 / UTM zone 12N", epsg: 32612 },
    { label: "WGS 84 / UTM zone 13N", epsg: 32613 },
    { label: "WGS 84 / UTM zone 14N", epsg: 32614 },
    { label: "WGS 84 / UTM zone 15N", epsg: 32615 },
    { label: "WGS 84 / UTM zone 16N", epsg: 32616 },
    { label: "WGS 84 (Geográficas)", epsg: 4326 },
  ],
  "Chile": [
    { label: "WGS 84 / UTM zone 18S", epsg: 32718 },
    { label: "WGS 84 / UTM zone 19S", epsg: 32719 },
    { label: "WGS 84 (Geográficas)", epsg: 4326 },
  ],
};

/** Países disponibles */
export const PAISES_CRS = Object.keys(CRS_CATALOG);

/** Opciones de profesión */
export const PROFESIONES = [
  "Topógrafo",
  "Ingeniero Catastral y Geodesta",
  "Ingeniero Civil",
  "Ingeniero Geólogo",
  "Arquitecto",
  "Ingeniero Agrónomo",
  "Ingeniero Ambiental",
];

/** Tipos de línea para linderos */
export const TIPOS_LINEA = ["Recta", "Curva", "Quebrada", "Irregular", "Mixta"];

/** Direcciones cardinales */
export const RUMBOS_CARDINALES = ["NORTE", "ESTE", "SUR", "OESTE"] as const;
