/**
 * Función para copiar una matriz 
 * @param {array} matriz  La matriz original a copiar
 * @returns {array} Una matriz copiada
 */
function copiarMatriz(matriz) {
  return matriz.map(fila => [...fila]) //Copiar cada fila de la matriz (si lo hacemos como asignación, nos genera una referencia, no una copia)
}

function verificarMatriz(tablero) {
  const filas = tablero.length
  const columnas = tablero[0].length
  let valido = true

  // Verificar autos horizontales 
  for (let fila = 0; fila < filas; fila++) {
    let cuerpoHorizontal = false
    let tieneCabeza = false

    for (let columna = 0; columna < columnas; columna++) {
      const simbolo = tablero[fila][columna]

      if (simbolo === '-') {
        cuerpoHorizontal = true
      }

     
      if (simbolo === '>' || simbolo === 'B') { // Hay cabeza
        if (cuerpoHorizontal) {
          tieneCabeza = true
          cuerpoHorizontal = false
        }
      }

      // Si termina la fila y hay cuerpo sin cabeza
      if (columna === columnas - 1 && cuerpoHorizontal && !tieneCabeza) {
        console.log(`Cuerpo sin cabeza en la fila ${fila}`);
        valido = false
      }
    }
  }

  // Verificar autos verticales 
  for (let columna = 0; columna < columnas; columna++) {
    let cuerpoVertical = false
    let tieneCabeza = false

    for (let fila = 0; fila < filas; fila++) {
      const simbolo = tablero[fila][columna];

      if (simbolo === '|') {
        cuerpoVertical = true
      }

      
      if (simbolo === 'v' || simbolo === 'B') { // Hay cabeza
        if (cuerpoVertical) {
          tieneCabeza = true
          cuerpoVertical = false
        }
      }

      // Si termina la columna y hay cuerpo sin cabeza
      if (fila === filas - 1 && cuerpoVertical && !tieneCabeza) {
        console.log(`Cuerpo sin cabeza en la columna ${columna}`)
        valido = false
      }
    }
  }

  if (valido) {
    console.log("Tablero valido");
  } else {
    console.log("Tablero invalido");
  }

  return valido
}



/**
 * Función para pasar una matriz a un string unico
 * @param {array} matriz - La matriz a transformar
 * @returns {string} El string del tablero
 */
function serializarMatriz(matriz) {
  return matriz.map(fila => fila.join('')).join('\n') // Unir filas en strings y luego con saltos de línea
}

/**
 * Función para verificar si se alcanzó una meta
 * @param {array} matriz La matriz actual del tablero
 * @param {array} metas  Lista de posiciones meta [[fila, columna], ...]
 * @returns {boolean} True o false si B está en la meta o no
 */
function esMeta(matriz, metas) {
  const posicionesB = buscarPosiciones(matriz, 'B') // Obtener posiciones de 'B'
  return posicionesB.some(([fila, columna]) => metas.some(([metaFila, metaColumna]) => metaFila === fila && metaColumna === columna)) // Ver SI b COINCIDE  con la meta
}


function imprimirMatriz(matriz) {
  for (const fila of matriz) console.log(fila.join(' ')) 
  console.log('--------------------------') 
}

/**
 * Función para buscar cierto caracter en una matriz
 * @param {array} matriz La matriz en la que vamos a buscar el simbolo
 * @param {string} simbolo  El simbolo (string) q vamos a buscar
 * @returns {array} Lista de las ubicaciones de los simbolos [[fila, columna], ...]
 */
function buscarPosiciones(matriz, simbolo) {
  const posiciones = [] // Inicializar array para posiciones
  for (let fila = 0; fila < matriz.length; fila++) {  //recorrer matriz
    for (let columna = 0; columna < matriz[fila].length; columna++) { 
      if (matriz[fila][columna] === simbolo) posiciones.push([fila, columna]) // Si coincide, agregar posición
    }
  }
  return posiciones // Devolver lista de posiciones
}

/**
 * Función que encuentra todos los autos del tablero
 * @param {array} matriz  La matriz en la que vamos a buscar los autos
 * @returns {array} Lista de autos (con su tipo, ubicación de la cabeza, y su longitud)
 */
