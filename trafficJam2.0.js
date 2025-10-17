class Node {
  constructor(key, valor = null) {
    this.key = key              
    this.valor = valor          
    this.hijos = new Set()      
    this.padres = new Set()     
  }

  agregarHijo(hijo) {
    this.hijos.add(hijo)
    hijo.padres.add(this)
  }
}

class Grafo {
  constructor(filas, columnas) {
    this.nodos = new Map()
    this.filas = filas
    this.columnas = columnas
    this.crearTablero()
  }

  crearTablero() {
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        const key = `${i},${j}`
        this.agregarNodo(key)
      }
    }

    
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        const key = `${i},${j}`
        const nodo = this.nodos.get(key)

        
        if (j + 1 < this.columnas) {
          const derecha = this.nodos.get(`${i},${j + 1}`)
          nodo.agregarHijo(derecha)
        }

        
        if (i + 1 < this.filas) {
          const abajo = this.nodos.get(`${i + 1},${j}`)
          nodo.agregarHijo(abajo)
        }
      }
    }
  }

  agregarNodo(key, valor = ' ') {
    if (!this.nodos.has(key)) {
      this.nodos.set(key, new Node(key, valor))
    }
    return this.nodos.get(key)
  }


  getNodoValue(i, j){
    return this.nodos.get(`${i},${j}`)
  }

}

let tamano = 6
const grafo = new Grafo(tamano,tamano)
let matriz = []

function insertarNodos(){
  matriz = []
  for (i=0; i<tamano; i++){
    let matrizSub = []
    for (j=0; j<tamano; j++){
      let nodo = grafo.getNodoValue(i,j)
      let simbolo = nodo.valor
      matrizSub.push(simbolo)
    }
    matriz.push(matrizSub)
  }
}

insertarNodos()
console.log(matriz);
function generarTableroResoluble(numCarros) {
  
  const filaB = Math.floor(tamano / 2)
  const colB = 0
  grafo.getNodoValue(filaB, colB).valor = '-'
  grafo.getNodoValue(filaB, colB + 1).valor = 'B'

  
  salida = { fila: filaB, columna: tamano - 1 }
  grafo.getNodoValue(salida.fila, salida.columna).valor = 'S'

  let carrosColocados = 1

  
  const intentosMax = 200
  let intentos = 0

  while (carrosColocados < numCarros && intentos < intentosMax) {
    intentos++
    const orientacion = Math.random() < 0.5 ? 'H' : 'V'
    const largo = Math.floor(Math.random() * 2) + 2
    const i = Math.floor(Math.random() * tamano)
    const j = Math.floor(Math.random() * tamano)

    if (puedeColocar(i, j, orientacion, largo)) {
      colocarCarro(i, j, orientacion, largo)
      carrosColocados++
    }
  }
}

// Comprobar si cabe el carro
function puedeColocar(i, j, orientacion, largo) {
  if (orientacion === 'H') {
    if (j + largo > tamano) return false
    for (let x = 0; x < largo; x++)
      if (grafo.getNodoValue(i, j + x).valor !== ' ') return false
  } else {
    if (i + largo > tamano) return false
    for (let x = 0; x < largo; x++)
      if (grafo.getNodoValue(i + x, j).valor !== ' ') return false
  }
  return true
}

// Colocar el carro en el grafo
function colocarCarro(i, j, orientacion, largo) {
  if (orientacion === 'H') {
    for (let x = 0; x < largo - 1; x++) grafo.getNodoValue(i, j + x).valor = '-'
    grafo.getNodoValue(i, j + largo - 1).valor = '>'
  } else {
    for (let x = 0; x < largo - 1; x++) grafo.getNodoValue(i + x, j).valor = '|'
    grafo.getNodoValue(i + largo - 1, j).valor = 'v'
  }
}



generarTableroResoluble(8) 
insertarNodos()



const visitados = new Set()


function clonarMatriz(tablero) {
  return tablero.map(fila => [...fila])
}


function tableroAString(tablero) {
  return tablero.map(f => f.join('')).join('|')
}


function obtenerCarro(tablero, i, j) {
  const valor = tablero[i][j]
  if (valor === ' ' || valor === 'S') return null

  let orientacion, posiciones = [{ i, j }]
  if (valor === '-' || valor === '>') orientacion = 'H'
  else orientacion = 'V'

  if (orientacion === 'H') {
    let col = j + 1
    while (col < tablero[0].length && (tablero[i][col] === '-' || tablero[i][col] === '>')) {
      posiciones.push({ i, j: col })
      col++
    }
  } else {
    let fila = i + 1
    while (fila < tablero.length && (tablero[fila][j] === '|' || tablero[fila][j] === 'v')) {
      posiciones.push({ i: fila, j })
      fila++
    }
  }

  return { valor, orientacion, posiciones }
}


