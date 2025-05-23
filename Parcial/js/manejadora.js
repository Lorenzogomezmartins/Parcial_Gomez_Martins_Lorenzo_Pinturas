//################################## Parte 1 – Listado inicial y alta básica ##################################
//1. Al cargar pintureria.html, obtener el listado de pinturas con GET /pinturas.

// URL base de la API de pinturas
const URL_API = "https://utnfra-api-pinturas.onrender.com/pinturas";

// Arreglo global para almacenar las pinturas obtenidas de la API
let pinturasGlobal = [];

// Configuración inicial del documento
document.addEventListener("DOMContentLoaded", () => {
    cargarPinturas(); // Carga y muestra las pinturas al iniciar
    // Asignación de eventos a los botones para manejar acciones del usuario
    document.getElementById("btnAgregar").addEventListener("click", agregarPintura);
    document.getElementById("btnModificar").addEventListener("click", modificarPintura);
    document.getElementById("btnFiltrarMarca").addEventListener("click", filtrarPinturasPorMarca);
    document.getElementById("btnPromedio").addEventListener("click", mostrarPrecioPromedio);
    document.getElementById("btnMostrarEstadisticas").addEventListener("click", () => {
        mostrarEstadisticas(pinturasGlobal);
    });
    document.getElementById('btnExportCSV').addEventListener('click', exportarCSV);
});

// Función para obtener los datos del formulario
function obtenerDatosFormulario() {
    return {
        marca: document.getElementById("inputMarca").value.trim(), // Obtiene la marca ingresada
        precio: parseFloat(document.getElementById("inputPrecio").value), // Obtiene el precio ingresado
        color: document.getElementById("inputColor").value, // Obtiene el color seleccionado
        cantidad: parseInt(document.getElementById("inputCantidad").value) // Obtiene la cantidad ingresada
    };
}

// Función para cargar y mostrar el listado de pinturas desde la API
async function cargarPinturas() {
    mostrarSpinner(); // Muestra un indicador de carga
    try {
        const response = await fetch(URL_API); // Realiza la solicitud a la API
        if (!response.ok) {
            throw new Error(`Error al cargar pinturas. Status: ${response.status}`);
        }
        const data = await response.json(); // Convierte la respuesta a JSON
        pinturasGlobal = data; // Almacena las pinturas en la variable global
        renderizarTabla(pinturasGlobal); // Renderiza la tabla con las pinturas
    } catch (error) {
        console.error("Error al cargar pinturas:", error);
        mostrarError("No se pudieron cargar las pinturas."); // Muestra un mensaje de error
    } finally {
        ocultarSpinner(); // Oculta el indicador de carga
    }
}

