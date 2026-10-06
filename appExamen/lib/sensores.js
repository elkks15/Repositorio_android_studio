import { useEffect, useRef, useState } from 'react';

export function useSensor(Sensor, onData) {
  const [disponible, setDisponible] = useState(null);
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
      setDisponible(Boolean(suscripcion));
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
    Sensor.setUpdateInterval(80);
    return Sensor.addListener(onData);
  } catch {
    return null;
  }
}

export function gradosDesde(x, y) {
  const angulo = (Math.atan2(y, x) * 180) / Math.PI;
  return (angulo + 360) % 360;
}

export function diferenciaAngulo(actual, objetivo) {
  return ((objetivo - actual + 540) % 360) - 180;
}
