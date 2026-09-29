import { useEffect, useRef, useState } from 'react';

export function useSensor(Sensor, onData) {
  const [disponible, setDisponible] = useState(true);
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    let cancelado = false;
    let sub;

    escuchar(Sensor, (dato) => onDataRef.current(dato)).then((suscripcion) => {
      if (cancelado) {
        suscripcion?.remove();
        return;
      }
      sub = suscripcion;
      if (!suscripcion) setDisponible(false);
    });

    return () => {
      cancelado = true;
      sub?.remove();
    };
  }, [Sensor]);

  return disponible;
}

export async function escuchar(Sensor, onData) {
  try {
    const disponible = await Sensor.isAvailableAsync();
    if (!disponible) return null;
    try {
      await Sensor.requestPermissionsAsync();
    } catch {
      // En web el permiso a veces no existe.
    }
    Sensor.setUpdateInterval(90);
    return Sensor.addListener(onData);
  } catch {
    return null;
  }
}

export function limitar(valor, min, max) {
  return Math.max(min, Math.min(max, valor));
}
