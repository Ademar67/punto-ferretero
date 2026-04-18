# **App Name**: FerreSys TPV

## Core Features:

- Gestión de Productos: Permite crear, editar, eliminar y visualizar productos con detalles clave como nombre, código, categoría, precio y stock actual. Incluye búsqueda rápida y filtros por categoría.
- Punto de Venta Rápido (TPV): La interfaz principal para registrar ventas. Permite buscar y añadir productos al carrito, ajustar cantidades, aplicar descuentos, seleccionar método de pago y calcular cambio automáticamente.
- Gestión de Inventario Automática: Actualiza el stock de productos automáticamente al registrar ventas y ofrece funcionalidad para realizar entradas y salidas manuales, manteniendo el control del inventario.
- Generación y Gestión de Tickets: Genera tickets de venta en tiempo real, permite su descarga en formato PDF, ofrece la opción de reimprimir y un historial completo de todas las ventas con detalles filtrables.
- Autenticación Multi-usuario: Sistema de inicio de sesión seguro con Firebase Authentication, soportando múltiples usuarios (admin, cajero) y asegurando que cada negocio acceda solo a sus propios datos mediante `ownerId`.
- Dashboard Operativo: Proporciona una vista rápida de métricas clave del negocio, como resumen de ventas diarias/semanales/mensuales, número de tickets generados y productos con stock bajo, con accesos rápidos a módulos importantes.
- Generador de Descripción de Productos con IA: Una herramienta que ayuda a generar descripciones detalladas y atractivas para nuevos productos, basándose en el nombre y la categoría, utilizando inteligencia artificial.

## Style Guidelines:

- Esquema de color claro. Primario: Un azul corporativo y moderno (#3380CC) que transmite confianza y profesionalidad. Fondo: Un azul muy claro y sutil (#EEF4FA) para una base limpia y espaciosa. Acento: Un naranja brillante y enérgico (#FFB21A) para los elementos interactivos clave y las llamadas a la acción, que resalte contra el azul principal.
- Fuente principal para titulares y cuerpo de texto: 'Inter' (sans-serif) para una legibilidad óptima, una estética moderna y un aspecto neutro y objetivo, ideal para datos y formularios.
- Uso de iconos modernos, minimalistas y 'outline' que mantengan la claridad y la profesionalidad. Deben ser fácilmente reconocibles y estar alineados con las funcionalidades de una ferretería o punto de venta, como un carrito de compras, herramientas, productos o reportes.
- Un diseño espacioso y responsivo que priorice la experiencia en escritorio para el TPV. Uso estratégico de 'whitespace' para reducir la sobrecarga visual, jerarquía clara para la información, y botones grandes y de alto contraste para facilitar la interacción rápida y táctil en el mostrador.
- Animaciones sutiles y rápidas que proporcionen retroalimentación visual al usuario, como la confirmación de la adición de un producto al carrito, la finalización de una venta o la navegación entre secciones, sin distraer ni ralentizar el flujo de trabajo.