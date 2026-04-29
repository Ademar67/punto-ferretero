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
    // Descargar PDF automáticamente
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Cotizacion-${folio}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  
    // Limpiar teléfono
    const digits = String(phone || "").replace(/\D/g, "")
    let finalPhone = ""
  
    if (digits.startsWith("52")) finalPhone = digits
    else if (digits.length === 10) finalPhone = `52${digits}`
  
    // Mensaje pro
    const text = encodeURIComponent(
      `Hola 👋 te envío tu cotización *${folio}* de Punto Ferretero.\n` +
        `💰 Total: $${total.toFixed(2)}\n\n` +
        `Tu PDF ya fue descargado listo para enviarse 📄`
    )
  
    const waUrl = finalPhone
      ? `https://wa.me/${finalPhone}?text=${text}`
      : `https://wa.me/?text=${text}`
  
    window.open(waUrl, "_blank")
  }