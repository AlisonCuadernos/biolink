let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

document.addEventListener('DOMContentLoaded', async () => {
  productos = await cargarProductos();
  mostrarProductos(productos);
  actualizarCarrito();
});

async function cargarProductos() {
  try {
    const respuesta = await fetch("./data/productos.json");
    const data = await respuesta.json();
    return data; // 👈 devolvemos los productos
  } catch (error) {
    console.error("Error cargando productos:", error);
    return []; // devolvemos array vacío si falla
  }
}

function mostrarProductos(listaProductos) {
  const catalogo = document.getElementById('catalogo');
  catalogo.innerHTML = '';

  listaProductos.forEach(producto => {
    const div = document.createElement('div');
    div.className = 'producto';
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" onclick="mostrarDetalle('${producto.id}')">
      <h2>${producto.nombre}</h2>
      <p>Precio: $${producto.precio}</p>
      <p>3 cuotas de $${(producto.precio/3).toFixed(2)}</p>
      <button onclick="mostrarDetalle('${producto.id}')">Ver más</button>
    `;

    // Si no hay stock, deshabilitar el botón
    if (producto.stock <= 0) {
      div.querySelector("button").disabled = true;
      div.querySelector("button").textContent = "Sin stock";
    }

    catalogo.appendChild(div);
  });
}

// Cambia la función agregarAlCarrito para aceptar cantidadManual
function agregarAlCarrito(id, cantidadManual, variacionSeleccion = null) {
  let producto = productos.find(p => p.id === id);
  let nombre = producto.nombre;
  let precio = producto.precio;
  let stock = producto.stock;
  let idCarrito = id;

  // Si hay variación, ajusta los datos
  if (
    variacionSeleccion &&
    producto.variaciones &&
    producto.variaciones.length > 0
  ) {
    const variacion = producto.variaciones.find(v =>
      v.variacion1 === variacionSeleccion.variacion1 &&
      (variacionSeleccion.variacion2 ? v.variacion2 === variacionSeleccion.variacion2 : true)
    );
    if (variacion) {
      nombre += ` (${variacion.variacion1}${variacion.variacion2 ? ' - ' + variacion.variacion2 : ''})`;
      stock = variacion.Stock || variacion.stock;
      idCarrito = `${id}-${variacion.variacion1}${variacion.variacion2 ? '-' + variacion.variacion2 : ''}`;
      if (variacion.precio) precio = variacion.precio;
    }
  }

  let cantidad = cantidadManual !== undefined
    ? cantidadManual
    : parseInt(document.getElementById('cantidad-' + id).value);

  if (!producto || cantidad <= 0 || isNaN(cantidad)) {
    alert("Cantidad inválida o producto no encontrado");
    return;
  }

  // Busca por idCarrito (id+variacion)
  const productoExistente = carrito.find(item => item.id === idCarrito);

  if (productoExistente) {
    if (productoExistente.cantidad + cantidad > stock) {
      alert('No hay suficiente stock disponible');
      return;
    }
    productoExistente.cantidad += cantidad;
    productoExistente.precio = precio;
    productoExistente.subtotal = productoExistente.cantidad * precio;
  } else {
    if (cantidad > stock) {
      alert('No hay suficiente stock disponible');
      return;
    }
    carrito.push({
      id: idCarrito,
      nombre: nombre,
      precio: precio,
      cantidad: cantidad,
      subtotal: precio * cantidad
    });
  }

  guardarCarrito();
  actualizarCarrito();
  mostrarAlerta();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById('lista-carrito');
  lista.innerHTML = '';

carrito.forEach(item => {
  const producto = productos.find(p => p.id === item.id);
  const maxStock = producto ? producto.stock : item.cantidad;

  const li = document.createElement('li');
  li.innerHTML = `
    ${item.nombre} - $${item.precio} x 
    <button onclick="cambiarCantidad('${item.id}', -1)">-</button>
    <span id="cantidad-${item.id}">${item.cantidad}</span>
    <button onclick="cambiarCantidad('${item.id}', 1)">+</button>
    = $${item.subtotal}
    <button onclick="eliminarDelCarrito('${item.id}')">Eliminar</button>
  `;
  lista.appendChild(li);
  });


  const total = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  document.getElementById('total').textContent = `Total: $${total}`;
  document.getElementById('contador-carrito').textContent = carrito.length;
}

document.getElementById('form-datos').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const datos = {};
  formData.forEach((valor, clave) => datos[clave] = valor);

  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  let mensaje = `¡Hola! Quiero realizar un pedido:\n\n`;
  carrito.forEach(item => {
    mensaje += `- ${item.nombre} x${item.cantidad} ($${item.subtotal})\n`;
  });

  const total = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  mensaje += `\nTotal: $${total}\n\n`;

  mensaje += `Datos del cliente:\n`;
  mensaje += `Nombre: ${datos.nombre}\n`;
  mensaje += `DNI: ${datos.dni}\n`;
  mensaje += `Email: ${datos.email}\n`;
  mensaje += `Celular: ${datos.celular}\n`;
  mensaje += `Método de envío: ${datos.envio}\n`;
  mensaje += `Recibe: ${datos.recibe}\n`;
  mensaje += `Método de pago: ${datos.pago}\n`;
  mensaje += `¿Autoriza publicación?: ${datos.publicidad}\n`;
  mensaje += `¿Factura C?: ${datos.factura}\n`;

  // 📲 Abrir WhatsApp
  const telefonoVendedor = '5491126116298';
  const urlWhatsapp = `https://wa.me/${telefonoVendedor}?text=${encodeURIComponent(mensaje)}`;
  window.open(urlWhatsapp, '_blank');

  // 🔄 Resetear carrito y productos
  localStorage.removeItem('carrito');  // limpiar localStorage
  carrito = [];                        // limpiar array en memoria
  actualizarCarrito();                 // refrescar vista

  // 🔄 Recargar productos si corresponde
  if (typeof cargarProductos === 'function') productos = await cargarProductos();
  if (typeof mostrarProductos === 'function') mostrarProductos(productos);

  // ✅ Mostrar mensaje de agradecimiento
  const contenedor = document.getElementById('form-datos').parentElement;
  let mensajeConfirmacion = document.getElementById("mensaje-confirmacion");

  if (!mensajeConfirmacion) {
    mensajeConfirmacion = document.createElement('p');
    mensajeConfirmacion.id = "mensaje-confirmacion";
    mensajeConfirmacion.style.fontWeight = 'bold';
    mensajeConfirmacion.style.color = '#e8499a';
    contenedor.appendChild(mensajeConfirmacion);
  }

  mensajeConfirmacion.textContent = '¡Gracias por tu pedido! Muy pronto nos pondremos en contacto.';

  // 🕒 Ocultarlo después de 10 segundos
  setTimeout(() => {
    mensajeConfirmacion.textContent = '';
  }, 10000);

  // Resetear el formulario de cliente
  this.reset();
});

function cambiarCantidad(id, cambio) {
  // Soporta ids con variacion: "P002-rosa" o "P002-Albedo-Mixto"
  let baseId = id;
  let variacion1 = null;
  let variacion2 = null;

  // Extrae variaciones del id del carrito
  const partes = id.split('-');
  baseId = partes[0];
  if (partes.length === 3) {
    variacion1 = partes[1];
    variacion2 = partes[2];
  } else if (partes.length === 2) {
    variacion1 = partes[1];
  }

  const producto = productos.find(p => p.id === baseId);
  const item = carrito.find(p => p.id === id);

  if (!producto || !item) return;

  let stock = producto.stock;
  let precio = producto.precio;
  if (producto.variaciones && producto.variaciones.length > 0 && variacion1) {
    const variacion = producto.variaciones.find(v =>
      v.variacion1 === variacion1 && (variacion2 ? v.variacion2 === variacion2 : true)
    );
    if (variacion) {
      stock = variacion.Stock || variacion.stock || producto.stock;
      if (variacion.precio) precio = variacion.precio;
    }
  }

  const nuevaCantidad = item.cantidad + cambio;

  if (nuevaCantidad < 1) return;
  if (nuevaCantidad > stock) {
    alert('No hay suficiente stock disponible');
    return;
  }

  item.cantidad = nuevaCantidad;
  item.precio = precio; // Asegura que el precio sea el correcto para la variante
  item.subtotal = precio * nuevaCantidad;

  guardarCarrito();
  actualizarCarrito();
}


function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function mostrarAlerta() {
  const alerta = document.getElementById('alerta');
  alerta.style.display = 'block';
  setTimeout(() => {
    alerta.style.display = 'none';
  }, 1500);
}

function abrirModal() {
  document.getElementById('modal-carrito').style.display = 'block';
}

function cerrarModal() {
  document.getElementById('modal-carrito').style.display = 'none';
}

function filtrarProductos() {
  const texto = document.getElementById('buscador').value.toLowerCase();
  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(texto));
  mostrarProductos(productosFiltrados);
}

