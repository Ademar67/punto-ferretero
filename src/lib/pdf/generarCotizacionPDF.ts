import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

export async function generarCotizacionPDF(quote: any): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([400, 600])

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let y = 560

  // Título
  page.drawText("PUNTO FERRETERO", {
    x: 120,
    y,
    size: 16,
    font: bold,
  })

  y -= 30

  page.drawText(`Cotización: ${quote.id}`, { x: 20, y, size: 10, font })
  y -= 15

  page.drawText(`Cliente: ${quote.clienteNombre}`, { x: 20, y, size: 10, font })
  y -= 20

  // Productos
  quote.productos.forEach((p: any) => {
    page.drawText(`${p.nombre} x${p.cantidad}`, {
      x: 20,
      y,
      size: 9,
      font,
    })

    page.drawText(`$${(p.precio * p.cantidad).toFixed(2)}`, {
      x: 280,
      y,
      size: 9,
      font,
    })

    y -= 15
  })

  y -= 20

  page.drawText(`TOTAL: $${quote.total.toFixed(2)}`, {
    x: 20,
    y,
    size: 12,
    font: bold,
  })

  const pdfBytes = await pdfDoc.save()

  return new Blob([pdfBytes], { type: "application/pdf" })
}