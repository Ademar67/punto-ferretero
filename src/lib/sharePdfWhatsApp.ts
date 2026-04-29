export async function shareQuotationWhatsApp(params: {
  blob: Blob
  folio: string
  phone?: string
  total: number
}) {
  const { blob, folio, phone, total } = params

  const file = new File([blob], `Cotizacion_${folio}.pdf`, {
    type: "application/pdf",
  })

  const cleanPhone = String(phone || "").replace(/\D/g, "")
  const whatsappPhone =
    cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone

  const message = encodeURIComponent(
    `Hola, te comparto la cotización *${folio}* de Punto Ferretero.\n\nTotal: $${Number(
      total || 0
    ).toFixed(2)} MXN.\n\nQuedo atento para cualquier duda.`
  )

  // 📱 CELULAR → comparte directo con PDF
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: `Cotización ${folio}`,
      text: `Cotización ${folio} - Punto Ferretero`,
      files: [file],
    })
    return
  }

  // 💻 PC → descarga + abre WhatsApp
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `Cotizacion_${folio}.pdf`
  a.click()
  URL.revokeObjectURL(url)

  const waUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${message}`
    : `https://wa.me/?text=${message}`

  window.open(waUrl, "_blank")
}