function ordenarProductos() {
  const filtro = document.getElementById('filtro').value;
  let productosOrdenados = [...productos];

  if (filtro === 'precio-asc') {
    productosOrdenados.sort((a, b) => a.precio - b.precio);
  } else if (filtro === 'precio-desc') {
    productosOrdenados.sort((a, b) => b.precio - a.precio);
  } else if (filtro === 'nombre') {
    productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  mostrarProductos(productosOrdenados);
}

let imagenesCarrusel = [];
let indiceImagenCarrusel = 0;

function mostrarDetalle(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const contenedor = document.getElementById('detalle-producto');

  // Filtrar variaciones válidas (que tengan variacion1)
  let variacionesValidas = [];
  if (producto.variaciones && producto.variaciones.length > 0) {
    variacionesValidas = producto.variaciones.filter(v => v.variacion1);
  }

  // Obtener listas únicas para cada variación
  const opciones1 = [...new Set(variacionesValidas.map(v => v.variacion1).filter(Boolean))];
  const opciones2 = [...new Set(variacionesValidas.map(v => v.variacion2).filter(Boolean))];

  // Selección inicial
  let seleccion1 = opciones1[0] || null;
  let seleccion2 = opciones2[0] || null;

  // Buscar la variación inicial
  let variacionInicial = variacionesValidas.find(v =>
    v.variacion1 === seleccion1 && (opciones2.length === 0 || v.variacion2 === seleccion2)
  ) || variacionesValidas[0];

  // Obtener todas las imágenes para el carrusel
  imagenesCarrusel = [];
  if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
    imagenesCarrusel = [...producto.imagenes];
  }
  if (producto.imagen && (!imagenesCarrusel.length || imagenesCarrusel[0] !== producto.imagen)) {
    imagenesCarrusel.unshift(producto.imagen);
  }
  indiceImagenCarrusel = 0;

  // Flechas solo si hay más de una imagen
  const flechaIzq = imagenesCarrusel.length > 1
    ? `<button class="carrusel-flecha" onclick="cambiarImagenCarrusel(-1)">&lt;</button>`
    : '';
  const flechaDer = imagenesCarrusel.length > 1
    ? `<button class="carrusel-flecha" onclick="cambiarImagenCarrusel(1)">&gt;</button>`
    : '';

  // --- AGREGA ESTAS VARIABLES ANTES DEL innerHTML ---
  let precioMostrar = variacionInicial?.precio || producto.precio;
  let stockMostrar = variacionInicial?.Stock || variacionInicial?.stock || producto.stock;

  let selector1 = '';
  let selector2 = '';
  if (opciones1.length > 0) {
    selector1 = `
      <label for="variacion1-${producto.id}">Variante 1:</label>
      <select id="variacion1-${producto.id}" onchange="actualizarStockVariacion('${producto.id}')">
        ${opciones1.map(v => `<option value="${v}">${v}</option>`).join('')}
      </select>
    `;
  }
  if (opciones2.length > 0) {
    selector2 = `
      <label for="variacion2-${producto.id}">Variante 2:</label>
      <select id="variacion2-${producto.id}" onchange="actualizarStockVariacion('${producto.id}')">
        ${opciones2.map(v => `<option value="${v}">${v}</option>`).join('')}
      </select>
    `;
  }
  // --- FIN VARIABLES ---

  contenedor.innerHTML = `
    <h2>${producto.nombre}</h2>
    <div class="detalle-flex">
      <div class="carrusel-imagen">
        ${flechaIzq}
        <img id="img-detalle-carrusel" src="${imagenesCarrusel[0]}" alt="${producto.nombre}">
        ${flechaDer}
      </div>
      <div class="detalle-controles">
        <p id="precio-detalle-${producto.id}">Precio: $${precioMostrar}</p>
        ${selector1}
        ${selector2}
        <p id="stock-detalle-${producto.id}">Stock: ${stockMostrar}</p>
        <input type="number" id="detalle-cantidad-${producto.id}" value="1" min="1" max="${stockMostrar}">
        <button onclick="agregarDesdeDetalle('${producto.id}')">Agregar al carrito</button>
      </div>
    </div>
    <p>${(producto.descripcion || '').replace(/\n/g, '<br>')}</p>
  `;

  document.getElementById('modal-detalle').style.display = 'block';

  producto._variacionesValidas = variacionesValidas;
  actualizarStockVariacion(producto.id);
}