function encontrarAutos(matriz) {
  const autos = [] // Inicializar array para autos
  const cantidadFilas = matriz.length // Obtener número de filas
  const cantidadColumnas = matriz[0].length // Obtener número de columnas
  const visitados = new Set() // Set para marcar celdas ya procesadas

  // Recorrer elementos de la matriz ar-ab, izq-der
  for (let fila = 0; fila < cantidadFilas; fila++) { 
    for (let columna = 0; columna < cantidadColumnas; columna++) { 
      const clave = `${fila},${columna}` // Crear clave única para la celda
      if (visitados.has(clave)) continue // Saltar si ya fue visitada

      const simbolo = matriz[fila][columna] // Obtener símbolo de la celda

      // Encontrar autos horizontales
      if (simbolo === '>' || simbolo === 'B') { // Si es cabeza horizontal
        let largo = 1 
        let columnaCola = columna - 1 
        while (columnaCola >= 0 && matriz[fila][columnaCola] === '-') { // Contar la cantidad de la cola hasta atrás
          largo++ 
          visitados.add(`${fila},${columnaCola}`) 
          columnaCola-- // Mover a la izquierda
        }
        autos.push({ tipo: 'horizontal', cabeza: [fila, columna], largo }) // Meter auto horizontal al arreglo de autos
        visitados.add(clave) // Marcar cabeza como visitada
      }
      // Meter autos verticales
      else if (simbolo === 'v' || (simbolo === 'B' && (fila === 0 || matriz[fila - 1][columna] !== '|'))) { // Si es cabeza vertical 
        let largo = 1 
        let filaCola = fila - 1 
        while (filaCola >= 0 && matriz[filaCola][columna] === '|') { 
          visitados.add(`${filaCola},${columna}`) 
          filaCola-- // Mover arriba
        }
        autos.push({ tipo: 'vertical', cabeza: [fila, columna], largo }) // Poner carro vertical en el arreglo de autos
        visitados.add(clave) // Marcar cabeza como visitada
      }
    }
  }
  return autos // Devolver lista de autos
}

/**
 * Función para mover un auto en una dirección si es posible
 * @param {array} matriz La matriz actual del tablero
 * @param {object} auto El auto a mover {tipo, cabeza: [fila, columna], largo}
 * @param {string} direccion La dirección del movimiento ('izquierda', 'derecha', 'arriba', 'abajo')
 * @returns {array|null} La nueva matriz si el movimiento es válido, null si no
 */
