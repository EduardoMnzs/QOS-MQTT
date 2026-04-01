export function getRelatorio() {
  return fetch("/api/relatorio").then((r) => r.json());
}

export function getLeituras({ sensor = "", limit = 40 } = {}) {
  const params = new URLSearchParams({ limit });
  if (sensor) params.set("sensor", sensor);
  return fetch(`/api/leituras?${params}`).then((r) => r.json());
}

export function getPublicacoes({ sensor = "", limit = 40 } = {}) {
  const params = new URLSearchParams({ limit });
  if (sensor) params.set("sensor", sensor);
  return fetch(`/api/publicacoes?${params}`).then((r) => r.json());
}

export function dispararIncendio() {
  return fetch("/api/sensores/incendio/disparar", { method: "POST" }).then(
    (r) => r.ok ? r.json() : r.json().then((e) => Promise.reject(new Error(e.erro)))
  );
}