// Agrega esta función para cambiar la imagen del carrusel
function cambiarImagenCarrusel(direccion) {
  if (!imagenesCarrusel.length) return;
  indiceImagenCarrusel += direccion;
  if (indiceImagenCarrusel < 0) indiceImagenCarrusel = imagenesCarrusel.length - 1;
  if (indiceImagenCarrusel >= imagenesCarrusel.length) indiceImagenCarrusel = 0;
  document.getElementById('img-detalle-carrusel').src = imagenesCarrusel[indiceImagenCarrusel];
}

async function obtenerProductos() {
  const res = await fetch('./data/productos.json');
  productos = await res.json();
}

// Ocultar el formulario y mostrar un mensaje de confirmación
document.getElementById('form-datos').reset();
document.getElementById('form-datos').style.display = true;

const contenedor = document.getElementById('form-datos').parentElement;
/*const mensajeConfirmacion = document.createElement('p');
mensajeConfirmacion.textContent = '¡Gracias por tu pedido! Muy pronto nos pondremos en contacto.';
mensajeConfirmacion.style.fontWeight = 'bold';
mensajeConfirmacion.style.color = '#e8499a';
contenedor.appendChild(mensajeConfirmacion);*/

// AGREGA ESTA FUNCIÓN PARA CERRAR EL MODAL DETALLE
function cerrarDetalle() {
  document.getElementById('modal-detalle').style.display = 'none';
}

