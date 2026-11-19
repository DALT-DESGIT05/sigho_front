import { PacienteSeguimientoTriaje } from '../../../interfaces/emergencia/triaje.interface';





export function formatear_nombre_paciente(
  paciente: PacienteSeguimientoTriaje | null | undefined,
): string {
  if (!paciente) return 'Paciente';

  const grado = (paciente.grado_codigo || paciente.grado)?.toUpperCase()?.trim() || null;
  const situacion = paciente.situacion?.toUpperCase()?.trim();
  const sufijo_retiro = grado && situacion === 'RETIRO' ? '(r)' : null;
  const partes_grado = [grado, sufijo_retiro].filter(Boolean).join(' ');

  let nombre: string;
  if (paciente.apellido_paterno || paciente.apellido_materno || paciente.nombres) {
    const apellidos = [paciente.apellido_paterno, paciente.apellido_materno]
      .map((valor) => valor?.toUpperCase()?.trim())
      .filter(Boolean)
      .join(' ');
    const nombres = (paciente.nombres || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
    nombre = [apellidos, nombres].filter(Boolean).join(' ');
  } else {
    nombre = paciente.nombre_completo?.trim() || 'Paciente';
  }

  return partes_grado ? `${partes_grado} ${nombre}` : nombre;
}