function puedeMover(tablero, carro, direccion) {
  if (carro.orientacion === 'H') {
    if (direccion === 'derecha') {
      const ultimo = carro.posiciones[carro.posiciones.length - 1]
      return ultimo.j + 1 < tablero[0].length && tablero[ultimo.i][ultimo.j + 1] === ' '
    }
    if (direccion === 'izquierda') {
      const primero = carro.posiciones[0]
      return primero.j - 1 >= 0 && tablero[primero.i][primero.j - 1] === ' '
    }
  } else {
    if (direccion === 'abajo') {
      const ultimo = carro.posiciones[carro.posiciones.length - 1]
      return ultimo.i + 1 < tablero.length && tablero[ultimo.i + 1][ultimo.j] === ' '
    }
    if (direccion === 'arriba') {
      const primero = carro.posiciones[0]
      return primero.i - 1 >= 0 && tablero[primero.i - 1][primero.j] === ' '
    }
  }
  return false
}


function moverCarro(tablero, carro, direccion) {
  const nuevoTablero = clonarMatriz(tablero)
  const posiciones = carro.posiciones

  if (carro.orientacion === 'H') {
    if (direccion === 'derecha') {
      nuevoTablero[posiciones[0].i][posiciones[0].j] = ' '
      const ultima = posiciones[posiciones.length - 1]
      nuevoTablero[ultima.i][ultima.j + 1] = carro.valor === 'B' ? 'B' : '>'
    } else if (direccion === 'izquierda') {
      const ultima = posiciones[posiciones.length - 1]
      nuevoTablero[ultima.i][ultima.j] = ' '
      const primera = posiciones[0]
      nuevoTablero[primera.i][primera.j - 1] = carro.valor === 'B' ? 'B' : '>'
    }
  } else {
    if (direccion === 'abajo') {
      nuevoTablero[posiciones[0].i][posiciones[0].j] = ' '
      const ultima = posiciones[posiciones.length - 1]
      nuevoTablero[ultima.i + 1][ultima.j] = carro.valor === 'B' ? 'B' : 'v'
    } else if (direccion === 'arriba') {
      const ultima = posiciones[posiciones.length - 1]
      nuevoTablero[ultima.i][ultima.j] = ' '
      const primera = posiciones[0]
      nuevoTablero[primera.i - 1][primera.j] = carro.valor === 'B' ? 'B' : 'v'
    }
  }

  return nuevoTablero
}


function backtracking(tablero, movimientos = 0) {
  const key = tableroAString(tablero)
  if (visitados.has(key)) return null
  visitados.add(key)

  
  let posB = null
  for (let i = 0; i < tablero.length; i++) {
    for (let j = 0; j < tablero[i].length; j++) {
      if (tablero[i][j] === 'B') { posB = { i, j }; break }
    }
    if (posB) break
  }

  if (!posB) return null

  
  if (posB.j + 1 < tablero[0].length && tablero[posB.i][posB.j + 1] === 'S') {
    return movimientos + 1
  }

  let maxMovimientos = -1
  let movimientoValido = false

  for (let i = 0; i < tablero.length; i++) {
    for (let j = 0; j < tablero[i].length; j++) {
      const carro = obtenerCarro(tablero, i, j)
      if (!carro) continue

      const direcciones = carro.orientacion === 'H' ? ['derecha', 'izquierda'] : ['abajo', 'arriba']

      for (const dir of direcciones) {
        if (puedeMover(tablero, carro, dir)) {
          const nuevoTablero = moverCarro(tablero, carro, dir)
          const resultado = backtracking(nuevoTablero, movimientos + 1)
          if (resultado !== null) {
            movimientoValido = true
            if (resultado > maxMovimientos) maxMovimientos = resultado
          }
        }
      }
    }
  }

  return movimientoValido ? maxMovimientos : null
}


function imprimirMatriz(tablero) {
  tablero.forEach(fila => console.log(fila.join(' ')))
}




insertarNodos() 
console.log("Tablero inicial:")
console.log(matriz) 

const totalMovimientos = backtracking(matriz)

if (totalMovimientos === null) {
  console.log("No hay solución")
} else {
  console.log("Cantidad de movimientos realizados por Backtracking:", totalMovimientos)
}