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
  if (fotocheckInput.length > 1) {
    searchFotocheck(fotocheckInput);
  } else {
    // Limpiar los campos si el fotocheck está vacío
    document.getElementById("nombre").value = '';
    document.getElementById("area").value = '';
    document.getElementById("empresa").value = '';
  }
});

///////
document.getElementById("fotocheckForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Capturar los datos del formulario
  const fotocheck = document.getElementById("fotocheck").value;
  const nombre = document.getElementById("nombre").value;
  const area = document.getElementById("area").value;
  const empresa = document.getElementById("empresa").value;
  const evento = document.getElementById("evento").value;
  const lugar = document.getElementById("lugar").value;

  const data = {
    fotocheck,
    nombre,
    area,
    empresa,
    evento,
    lugar
  };

  console.log("Datos capturados:", data);
  
  // Ahora guardaremos los datos en un CSV
  updateCSVOnGitHub(data).catch(error => console.error(error));
});

// Función para actualizar el archivo CSV en GitHub
async function updateCSVOnGitHub(data) {
  const token = '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'; // Reemplaza con tu token
  const repoOwner = 'kevin-Pereyra'; // Tu nombre de usuario en GitHub
  const repoName = 'FORMULARIO'; // Nombre del repositorio
  const filePath = 'REGISTROFINAL.csv'; // Ruta al archivo en el repositorio
  const branch = 'main'; // Nombre de la rama (ajusta si es diferente)

  const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`;
  
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      console.log("Obteniendo el archivo desde GitHub...");
      const response = await fetch(getFileUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        console.error('Error al obtener el archivo:', response.statusText);
        throw new Error('Error obteniendo el archivo: ' + response.statusText);
      }

      const fileData = await response.json();
      const fileSha = fileData.sha;
      const existingContent = atob(fileData.content); // Decodifica el contenido base64

      console.log("Archivo obtenido correctamente.");
      console.log("Contenido existente:", existingContent);

      // Preparar el nuevo registro
      const newRecord = Object.values(data).join(",") + "\n";
      const headers = 'fotocheck,nombre,area,empresa,eventos,lugar\n';
      const updatedContent = existingContent ? existingContent + newRecord : headers + newRecord;

      // Actualizar el archivo en GitHub
      const updateFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
      console.log("Actualizando el archivo en GitHub...");
      const updateResponse = await fetch(updateFileUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Agregar nuevo registro CSV',
          content: btoa(updatedContent), // Contenido actualizado en base64
          sha: fileSha, // SHA del archivo
          branch: branch // Rama
        })
      });

      if (!updateResponse.ok) {
        console.error('Error al actualizar el archivo:', updateResponse.statusText);
        throw new Error('Error actualizando el archivo: ' + updateResponse.statusText);
      }

      console.log('Archivo actualizado exitosamente.');
      return; // Salir de la función si la actualización es exitosa

    } catch (error) {
      console.error("Error en el intento", attempts + 1, ":", error);
      attempts++;

      if (attempts < maxAttempts) {
        console.log(`Reintentando en 5 segundos... (${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Esperar 5 segundos antes de reintentar
      } else {
        console.error('Se alcanzó el número máximo de reintentos.');
      }
    }
  }
}
