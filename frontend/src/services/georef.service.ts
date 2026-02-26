export interface Provincia {
  id: string;
  nombre: string;
}

export interface Localidad {
  id: string;
  nombre: string;
}

export async function fetchProvincias(): Promise<Provincia[]> {
  const res = await fetch('https://apis.datos.gob.ar/georef/api/provincias');
  if (!res.ok) throw new Error('Error cargando provincias');
  const data = await res.json();
  return (data.provincias || []).sort((a: Provincia, b: Provincia) =>
    a.nombre.localeCompare(b.nombre)
  );
}

export async function fetchLocalidades(provincia: string): Promise<Localidad[]> {
  const res = await fetch(
    `https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(provincia)}&max=2000`
  );
  if (!res.ok) throw new Error('Error cargando localidades');
  const data = await res.json();
  return (data.localidades || []).sort((a: Localidad, b: Localidad) =>
    a.nombre.localeCompare(b.nombre)
  );
}
