// Motor de fases: el «jefe de obra» de jp-producir. No sabe qué tipo de video se hace; lo lee del perfil.
// Todo es puro (sin disco): el CLI (nucleo/jp.mjs) lee los YAML y escribe el resultado.
//   resolverPerfil(nombre, leer)        lista final de fases tras la herencia (hereda / quitar / cambiar / agregar)
//   aplica(fase, video)                 ¿la fase corre en este video? (saltar_si / solo_si contra video.yaml)
//   esCompuerta(fase, modo)             ¿hay que parar y esperar al usuario? true = solo interactivo, "siempre" = ambos modos
//   estado(fases, video)                fase actual, completadas, saltadas y pendientes
//   completar / reabrir                 devuelven un video nuevo con el estado y el historial al día (no mutan)

export function resolverPerfil(nombre, leer, visitados = []) {
  if (visitados.includes(nombre)) throw new Error(`herencia circular de perfiles: ${[...visitados, nombre].join(" → ")}`);
  const p = leer(nombre);
  if (!p.hereda) return (p.fases || []).map((f) => ({ ...f }));
  let fases = resolverPerfil(p.hereda, leer, [...visitados, nombre]);
  const quitar = new Set(p.quitar || []);
  fases = fases.filter((f) => !quitar.has(f.id));
  for (const [id, cambios] of Object.entries(p.cambiar || {})) {
    const f = fases.find((x) => x.id === id);
    if (!f) throw new Error(`el perfil «${nombre}» cambia la fase «${id}», que no existe`);
    Object.assign(f, cambios);
  }
  for (const { despues, ...nueva } of p.agregar || []) {
    const i = despues ? fases.findIndex((x) => x.id === despues) : fases.length - 1;
    if (i < 0) throw new Error(`el perfil «${nombre}» agrega «${nueva.id}» después de «${despues}», que no existe`);
    fases.splice(i + 1, 0, nueva);
  }
  return fases;
}

const leerRuta = (obj, ruta) => ruta.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
const coincide = (valor, esperado) => (Array.isArray(esperado) ? esperado.includes(valor) : valor === esperado);

export function aplica(fase, video) {
  for (const [campo, esperado] of Object.entries(fase.saltar_si || {})) if (coincide(leerRuta(video, campo), esperado)) return false;
  for (const [campo, esperado] of Object.entries(fase.solo_si || {})) if (!coincide(leerRuta(video, campo), esperado)) return false;
  return true;
}

export function esCompuerta(fase, modo = "interactivo") {
  if (fase.compuerta === "siempre") return true;
  return fase.compuerta === true && modo !== "automatico";
}

export function estado(fases, video) {
  const hechas = new Set(video.estado?.completadas || []);
  let actual = null;
  const lista = fases.map((f) => {
    let e;
    if (hechas.has(f.id)) e = "completada";
    else if (!aplica(f, video)) e = "saltada";
    else if (!actual) { actual = f.id; e = "actual"; }
    else e = "pendiente";
    return { ...f, estado: e, para: esCompuerta(f, video.modo) };
  });
  return { actual, fases: lista, terminado: actual === null };
}

const conHistorial = (video, completadas, fase, entrada) => ({
  ...video,
  estado: { ...(video.estado || {}), completadas, fase, historial: [...(video.estado?.historial || []), entrada] },
});

export function completar(fases, video, id, { fecha, nota } = {}) {
  const { actual } = estado(fases, video);
  if (id !== actual) throw new Error(`no se puede completar «${id}»: la fase actual es «${actual}»`);
  const completadas = [...(video.estado?.completadas || []), id];
  const siguiente = estado(fases, { ...video, estado: { ...video.estado, completadas } }).actual;
  return conHistorial(video, completadas, siguiente, { fecha, fase: id, accion: "completada", ...(nota ? { nota } : {}) });
}

export function reabrir(fases, video, id, { fecha, nota } = {}) {
  const i = fases.findIndex((f) => f.id === id);
  if (i < 0) throw new Error(`la fase «${id}» no existe en este perfil`);
  const despues = new Set(fases.slice(i).map((f) => f.id));
  const completadas = (video.estado?.completadas || []).filter((x) => !despues.has(x));
  return conHistorial(video, completadas, id, { fecha, fase: id, accion: "reabierta", ...(nota ? { nota } : {}) });
}