// Función para renderizar la tabla de pinturas en el DOM
function renderizarTabla(pinturas) {
    let html = `
    <table class="table table-striped table-bordered">
        <thead class="table-dark">
            <tr>
                <th>ID</th><th>MARCA</th><th>PRECIO</th><th>COLOR</th><th>CANTIDAD</th><th>ACCIONES</th>
            </tr>
        </thead>
        <tbody>`;

    // Itera sobre cada pintura y genera una fila en la tabla
    pinturas.forEach(p => {
        html += `
        <tr>
            <td>${p.id}</td>
            <td>${p.marca}</td>
            <td>${p.precio}</td>
            <td><input type="color" value="${p.color}" disabled></td>
            <td>${p.cantidad}</td>
            <td>
                <button class="btn btn-sm btn-success me-2" onclick="seleccionarPintura(${p.id})">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarPintura(${p.id})">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    document.getElementById("divListado").innerHTML = html; // Inserta la tabla en el DOM
}

// Función para agregar una nueva pintura a la API
async function agregarPintura() {
    const marca = document.getElementById("inputMarca").value.trim();
    const precio = parseFloat(document.getElementById("inputPrecio").value);
    const color = document.getElementById("inputColor").value;
    const cantidad = parseInt(document.getElementById("inputCantidad").value);

    // Validar campos básicos
    if (!validarFormulario()) return; // Si la validación falla, no continúa

    const nuevaPintura = { marca, precio, color, cantidad }; // Crea un objeto con los datos de la nueva pintura

    try {
        const res = await fetch("https://utnfra-api-pinturas.onrender.com/pinturas", {
            method: "POST", // Método de la solicitud
            headers: { "Content-Type": "application/json" }, // Tipo de contenido
            body: JSON.stringify(nuevaPintura), // Convierte el objeto a JSON
        });

        console.log("Status:", res.status); // Muestra el estado de la respuesta

        if (!res.ok) {
            const textoError = await res.text();
            throw new Error(`Error: ${res.status} - ${textoError}`);
        }

        const data = await res.json(); // Convierte la respuesta a JSON
        console.log("Pintura agregada:", data); // Muestra la pintura agregada

        alert("Pintura agregada correctamente."); // Notifica al usuario

        // Limpiar formulario
        document.getElementById("frmFormulario").reset();

        // Recargar listado
        cargarPinturas(); // Vuelve a cargar las pinturas para mostrar la nueva
    } catch (error) {
        console.error(error);
        alert("Error al agregar pintura: " + error.message); // Muestra un mensaje de error
    }
}



//################################## Parte 2 – Acciones de selección, modificación y eliminación ##################################
//1. Agregar columna ACCIONES con botones:
// Función para seleccionar una pintura y cargar sus datos en el formulario
function seleccionarPintura(id) {
    // Convertir el id recibido a string para evitar problemas de tipo
    const idStr = String(id);
    document.getElementById("btnModificar").disabled = false; // Habilita el botón de modificar
    // Buscar la pintura comparando el id convertido a string
    const p = pinturasGlobal.find(pintura => String(pintura.id) === idStr);

    if (!p) {
        mostrarMensaje("No se encontró la pintura seleccionada.", "danger"); // Muestra un mensaje si no se encuentra la pintura
        return;
    }

    // Limpiar formulario y validaciones antes de cargar nueva pintura
    document.getElementById("frmFormulario").reset(); // Resetea el formulario
    limpiarValidaciones(); // Limpia las validaciones previas

    // Cargar datos de pintura en el formulario
    document.getElementById("inputID").value = p.id ?? ""; // Carga el ID de la pintura
    document.getElementById("inputMarca").value = p.marca ?? ""; // Carga la marca
    document.getElementById("inputPrecio").value = p.precio ?? ""; // Carga el precio
    document.getElementById("inputColor").value = p.color ?? "#000000"; // Carga el color
    document.getElementById("inputCantidad").value = p.cantidad ?? ""; // Carga la cantidad
}

// Asocia la función seleccionarPintura al objeto global window
window.seleccionarPintura = seleccionarPintura;

// Función para modificar una pintura existente
async function modificarPintura() {
    const id = document.getElementById("inputID").value; // Obtiene el ID de la pintura a modificar
    if (!id) {
        mostrarMensaje("Seleccioná una pintura para modificar.", "warning"); // Mensaje si no se selecciona una pintura
        return;
    }

    if (!validarFormulario()) return; // Valida el formulario antes de continuar

    const pintura = obtenerDatosFormulario(); // Obtiene los datos del formulario

    mostrarSpinner(); // Muestra un indicador de carga

    try {
        const res = await fetch(`${URL_API}/${id}`, {
            method: "PUT", // Método para modificar la pintura
            headers: { "Content-Type": "application/json" }, // Tipo de contenido
            body: JSON.stringify(pintura) // Convierte el objeto a JSON
        });

        if (!res.ok) {
            const textoError = await res.text();
            throw new Error(`Error al modificar pintura: ${res.status} - ${textoError}`);
        }

        mostrarMensaje("Pintura modificada con éxito.", "success"); // Mensaje de éxito

        // Limpiar formulario (incluye inputID si está dentro)
        document.getElementById("frmFormulario").reset(); // Resetea el formulario

        // Limpiar validaciones
        limpiarValidaciones(); // Limpia las validaciones

        // Deshabilitar botón modificar
        document.getElementById("btnModificar").disabled = true; // Deshabilita el botón de modificar

        // Actualizar la lista sin recargar página
        await cargarPinturas(); // Recarga la lista de pinturas

    } catch (error) {
        mostrarMensaje(error.message || "Error desconocido", "danger"); // Muestra un mensaje de error
    } finally {
        ocultarSpinner(); // Oculta el indicador de carga
    }
}

// Función para eliminar una pintura
async function eliminarPintura(id) {
    console.log("Intentando eliminar pintura con id:", id); // Log para depuración

    if (!id) {
        alert("ID inválido para eliminar."); // Mensaje si el ID es inválido
        return;
    }

    if (!confirm("¿Estás seguro que querés eliminar esta pintura?")) {
        console.log("Eliminación cancelada por el usuario."); // Log si el usuario cancela
        return;
    }
    mostrarSpinner(); // Muestra un indicador de carga
    try {
        const res = await fetch(`${URL_API}/${id}`, {
            method: "DELETE", // Método para eliminar la pintura
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Respuesta DELETE status:", res.status); // Log del estado de la respuesta

        let respuestaTexto;
        try {
            respuestaTexto = await res.text(); // Intenta obtener el texto de la respuesta
            console.log("Respuesta textual del DELETE:", respuestaTexto);
        } catch (e) {
            console.warn("No se pudo obtener texto de la respuesta"); // Log si no se puede obtener texto
        }

        if (!res.ok) {
            throw new Error(`Error al eliminar pintura. Status: ${res.status} - ${respuestaTexto || ''}`);
        }

        // Luego de borrar, para estar seguros cargamos el listado y verificamos que ya no exista la pintura
        await cargarPinturas(); // Recarga la lista de pinturas

        const existe = pinturasGlobal.some(p => p.id == id); // Verifica si la pintura aún existe
        if (existe) {
            mostrarError("La pintura NO fue eliminada realmente."); // Mensaje si la pintura sigue existiendo
            console.error("La pintura sigue existiendo en el listado después del DELETE");
        } else {
            mostrarMensaje("Pintura eliminada correctamente.", "success"); // Mensaje de éxito
            console.log("Pintura eliminada y confirmada.");
        }
    } catch (error) {
        console.error("Error al eliminar pintura:", error); // Log del error
        mostrarError("No se pudo eliminar la pintura: " + error.message); // Mensaje de error
    } finally {
        ocultarSpinner(); // Oculta el indicador de carga
    }
}

// Asocia la función eliminarPintura al objeto global window
window.eliminarPintura = eliminarPintura;

//################################## Parte 3 – Validaciones con Bootstrap y JS ##################################
//1. Validar:
// Función para validar los campos del formulario
function validarFormulario() {
    // Obtener formulario y campos
    const form = document.getElementById("frmFormulario");
    const inputMarca = document.getElementById("inputMarca");
    const inputPrecio = document.getElementById("inputPrecio");
    const inputColor = document.getElementById("inputColor");
    const inputCantidad = document.getElementById("inputCantidad");

    const inputs = [inputMarca, inputPrecio, inputColor, inputCantidad];

    // Limpiar validaciones previas y ocultar mensajes
    inputs.forEach(input => {
        input.classList.remove("is-invalid", "is-valid"); // Elimina clases de validación
        const sibling = input.nextElementSibling; // Obtiene el siguiente elemento (feedback)
        if (sibling && sibling.classList.contains("invalid-feedback")) {
            sibling.textContent = ""; // Limpia el mensaje de error
            sibling.style.display = "none"; // Oculta el mensaje
        }
    });

    let valido = true; // Variable para determinar si el formulario es válido

    // Validar Marca (obligatorio)
    if (!inputMarca.value.trim()) {
        marcarError(inputMarca, "La marca es obligatoria."); // Marca error si está vacío
        valido = false; // Cambia el estado de validez
    } else {
        marcarExito(inputMarca); // Marca éxito si hay valor
    }

    // Validar Precio (obligatorio, entre 50 y 500)
    const precio = Number(inputPrecio.value);
    if (!inputPrecio.value || precio < 50 || precio > 500) {
        marcarError(inputPrecio, "El precio debe estar entre 50 y 500."); // Marca error si no está en rango
        valido = false; // Cambia el estado de validez
    } else {
        marcarExito(inputPrecio); // Marca éxito si hay valor válido
    }

    // Validar Color (obligatorio)
    if (!inputColor.value) {
        marcarError(inputColor, "El color es obligatorio."); // Marca error si está vacío
        valido = false; // Cambia el estado de validez
    } else {
        marcarExito(inputColor); // Marca éxito si hay valor
    }

    // Validar Cantidad (obligatorio, entre 1 y 400)
    const cantidad = Number(inputCantidad.value);
    if (!inputCantidad.value || cantidad < 1 || cantidad > 400) {
        marcarError(inputCantidad, "La cantidad debe estar entre 1 y 400."); // Marca error si no está en rango
        valido = false; // Cambia el estado de validez
    } else {
        marcarExito(inputCantidad); // Marca éxito si hay valor válido
    }

    return valido; // Devuelve el estado de validez del formulario
}

// Función para marcar un campo como inválido y mostrar un mensaje de error
function marcarError(input, mensaje) {
    input.classList.remove("is-valid"); // Elimina clase de éxito
    input.classList.add("is-invalid"); // Agrega clase de error

    const feedback = input.nextElementSibling; // Obtiene el siguiente elemento (feedback)
    if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.textContent = mensaje; // Establece el mensaje de error
        feedback.style.display = "block";  // Muestra el mensaje
    }
}

// Función para marcar un campo como válido y ocultar el mensaje de error
function marcarExito(input) {
    input.classList.remove("is-invalid"); // Elimina clase de error
    input.classList.add("is-valid"); // Agrega clase de éxito

    const feedback = input.nextElementSibling; // Obtiene el siguiente elemento (feedback)
    if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.textContent = ""; // Limpia el mensaje de error
        feedback.style.display = "none";  // Oculta el mensaje
    }
}

// Función para limpiar las validaciones de todos los campos del formulario
function limpiarValidaciones() {
    const inputs = [
        document.getElementById("inputMarca"),
        document.getElementById("inputPrecio"),
        document.getElementById("inputColor"),
        document.getElementById("inputCantidad"),
        document.getElementById("inputID") // si usás este input para la ID
    ];

    inputs.forEach(input => {
        input.classList.remove("is-valid", "is-invalid"); // Elimina clases de validación
        const feedback = input.nextElementSibling; // Obtiene el siguiente elemento (feedback)
        if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.textContent = ""; // Limpia el mensaje de error
            feedback.style.display = "none"; // Oculta el mensaje
        }
    });
}

//################################## Parte 4 – UX mejorado y filtros ##################################
//3. Agregar botón Filtros:
// Función para filtrar pinturas por marca
function filtrarPinturasPorMarca() {
    const inputFiltro = document.getElementById("inputFiltroMarca"); // Obtiene el campo de entrada para el filtro
    const filtro = inputFiltro.value.trim().toLowerCase(); // Obtiene el valor del filtro en minúsculas

    if (filtro === "") {
        // Si no se ingresó nada, mostrar todas las pinturas
        renderizarTabla(pinturasGlobal); // Renderiza todas las pinturas
        mostrarMensaje("Mostrando todas las pinturas.", "info"); // Mensaje informativo
        return;
    }

    // Filtra las pinturas que coinciden con la marca ingresada
    const filtradas = pinturasGlobal.filter(p => 
        typeof p.marca === "string" && 
        p.marca.trim().toLowerCase() === filtro
    );

    console.log("Filtro aplicado:", filtro); // Log del filtro aplicado
    console.log("Coincidencias encontradas:", filtradas.length); // Log de coincidencias encontradas

    if (filtradas.length === 0) {
        mostrarMensaje("No se encontraron pinturas con esa marca.", "info"); // Mensaje si no hay coincidencias
        renderizarTabla([]); // Renderiza una tabla vacía si no hay coincidencias
        return;
    }

    renderizarTabla(filtradas); // Renderiza las pinturas filtradas
}

// Función para mostrar un spinner mientras se espera respuesta del API
function mostrarSpinner() {
    document.getElementById("spinner").style.display = "block"; // Muestra el spinner
}

// Función para ocultar el spinner
function ocultarSpinner() {
    document.getElementById("spinner").style.display = "none"; // Oculta el spinner
}

// Función para mostrar el precio promedio de las pinturas
function mostrarPrecioPromedio() {
    if (!Array.isArray(pinturasGlobal) || pinturasGlobal.length === 0) {
        alert("No hay pinturas para calcular el promedio."); // Mensaje si no hay pinturas
        return;
    }

    // Convierte cada precio a Number en caso de que venga como string
    const precios = pinturasGlobal
        .map(p => Number(p.precio)) // Mapea los precios a números
        .filter(n => !isNaN(n));   // Descartamos valores que no se conviertan a número

    if (precios.length === 0) {
        alert("No hay precios válidos para calcular el promedio."); // Mensaje si no hay precios válidos
        return;
    }

    const suma = precios.reduce((acc, curr) => acc + curr, 0); // Suma todos los precios
    const promedio = suma / precios.length; // Calcula el promedio

    alert(`El precio promedio de las pinturas es: $${promedio.toFixed(2)}`); // Muestra el promedio
}

//################################## Parte 6 – Funcionalidades estadísticas y exportación ##################################
//1. Agregar botón: Mostrar estadísticas (nuevo div o modal que muestre):
// Función para mostrar estadísticas de las pinturas
function mostrarEstadisticas() {
  if (!pinturasGlobal || pinturasGlobal.length === 0) {
    alert("No hay pinturas cargadas para mostrar estadísticas."); // Mensaje si no hay pinturas
    return;
  }

  const totalPinturas = pinturasGlobal.length; // Total de pinturas cargadas

  // Contar marcas
  const marcasCount = {};
  pinturasGlobal.forEach(p => {
    const marca = (typeof p.marca === "string" && p.marca.trim() !== "") ? p.marca.trim() : "Sin Marca"; // Manejo de marcas vacías
    marcasCount[marca] = (marcasCount[marca] || 0) + 1; // Cuenta las marcas
  });

  // Marca más común
  let marcaMasComun = "";
  let maxCount = 0;
  for (const marca in marcasCount) {
    if (marcasCount[marca] > maxCount) {
      maxCount = marcasCount[marca];
      marcaMasComun = marca; // Actualiza la marca más común
    }
  }

  // Pintura con mayor precio - Ignorar precios inválidos
  let pinturaMayorPrecio = null;
  pinturasGlobal.forEach(p => {
    let precioNum = Number(p.precio);
    if (p.precio !== undefined && !isNaN(precioNum)) {
      if (!pinturaMayorPrecio || precioNum > Number(pinturaMayorPrecio.precio)) {
        pinturaMayorPrecio = p; // Actualiza la pintura con el mayor precio
      }
    }
  });

  // Precio promedio general - solo válidos
  let sumaPrecios = 0;
  let cantPreciosValidos = 0;
  pinturasGlobal.forEach(p => {
    let precioNum = Number(p.precio);
    if (p.precio !== undefined && !isNaN(precioNum)) {
      sumaPrecios += precioNum; // Suma de precios válidos
      cantPreciosValidos++;
    }
  });
  const promedioGeneral = cantPreciosValidos > 0 ? (sumaPrecios / cantPreciosValidos).toFixed(2) : "0.00"; // Cálculo del promedio

  // Precio promedio por marca
  const preciosPorMarca = {};
  pinturasGlobal.forEach(p => {
    const marca = (typeof p.marca === "string" && p.marca.trim() !== "") ? p.marca.trim() : "Sin Marca"; // Manejo de marcas vacías
    let precioNum = Number(p.precio);
    if (p.precio !== undefined && !isNaN(precioNum)) {
      if (!preciosPorMarca[marca]) {
        preciosPorMarca[marca] = []; // Inicializa el arreglo para la marca
      }
      preciosPorMarca[marca].push(precioNum); // Agrega el precio al arreglo de la marca
    }
  });

  // Ordenar marcas alfabéticamente
  const marcasOrdenadas = Object.keys(preciosPorMarca).sort((a, b) => a.localeCompare(b));

  let promedioPorMarcaHTML = "";
  marcasOrdenadas.forEach(marca => {
    const precios = preciosPorMarca[marca];
    const suma = precios.reduce((a, b) => a + b, 0); // Suma de precios por marca
    const promedio = (suma / precios.length).toFixed(2); // Cálculo del promedio por marca
    promedioPorMarcaHTML += `<li><strong>${marca}</strong>: $${promedio}</li>`; // Genera el HTML para mostrar
  });

  // Mostrar resultados
  const divEstadisticas = document.getElementById("divEstadisticas");
  if (divEstadisticas) {
    divEstadisticas.style.display = "block"; // Muestra el div de estadísticas
    divEstadisticas.innerHTML = `
      <style>
        #divEstadisticas ul {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 10px;
          list-style-type: none;
          margin: 0;
        }
        #divEstadisticas ul li {
          padding: 4px 0;
          border-bottom: 1px solid #eee;
        }
        #divEstadisticas ul li:last-child {
          border-bottom: none;
        }
      </style>

      <p><strong>Total de pinturas cargadas:</strong> ${totalPinturas}</p>
      <p><strong>Marca más común:</strong> ${marcaMasComun}</p>
      <p><strong>Pintura con mayor precio:</strong> ${
        pinturaMayorPrecio ? `${pinturaMayorPrecio.marca} - $${Number(pinturaMayorPrecio.precio).toFixed(2)}` : "No disponible"
      }</p>
      <p><strong>Precio promedio general:</strong> $${promedioGeneral}</p>
      <p><strong>Precio promedio por marca:</strong></p>
      <ul>${promedioPorMarcaHTML}</ul>
    `;
  }
}

// Función para exportar las pinturas a un archivo CSV
function exportarCSV() {
    if (!pinturasGlobal || pinturasGlobal.length === 0) {
        alert("No hay datos para exportar."); // Mensaje si no hay datos
        return;
    }

    // Encabezados CSV
    const encabezados = ["ID", "Marca", "Precio", "Color", "Cantidad"];
    const filas = pinturasGlobal.map(p => [
        p.id,
        p.marca,
        p.precio,
        p.color,
        p.cantidad
    ]);

    // Construir CSV como string
    let csvContent = encabezados.join(",") + "\n"; // Agrega encabezados
    filas.forEach(fila => {
        // Escapar comas y caracteres especiales en strings, y envolver en comillas dobles si es necesario
        const filaEscapada = fila.map(celda => {
            if (typeof celda === "string" && (celda.includes(",") || celda.includes('"'))) {
                return `"${celda.replace(/"/g, '""')}"`; // Reemplaza " por ""
            }
            return celda;
        });
        csvContent += filaEscapada.join(",") + "\n"; // Agrega la fila al contenido CSV
    });

    // Crear Blob y descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" }); // Crea un Blob con el contenido CSV
    const url = URL.createObjectURL(blob); // Crea un URL para el Blob
    const a = document.createElement("a"); // Crea un elemento <a> para la descarga
    a.href = url;
    a.download = "pinturas_export.csv"; // Nombre del archivo a descargar
    document.body.appendChild(a);
    a.click(); // Simula un clic para iniciar la descarga
    document.body.removeChild(a); // Elimina el elemento <a> del DOM
    URL.revokeObjectURL(url); // Revoca el URL del Blob
}

