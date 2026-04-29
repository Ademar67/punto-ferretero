import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

export async function generarCotizacionPDF(data: any): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const black = rgb(0, 0, 0)
  const teal = rgb(0, 0.55, 0.5)
  const gray = rgb(0.45, 0.45, 0.45)
  const lightGray = rgb(0.95, 0.95, 0.95)
  const white = rgb(1, 1, 1)
  const red = rgb(0.9, 0, 0)
  const border = rgb(0.88, 0.88, 0.88)

  const money = (n: number) => `$${Number(n || 0).toFixed(2)}`

  const formatDate = (value: any) => {
    if (!value) return "—"

    const date =
      value?.seconds ? new Date(value.seconds * 1000) :
      value?.toDate ? value.toDate() :
      value instanceof Date ? value :
      new Date(value)

    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Marco
  page.drawRectangle({
    x: 35,
    y: 45,
    width: 525,
    height: 750,
    borderColor: black,
    borderWidth: 1.5,
  })

  // Logo real o fallback
  try {
    const logoBytes = await fetch("/logo.png").then((res) => res.arrayBuffer())
    const logoImage = await pdfDoc.embedPng(logoBytes)

    page.drawImage(logoImage, {
      x: 65,
      y: 725,
      width: 60,
      height: 60,
    })
  } catch {
    page.drawRectangle({
      x: 65,
      y: 730,
      width: 55,
      height: 55,
      color: black,
    })

    page.drawText("PF", {
      x: 80,
      y: 748,
      size: 18,
      font: bold,
      color: rgb(1, 0.8, 0),
    })
  }

  // Header
  page.drawText("PUNTO", {
    x: 135,
    y: 760,
    size: 24,
    font: bold,
    color: black,
  })

  page.drawText("FERRETERO", {
    x: 235,
    y: 760,
    size: 24,
    font: bold,
    color: teal,
  })

  page.drawText("COTIZACIONES Y PRESUPUESTOS", {
    x: 137,
    y: 742,
    size: 8,
    font: bold,
    color: black,
  })

  page.drawText("PROFESIONALES", {
    x: 137,
    y: 728,
    size: 8,
    font: bold,
    color: gray,
  })

  page.drawText("NÚMERO DE FOLIO", {
    x: 425,
    y: 760,
    size: 8,
    font: bold,
    color: gray,
  })

  page.drawText("COT-", {
    x: 442,
    y: 735,
    size: 20,
    font: bold,
    color: teal,
  })

  page.drawText(String(data.id || "").replace("COT-", ""), {
    x: 425,
    y: 705,
    size: 22,
    font: bold,
    color: teal,
  })

  page.drawLine({
    start: { x: 65, y: 690 },
    end: { x: 530, y: 690 },
    thickness: 2,
    color: black,
  })

  // Cliente
  page.drawRectangle({
    x: 65,
    y: 590,
    width: 210,
    height: 70,
    color: lightGray,
  })

  page.drawText("DATOS DEL CLIENTE", {
    x: 85,
    y: 635,
    size: 7,
    font: bold,
    color: gray,
  })

  page.drawText(String(data.clienteNombre || "MOSTRADOR").toUpperCase(), {
    x: 85,
    y: 610,
    size: 15,
    font: bold,
    color: black,
  })

  if (data.clienteTelefono) {
    page.drawText(String(data.clienteTelefono), {
      x: 85,
      y: 595,
      size: 8,
      font,
      color: gray,
    })
  }

  // Fechas
  page.drawText("FECHA EMISIÓN:", {
    x: 330,
    y: 640,
    size: 9,
    font: bold,
    color: gray,
  })

  page.drawText(formatDate(data.createdAt), {
    x: 430,
    y: 640,
    size: 9,
    font: bold,
    color: black,
  })

  page.drawText("VÁLIDO HASTA:", {
    x: 340,
    y: 620,
    size: 9,
    font: bold,
    color: gray,
  })

  page.drawText(formatDate(data.validoHasta), {
    x: 430,
    y: 620,
    size: 9,
    font: bold,
    color: red,
  })

  page.drawText("ATENDIDO POR:", {
    x: 335,
    y: 600,
    size: 9,
    font: bold,
    color: gray,
  })

  page.drawText("PUNTO FERRETERO", {
    x: 430,
    y: 600,
    size: 9,
    font: bold,
    color: black,
  })

  // Tabla header
  let y = 545

  page.drawRectangle({
    x: 65,
    y,
    width: 465,
    height: 32,
    color: black,
  })

  page.drawText("DESCRIPCIÓN DEL PRODUCTO", {
    x: 78,
    y: y + 12,
    size: 8,
    font: bold,
    color: white,
  })

  page.drawText("CANT.", {
    x: 325,
    y: y + 12,
    size: 8,
    font: bold,
    color: white,
  })

  page.drawText("UNITARIO", {
    x: 385,
    y: y + 12,
    size: 8,
    font: bold,
    color: white,
  })

  page.drawText("SUBTOTAL", {
    x: 462,
    y: y + 12,
    size: 8,
    font: bold,
    color: white,
  })

  y -= 34

  const productos = Array.isArray(data.productos) ? data.productos : []

  productos.forEach((p: any) => {
    const cantidad = Number(p.cantidad || 0)
    const precio = Number(p.precio || 0)
    const subtotalProducto = cantidad * precio

    page.drawRectangle({
      x: 65,
      y: y - 20,
      width: 465,
      height: 42,
      color: white,
      borderColor: border,
      borderWidth: 1,
    })

    page.drawText(String(p.nombre || "PRODUCTO").toUpperCase().slice(0, 32), {
      x: 80,
      y,
      size: 10,
      font: bold,
      color: black,
    })

    page.drawText(`REF: ${p.codigo || ""}`.slice(0, 25), {
      x: 80,
      y: y - 13,
      size: 6,
      font,
      color: gray,
    })

    page.drawText(String(cantidad), {
      x: 335,
      y,
      size: 10,
      font: bold,
      color: black,
    })

    page.drawText(money(precio), {
      x: 385,
      y,
      size: 9,
      font,
      color: black,
    })

    page.drawText(money(subtotalProducto), {
      x: 465,
      y,
      size: 10,
      font: bold,
      color: black,
    })

    y -= 44
  })

  const total = Number(data.total || 0)
  const subtotal = total / 1.16
  const iva = total - subtotal

  // Términos
  y = Math.min(y - 35, 330)

  page.drawText("TÉRMINOS Y CONDICIONES:", {
    x: 65,
    y,
    size: 8,
    font: bold,
    color: gray,
  })

  page.drawText("Los precios mostrados incluyen IVA del 16%. Esta cotización tiene", {
    x: 65,
    y: y - 22,
    size: 7,
    font,
    color: gray,
  })

  page.drawText("una validez de 7 días naturales a partir de su emisión. La", {
    x: 65,
    y: y - 34,
    size: 7,
    font,
    color: gray,
  })

  page.drawText("disponibilidad de stock puede variar al momento de concretar la compra.", {
    x: 65,
    y: y - 46,
    size: 7,
    font,
    color: gray,
  })

  // Totales
  page.drawText("SUBTOTAL", {
    x: 370,
    y,
    size: 9,
    font: bold,
    color: gray,
  })

  page.drawText(money(subtotal), {
    x: 465,
    y,
    size: 9,
    font,
    color: black,
  })

  page.drawText("IVA (16%)", {
    x: 370,
    y: y - 24,
    size: 9,
    font: bold,
    color: gray,
  })

  page.drawText(money(iva), {
    x: 465,
    y: y - 24,
    size: 9,
    font,
    color: black,
  })

  page.drawRectangle({
    x: 360,
    y: y - 90,
    width: 170,
    height: 58,
    color: teal,
  })

  page.drawText("TOTAL", {
    x: 380,
    y: y - 58,
    size: 9,
    font: bold,
    color: white,
  })

  page.drawText("NETO", {
    x: 380,
    y: y - 70,
    size: 9,
    font: bold,
    color: white,
  })

  page.drawText(money(total), {
    x: 435,
    y: y - 68,
    size: 20,
    font: bold,
    color: white,
  })

  // Footer
  page.drawText("Gracias por su preferencia", {
    x: 230,
    y: 80,
    size: 8,
    font: italic,
    color: gray,
  })

  page.drawText("Punto Ferretero Software V1.0", {
    x: 225,
    y: 65,
    size: 7,
    font,
    color: gray,
  })

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: "application/pdf" })
}