function moverAuto(matriz, auto, direccion) {
  const [filaCabeza, columnaCabeza] = auto.cabeza 
  const cantidadFilas = matriz.length 
  const cantidadColumnas = matriz[0].length 
  const nuevaMatriz = copiarMatriz(matriz) 
  const simboloCabeza = matriz[filaCabeza][columnaCabeza] 

  // Obtener todas las posiciones del auto (desde cola hasta cabeza)
  let posicionesAuto = [] 
  if (auto.tipo === 'horizontal') { 
    let columnaCola = columnaCabeza // Empezar desde la cabeza
    while (columnaCola - 1 >= 0 && matriz[filaCabeza][columnaCola - 1] === '-') columnaCola-- // Buscar cola a la izquierda
    for (let columnaPos = columnaCola; columnaPos <= columnaCabeza; columnaPos++) posicionesAuto.push([filaCabeza, columnaPos]) // Agregar posiciones
  }
  
  else { // Si es vertical
    let filaCola = filaCabeza // Empezar desde la cabeza
    while (filaCola - 1 >= 0 && matriz[filaCola - 1][columnaCabeza] === '|') filaCola-- // Buscar cola arriba
    for (let filaPos = filaCola; filaPos <= filaCabeza; filaPos++) posicionesAuto.push([filaPos, columnaCabeza]) // Agregar posiciones
  }

  // Calcular hasta dónde puede avanzar
  let pasos = 0 
  if (direccion === 'derecha') { 
    let columna = posicionesAuto[posicionesAuto.length - 1][1] + 1 // Columna siguiente a la cabeza
    while (columna < cantidadColumnas && matriz[posicionesAuto[0][0]][columna] === '.') {
      pasos++ 
      columna++ 
    }
  } 
  
  else if (direccion === 'izquierda') { 
    let columna = posicionesAuto[0][1] - 1 
    while (columna >= 0 && matriz[posicionesAuto[0][0]][columna] === '.') { 
      pasos++ 
      columna-- 
    }
  } 
  
  else if (direccion === 'abajo') { 
    let fila = posicionesAuto[posicionesAuto.length - 1][0] + 1 // Fila siguiente a la cabeza
    while (fila < cantidadFilas && matriz[fila][posicionesAuto[0][1]] === '.') { 
      pasos++ 
      fila++ 
    }
  } 
  
  else if (direccion === 'arriba') { 
    let fila = posicionesAuto[0][0] - 1 // Fila anterior a la cola
    while (fila >= 0 && matriz[fila][posicionesAuto[0][1]] === '.') {
      pasos++ 
      fila-- 
    }
  }

  if (pasos === 0) return null // movimiento inválido

  // Borrar posiciones antiguas
  for (const [fila, columna] of posicionesAuto) nuevaMatriz[fila][columna] = '.' 

  // Calcular nuevas posiciones
  const nuevasPosiciones = posicionesAuto.map(([fila, columna]) => { // Usar map para desplazar posiciones
    if (direccion === 'derecha') return [fila, columna + pasos] 
    if (direccion === 'izquierda') return [fila, columna - pasos] 
    if (direccion === 'abajo') return [fila + pasos, columna] 
    if (direccion === 'arriba') return [fila - pasos, columna] 
  })

  // Dibujar el cuerpo del auto
  for (let index = 0; index < nuevasPosiciones.length - 1; index++) { // Para cada posición menos la última
    const [fila, columna] = nuevasPosiciones[index] 
    nuevaMatriz[fila][columna] = auto.tipo === 'horizontal' ? '-' : '|' // Dibujar '-' o '|'
  }

  // Dibujar la cabeza
  const [filaCabezaNueva, columnaCabezaNueva] = nuevasPosiciones[nuevasPosiciones.length - 1] 
  nuevaMatriz[filaCabezaNueva][columnaCabezaNueva] = simboloCabeza === 'B' ? 'B' : (auto.tipo === 'horizontal' ? '>' : 'v') // Dibujar cabeza

  // Actualizar cabeza del auto
  auto.cabeza = [filaCabezaNueva, columnaCabezaNueva] 

  return nuevaMatriz 
}


/**
 * Función que ejecuta BFS para resolver el puzzle de Rush Hour
 * @param {array} matriz  La matriz inicial del tablero
 * @param {array} metas Lista de posiciones meta 
 * @param {number} maxMovimientos Limite de movimientos para evitar que explote
 * @returns {array|null} La secuencia de matrices que llevan a la meta, o null si no hay solución
 */
function bfsEnMatriz(matriz, metas, maxMovimientos = 100) {
  console.log("Tablero al inicio") 
  imprimirMatriz(matriz) 

  const visitados = new Set([serializarMatriz(matriz)]) // Set de estados visitados
  const cola = [{ matriz: copiarMatriz(matriz), secuencia: [copiarMatriz(matriz)] }] // Cola con estado inicial y secuencia
  let estadosExplorados = 1 

  while (cola.length > 0) { 
    const { matriz: estadoActual, secuencia } = cola.shift() // Sacar primer elemento de la cola

    if (estadosExplorados >= maxMovimientos) { //Superar cantidad máxima de moviemientos
      console.log("Se llegó al máximo número de movimientos sin llegar a la meta") 
      console.log(`Estados que se exploraron =  ${visitados.size}`) 
      return null 
    }

    if (esMeta(estadoActual, metas)) { // Verificar si se alcanzó la meta
      console.log("Se alcanzó la meta") 
      console.log(`Total de estados en la secuencia: ${secuencia.length}`) 
      console.log(`Estados explorados en total: ${visitados.size}`) 
      return secuencia 
    }

    const autos = encontrarAutos(estadoActual) // Encontrar autos en el estado actual

    for (const auto of autos) { 
      const direcciones = auto.tipo === 'horizontal' ? ["izquierda", "derecha"] : ["arriba", "abajo"] 

      for (const direccion of direcciones) { 
        const nuevaMatriz = moverAuto(estadoActual, auto, direccion) // Intentar mover el auto

        if (nuevaMatriz) { // Si el movimiento es válido
          const serial = serializarMatriz(nuevaMatriz) 
          if (!visitados.has(serial)) { // Si no ha sido visitada
            visitados.add(serial) // Agregar a visitados
            estadosExplorados++ // Incrementar contador

            //console.log(`Se mueve el auto de (${auto.cabeza[0]},${auto.cabeza[1]}) a ${direccion}`) 
            //imprimirMatriz(nuevaMatriz) 

            const nuevaSecuencia = [...secuencia, copiarMatriz(nuevaMatriz)] // Extender secuencia
            cola.push({ matriz: nuevaMatriz, secuencia: nuevaSecuencia }) // Agregar a la cola
          }
        }
      }
    }
  }

  console.log("No hay solución") 
  console.log(`Estados explorados: ${visitados.size}`)
  return null 
}