// Función para manejar el modo oscuro/claro
document.addEventListener("DOMContentLoaded", () => {
    const btnToggle = document.getElementById("theme-toggle"); // Botón para cambiar el tema
    const body = document.body; // Cuerpo del documento
    const icon = btnToggle.querySelector("i"); // Icono dentro del botón

    // Cargar preferencia guardada
    const modoGuardado = localStorage.getItem("modoOscuro");
    if (modoGuardado === "true") {
        body.classList.add("dark-mode"); // Aplica el modo oscuro
        icon.classList.replace("bi-moon-fill", "bi-sun-fill"); // Cambia el icono
        btnToggle.innerHTML = '<i class="bi bi-sun-fill"></i> Modo Claro'; // Cambia el texto del botón
    }

    btnToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode"); // Alterna el modo oscuro
        const modoActivo = body.classList.contains("dark-mode");
        
        if (modoActivo) {
            icon.classList.replace("bi-moon-fill", "bi-sun-fill"); // Cambia el icono a sol
            btnToggle.innerHTML = '<i class="bi bi-sun-fill"></i> Modo Claro'; // Cambia el texto del botón
        } else {
            icon.classList.replace("bi-sun-fill", "bi-moon-fill"); // Cambia el icono a luna
            btnToggle.innerHTML = '<i class="bi bi-moon-fill"></i> Modo Oscuro'; // Cambia el texto del botón
        }
        
        // Guardar preferencia
        localStorage.setItem("modoOscuro", modoActivo); // Guarda la preferencia en localStorage
    });
});
