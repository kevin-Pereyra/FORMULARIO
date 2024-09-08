// URL del archivo CSV en GitHub
const dataUrl = 'https://raw.githubusercontent.com/kevin-Pereyra/FORMULARIO/main/BASEDEDATOSS.csv';

// Función para obtener y procesar los datos del archivo CSV
async function getData() {
  try {
    const response = await fetch(dataUrl);
    const csvData = await response.text();
    // Procesar el CSV para convertirlo en un array de objetos
    const data = csvToArray(csvData);
    return data;
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}

// Función para convertir CSV en un array de objetos
function csvToArray(csv) {
  const lines = csv.split('\n');
  const result = [];
  const headers = lines[0].split(',').map(header => header.trim()); // Asegurarse de que no haya espacios en blanco

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      if (currentLine[j] !== undefined) {
        // Convertir fotocheck a número y los demás campos a texto
        if (headers[j] === "FOTOCHECK") {
          obj[headers[j]] = currentLine[j] ? parseInt(currentLine[j].trim(), 10) : null; // Convertir a número
        } else {
          obj[headers[j]] = currentLine[j] ? currentLine[j].trim() : ''; // Mantener los valores como texto
        }
      }
    }
    result.push(obj);
  }
  return result;
}

// Función para buscar el fotocheck y rellenar los campos
async function searchFotocheck(fotocheckInput) {
  const data = await getData();
  const fotocheckNumber = parseInt(fotocheckInput.trim(), 10); // Convertir input a número
  const result = data.find(item => item.FOTOCHECK === fotocheckNumber);
 

  if (result) {
    // Si se encuentra el fotocheck, rellenar los campos
    document.getElementById("nombre").value = result.NOMBRE;
    document.getElementById("area").value = result.AREA;
    document.getElementById("empresa").value = result.EMPRESA;
  } else {
    // Si no se encuentra, limpiar los campos
    document.getElementById("nombre").value = '';
    document.getElementById("area").value = '';
    document.getElementById("empresa").value = '';
  }
}

// Evento que se dispara cuando se ingresa un fotocheck
document.getElementById("fotocheck").addEventListener("input", function() {
  const fotocheckInput = this.value;
  if (fotocheckInput.length > 0) {
    searchFotocheck(fotocheckInput);
  } else {
    // Limpiar los campos si el fotocheck está vacío
    document.getElementById("nombre").value = '';
    document.getElementById("area").value = '';
    document.getElementById("empresa").value = '';
  }
});
