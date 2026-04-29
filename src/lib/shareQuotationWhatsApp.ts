export async function shareQuotationWhatsApp({
  blob,
  folio,
  phone,
  total,
}: {
  blob: Blob
  folio: string
  phone?: string
  total: number
}) {
  // 1. Descargar PDF
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `Cotizacion-${folio}.pdf`
  a.click()

  setTimeout(() => URL.revokeObjectURL(url), 1000)

  // 2. Formatear teléfono (México)
  const digits = String(phone || "").replace(/\D/g, "")

  const finalPhone =
    digits.startsWith("52")
      ? digits
      : digits.length === 10
      ? `52${digits}`
      : digits

  // 3. Mensaje PRO
  const text = encodeURIComponent(
    `Hola 👋 te comparto la cotización *${folio}* de Punto Ferretero.\n\n` +
    `💰 Total: $${Number(total || 0).toFixed(2)} MXN\n\n` +
    `📄 Ya se descargó el PDF para adjuntarlo aquí.\n\n` +
    `Quedamos a tus órdenes 🔧`
  )

  // 4. Abrir WhatsApp
  const waUrl = finalPhone
    ? `https://wa.me/${finalPhone}?text=${text}`
    : `https://wa.me/?text=${text}`

  window.open(waUrl, "_blank")
}