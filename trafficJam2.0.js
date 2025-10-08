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

    //conectar todos los nodos con sus respectivos hijos
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        const key = `${i},${j}`
        const nodo = this.nodos.get(key)

        // Conectar con la derecha
        if (j + 1 < this.columnas) {
          const derecha = this.nodos.get(`${i},${j + 1}`)
          nodo.agregarHijo(derecha)
        }

        // Conectar con abajo
        if (i + 1 < this.filas) {
          const abajo = this.nodos.get(`${i + 1},${j}`)
          nodo.agregarHijo(abajo)
        }
      }
    }
  }

  agregarNodo(key, valor = null) {
    if (!this.nodos.has(key)) {
      this.nodos.set(key, new Node(key, valor))
    }
    return this.nodos.get(key)
  }

  print() {
    for (const nodo of this.nodos.values()) {
      const hijosKeys = [...nodo.hijos].map(h => h.key)
      console.log(`${nodo.key} -> [${hijosKeys.join(', ')}]`)
    }
  }
}

// tablero 3x3
let tamano = 3
const grafo = new Grafo(tamano,tamano)
grafo.print()