/**
 * Funcion que imprime las matrices junto a los movimeintos hechos
 * @param {Array<Array<Array<string>>>} listaDeMatrices Lista de matrices que representan los estados finales del tablero
 */
function mostrarSecuenciaDeMatrices(listaDeMatrices) {

  function imprimirMatriz(matriz) {
    for (const fila of matriz) {
      console.log(fila.join(" "))
    }
    console.log("--------------------------")
  }

  // Busca las posiciones de todas las cabezas de los autos
  function buscarCabezas(matriz) {
    const cabezas = []
    for (let fila = 0; fila < matriz.length; fila++) {
      for (let columna = 0; columna < matriz[fila].length; columna++) {
        const celda = matriz[fila][columna]
        if (celda === ">" || celda === "v" || celda === "B") {
          cabezas.push({ fila, columna, simbolo: celda })
        }
      }
    }
    return cabezas
  }

  // Encuentra la cabeza más cercana en la siguiente matriz
  function encontrarMasCercano(origen, lista) {
    let menorDistancia = Infinity
    let masCercano = null
    for (const punto of lista) {
      const distancia = Math.abs(punto.fila - origen.fila) + Math.abs(punto.columna - origen.columna)
      if (distancia < menorDistancia) {
        menorDistancia = distancia
        masCercano = punto
      }
    }
    return masCercano
  }

  console.log("Estado inicial:")
  imprimirMatriz(listaDeMatrices[0])

  // Compara cada par de matrices consecutivas
  for (let paso = 0; paso < listaDeMatrices.length - 1; paso++) {
    const matrizActual = listaDeMatrices[paso]
    const matrizSiguiente = listaDeMatrices[paso + 1]

    const cabezasAntes = buscarCabezas(matrizActual)
    const cabezasDespues = buscarCabezas(matrizSiguiente)

    let cabezaAnterior = null
    let cabezaNueva = null

    // Buscar cuál cabeza cambió de posición
    for (const cabeza of cabezasAntes) {
      const sigueIgual = cabezasDespues.find(
        c => c.simbolo === cabeza.simbolo && c.fila === cabeza.fila && c.columna === cabeza.columna
      )
      if (!sigueIgual) {
        cabezaAnterior = cabeza
        cabezaNueva = encontrarMasCercano(cabeza, cabezasDespues.filter(c => c.simbolo === cabeza.simbolo))
        break
      }
    }

    if (!cabezaAnterior || !cabezaNueva) continue

    // Dirección del movimiento
    let direccion = ""
    if (cabezaNueva.fila === cabezaAnterior.fila) {
      direccion = cabezaNueva.columna > cabezaAnterior.columna ? "derecha" : "izquierda"
    } else {
      direccion = cabezaNueva.fila > cabezaAnterior.fila ? "abajo" : "arriba"
    }

    console.log( `Movimiento ${paso + 1}: El auto que estaba en (${cabezaAnterior.fila},${cabezaAnterior.columna}) se movió hacia ${direccion}` )
    imprimirMatriz(matrizSiguiente)
  }

  console.log("Fin de la secuencia de movimientos")
}



// Prueba
let matriz = [
  [".", ".", ".", "-", "-", ">", "."],
  [".", ".", ".", ".", ".", ".", "|"],
  ["|", ".", ".", ".", ".", ".", "|"],
  ["|", ".", ".", ".", ".", ".", "|"],
  ["v", ".", "-", "B", ".", ".", "v"],
  [".", ".", ".", ".", ".", ".", "."]
]

console.log(verificarMatriz(matriz))
let metas = [[4, 6]]


const resultado = bfsEnMatriz(matriz, metas)

mostrarSecuenciaDeMatrices(resultado)

