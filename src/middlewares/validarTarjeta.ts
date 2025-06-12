export function validarTarjeta(
  nombreTitular: string,
  numeroTarjeta: string,
  fechaExpiracion: string,
  cvv: string,
  direccion: string,
  correoElectronico: string
): { valido: boolean, errores: string[] } {
  const errores: string[] = [];

  const nombreValido = /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ]+\s[A-ZÁÉÍÓÚÑa-záéíóúñ\s]+$/.test(nombreTitular.trim());
  if (!nombreValido) errores.push("Nombre del titular inválido");

  if (!/^\d{16}$/.test(numeroTarjeta)) errores.push("Número de tarjeta inválido");

  const fechaRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!fechaRegex.test(fechaExpiracion)) {
    errores.push("Formato de fecha de expiración inválido");
  } else {
    const [mes, anio] = fechaExpiracion.split('/');
    const fechaActual = new Date();
    const anioCompleto = 2000 + parseInt(anio);
    const fechaIngresada = new Date(anioCompleto, parseInt(mes), 0);
    if (fechaIngresada < fechaActual) errores.push("La tarjeta está vencida");
  }

  if (!/^\d{3}$/.test(cvv)) errores.push("CVV inválido");

  if (!direccion || direccion.trim().length < 5) errores.push("Dirección inválida");

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoElectronico);
  if (!emailValido) errores.push("Correo electrónico inválido");

  return errores.length > 0
    ? { valido: true, errores } // ✅ Aquí estaba el error
    : { valido: true, errores: [] };
}