// AGREGA ESTA FUNCIÓN PARA AGREGAR DESDE EL DETALLE
function agregarDesdeDetalle(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  let cantidad = 1;
  let stock = producto.stock;
  let variacion1 = null;
  let variacion2 = null;

  // Si hay variaciones, toma las seleccionadas
  if (producto.variaciones && producto.variaciones.length > 0) {
    const select1 = document.getElementById(`variacion1-${producto.id}`);
    const select2 = document.getElementById(`variacion2-${producto.id}`);
    variacion1 = select1 ? select1.value : null;
    variacion2 = select2 ? select2.value : null;

    // Busca la variación exacta
    const variacion = producto.variaciones.find(v =>
      v.variacion1 === variacion1 && (select2 ? v.variacion2 === variacion2 : true)
    );
    if (variacion) stock = variacion.Stock || variacion.stock || producto.stock;
  }

  const inputCantidad = document.getElementById(`detalle-cantidad-${producto.id}`);
  if (inputCantidad) {
    cantidad = parseInt(inputCantidad.value);
    if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
    if (cantidad > stock) cantidad = stock;
    inputCantidad.value = 1;
  }

  agregarAlCarrito(id, cantidad, { variacion1, variacion2 });
  cerrarDetalle();
}

function actualizarStockVariacion(productoId) {
  const producto = productos.find(p => p.id === productoId);
  if (!producto || !producto._variacionesValidas) return;

  const select1 = document.getElementById(`variacion1-${productoId}`);
  const select2 = document.getElementById(`variacion2-${productoId}`);

  const valor1 = select1 ? select1.value : null;
  const valor2 = select2 ? select2.value : null;

  // Buscar la variación seleccionada
  let variacion = producto._variacionesValidas.find(v =>
    v.variacion1 === valor1 && (select2 ? v.variacion2 === valor2 : true)
  ) || producto._variacionesValidas[0];

  if (!variacion) return;

  // Actualiza stock
  document.getElementById(`stock-detalle-${productoId}`).innerText = `Stock: ${variacion.Stock || variacion.stock || producto.stock}`;
  document.getElementById(`detalle-cantidad-${productoId}`).max = variacion.Stock || variacion.stock || producto.stock;

  // Actualiza imagen si corresponde
  if (variacion.imagen) {
    document.getElementById(`img-detalle-carrusel`).src = variacion.imagen;
  }

  // **Actualiza el precio**
  document.getElementById(`precio-detalle-${productoId}`).innerText = `Precio: $${variacion.precio || producto.precio}`;
}
