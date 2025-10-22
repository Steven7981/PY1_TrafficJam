

class Node {
  constructor(key, valor = '.') {
    this.key = key;
    this.valor = valor;
    this.hijos = new Set();
    this.padres = new Set();
  }

  agregarHijo(hijo) {
    this.hijos.add(hijo);
    hijo.padres.add(this);
  }
}

class Grafo {
  constructor(filas, columnas) {
    this.filas = filas;
    this.columnas = columnas;
    this.nodos = new Map();
    this.crearTablero();
  }

  crearTablero() {
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        const key = `${i},${j}`;
        this.agregarNodo(key);
      }
    }
  }

  agregarNodo(key, valor = '.') {
    if (!this.nodos.has(key)) {
      this.nodos.set(key, new Node(key, valor));
    }
    return this.nodos.get(key);
  }

  getNodoValue(i, j) {
    return this.nodos.get(`${i},${j}`);
  }

  setNodoValue(i, j, valor) {
    this.nodos.get(`${i},${j}`).valor = valor;
  }

  aMatriz() {
    const matriz = [];
    for (let i = 0; i < this.filas; i++) {
      const fila = [];
      for (let j = 0; j < this.columnas; j++) {
        fila.push(this.getNodoValue(i, j).valor);
      }
      matriz.push(fila);
    }
    return matriz;
  }
}



function imprimirMatriz(grafo) {
  const matriz = grafo.aMatriz();
  for (const fila of matriz) console.log(fila.join(' '));
  console.log('');
}

// Detectar todos los carros en el grafo, incluyendo B
function obtenerTodosLosCarros(grafo) {
  const filas = grafo.filas, cols = grafo.columnas;
  const visitado = Array.from({ length: filas }, () => Array(cols).fill(false));
  const carros = [];

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < cols; j++) {
      if (visitado[i][j]) continue;
      const v = grafo.getNodoValue(i, j).valor;
      if (v === '.' || v === 'S') { 
        visitado[i][j] = true; 
        continue; 
      }

      // Carro principal B
      if (v === 'B') {
        const arriba = i > 0 ? grafo.getNodoValue(i - 1, j).valor : null;
        const abajo = i < filas - 1 ? grafo.getNodoValue(i + 1, j).valor : null;
        const izquierda = j > 0 ? grafo.getNodoValue(i, j - 1).valor : null;
        const derecha = j < cols - 1 ? grafo.getNodoValue(i, j + 1).valor : null;

        let orientacion = 'H';
        if (arriba === '|' || abajo === '|') orientacion = 'V';
        if (izquierda === '-' || derecha === '-') orientacion = 'H';

        const posiciones = [];
        if (orientacion === 'H') {
          let col = j - 1;
          while (col >= 0 && grafo.getNodoValue(i, col).valor === '-') {
            posiciones.unshift({ i, j: col });
            visitado[i][col] = true;
            col--;
          }
          posiciones.push({ i, j });
        } else {
          let fila = i - 1;
          while (fila >= 0 && grafo.getNodoValue(fila, j).valor === '|') {
            posiciones.unshift({ i: fila, j });
            visitado[fila][j] = true;
            fila--;
          }
          posiciones.push({ i, j });
        }

        for (const p of posiciones) visitado[p.i][p.j] = true;

        carros.push({
          valor: 'B',
          orientacion,
          posiciones
        });
        continue;
      }

      // Cabeza horizontal >
      if (v === '>') {
        let left = j - 1;
        const posiciones = [];
        while (left >= 0 && grafo.getNodoValue(i, left).valor === '-') {
          posiciones.push({ i, j: left });
          visitado[i][left] = true;
          left--;
        }
        posiciones.reverse();
        posiciones.push({ i, j });
        visitado[i][j] = true;
        carros.push({ valor: v, orientacion: 'H', posiciones });
        continue;
      }

      // Cabeza vertical v
      if (v === 'v') {
        let up = i - 1;
        const posiciones = [];
        while (up >= 0 && grafo.getNodoValue(up, j).valor === '|') {
          posiciones.push({ i: up, j });
          visitado[up][j] = true;
          up--;
        }
        posiciones.reverse();
        posiciones.push({ i, j });
        visitado[i][j] = true;
        carros.push({ valor: v, orientacion: 'V', posiciones });
        continue;
      }

      // Cuerpo horizontal sin cabeza
      if (v === '-') {
        let col = j;
        const cuerpos = [];
        while (col < cols && grafo.getNodoValue(i, col).valor === '-') {
          cuerpos.push({ i, j: col });
          visitado[i][col] = true;
          col++;
        }
        if (col < cols) {
          const head = grafo.getNodoValue(i, col).valor;
          if (head === '>' || head === 'B') {
            const posiciones = [...cuerpos, { i, j: col }];
            visitado[i][col] = true;
            carros.push({ valor: head, orientacion: 'H', posiciones });
            continue;
          }
        }
        continue;
      }

      // Cuerpo vertical sin cabeza
      if (v === '|') {
        let fila = i;
        const cuerpos = [];
        while (fila < filas && grafo.getNodoValue(fila, j).valor === '|') {
          cuerpos.push({ i: fila, j });
          visitado[fila][j] = true;
          fila++;
        }
        if (fila < filas) {
          const head = grafo.getNodoValue(fila, j).valor;
          if (head === 'v' || head === 'B') {
            const posiciones = [...cuerpos, { i: fila, j }];
            visitado[fila][j] = true;
            carros.push({ valor: head, orientacion: 'V', posiciones });
            continue;
          }
        }
        continue;
      }

      visitado[i][j] = true;
    }
  }

  for (const c of carros) {
    if (c.orientacion === 'H') c.posiciones.sort((a,b) => a.j - b.j);
    else c.posiciones.sort((a,b) => a.i - b.i);
  }

  return carros;
}

function puedeMover(grafo, carro, dir) {
  const filas = grafo.filas, cols = grafo.columnas;
  if (carro.orientacion === 'H') {
    if (dir === 'derecha') {
      const last = carro.posiciones[carro.posiciones.length - 1];
      const ni = last.i, nj = last.j + 1;
      if (nj >= cols) return false;
      const val = grafo.getNodoValue(ni, nj).valor;
      return val === '.' || (val === 'S' && carro.valor === 'B');
    }
    if (dir === 'izquierda') {
      const first = carro.posiciones[0];
      const ni = first.i, nj = first.j - 1;
      if (nj < 0) return false;
      return grafo.getNodoValue(ni, nj).valor === '.';
    }
    return false;
  } else { // Vertical
    if (dir === 'abajo') {
      const last = carro.posiciones[carro.posiciones.length - 1];
      const ni = last.i + 1, nj = last.j;
      if (ni >= filas) return false;
      const val = grafo.getNodoValue(ni, nj).valor;
      return val === '.' || (val === 'S' && carro.valor === 'B');
    }
    if (dir === 'arriba') {
      const first = carro.posiciones[0];
      const ni = first.i - 1, nj = first.j;
      if (ni < 0) return false;
      return grafo.getNodoValue(ni, nj).valor === '.';
    }
    return false;
  }
}

function moverCarro(grafo, carro, dir) {
  let nuevas = [];
  if (carro.orientacion === 'H') {
    if (dir === 'derecha') nuevas = carro.posiciones.map(p => ({ i: p.i, j: p.j + 1 }));
    else if (dir === 'izquierda') nuevas = carro.posiciones.map(p => ({ i: p.i, j: p.j - 1 }));
    else throw new Error('Dirección inválida para carro horizontal');
  } else {
    if (dir === 'abajo') nuevas = carro.posiciones.map(p => ({ i: p.i + 1, j: p.j }));
    else if (dir === 'arriba') nuevas = carro.posiciones.map(p => ({ i: p.i - 1, j: p.j }));
    else throw new Error('Dirección inválida para carro vertical');
  }

  // limpiar posiciones antiguas
  for (const p of carro.posiciones)
    grafo.setNodoValue(p.i, p.j, '.');

  for (let k = 0; k < nuevas.length; k++) {
    const p = nuevas[k];
    if (k === nuevas.length - 1) {
      if (carro.valor === 'B') grafo.setNodoValue(p.i, p.j, 'B');
      else if (carro.orientacion === 'H') grafo.setNodoValue(p.i, p.j, '>');
      else grafo.setNodoValue(p.i, p.j, 'v');
    } else {
      grafo.setNodoValue(p.i, p.j, carro.orientacion === 'H' ? '-' : '|');
    }
  }

  return { valor: carro.valor, orientacion: carro.orientacion, posiciones: nuevas };
}

function clonarGrafo(grafo) {
  const nuevo = new Grafo(grafo.filas, grafo.columnas);
  for (let i = 0; i < grafo.filas; i++) {
    for (let j = 0; j < grafo.columnas; j++) {
      nuevo.setNodoValue(i, j, grafo.getNodoValue(i,j).valor);
    }
  }
  return nuevo;
}

function backtracking(grafo, movimientos = 0, limite = 2000, visitados = new Set()) {
  if (movimientos > limite) return null;

  const key = grafo.aMatriz().flat().join('');
  if (visitados.has(key)) return null;
  visitados.add(key);

  const carros = obtenerTodosLosCarros(grafo);
  const bCarros = carros.filter(c => c.valor === 'B');

  if (bCarros.length === 0) {
    console.log(`Todos los B salieron en ${movimientos} movimientos.`);
    imprimirMatriz(grafo);
    return movimientos;
  }

  let mejor = null;

  for (const carro of carros) {
    const dirs = carro.orientacion === 'H' ? ['izquierda','derecha'] : ['arriba','abajo'];
    for (const dir of dirs) {
      if (!puedeMover(grafo, carro, dir)) continue;

      const grafoClonado = clonarGrafo(grafo);
      const carroMovido = moverCarro(grafoClonado, carro, dir);

      // Revisar si B llegó a S
      if (carroMovido.valor === 'B') {
        const cabeza = carroMovido.posiciones[carroMovido.posiciones.length-1];
        if (grafoClonado.getNodoValue(cabeza.i, cabeza.j).valor === 'S' ||
            (cabeza.j+1 < grafoClonado.columnas && grafoClonado.getNodoValue(cabeza.i, cabeza.j+1).valor==='S') ||
            (cabeza.i+1 < grafoClonado.filas && grafoClonado.getNodoValue(cabeza.i+1, cabeza.j).valor==='S')) {
          // eliminar B del clon
          for (const p of carroMovido.posiciones) grafoClonado.setNodoValue(p.i, p.j, '.');
          console.log(`B llegó a la salida en ${movimientos+1} movimientos.`);
        }
      }

      console.log(`Moviendo ${carro.valor} hacia ${dir}:`); // CONSOLE DE PRINT
      imprimirMatriz(grafoClonado);
      console.log('-------------------');

      const r = backtracking(grafoClonado, movimientos+1, limite, visitados);
      if (r !== null && (mejor===null || r<mejor)) mejor = r;
    }
  }

  return mejor;
}

function puedeColocar(grafo, i, j, orientacion, largo) {
  if (orientacion === 'H') {
    if (j + largo - 1 >= grafo.columnas) return false;
    for (let x = 0; x < largo; x++) if (grafo.getNodoValue(i,j+x).valor !== '.') return false;
  } else {
    if (i + largo - 1 >= grafo.filas) return false;
    for (let x = 0; x < largo; x++) if (grafo.getNodoValue(i+x,j).valor !== '.') return false;
  }
  return true;
}

function colocarCarroEnGrafo(grafo, i, j, orientacion, largo, esB = false) {
  if (orientacion === 'H') {
    for (let k = 0; k < largo-1; k++) grafo.setNodoValue(i,j+k,'-');
    grafo.setNodoValue(i,j+largo-1, esB?'B':'>');
    return true;
  } else {
    for (let k = 0; k < largo-1; k++) grafo.setNodoValue(i+k,j,'|');
    grafo.setNodoValue(i+largo-1,j, esB?'B':'v');
    return true;
  }
}

function generarCarrosAleatorios(grafo, numCarros, probB = 0.3) {
  const filas = grafo.filas;
  const columnas = grafo.columnas;

  let colocados = 0;
  let intentos = 0;
  const maxIntentos = 2000;

  while (colocados < numCarros && intentos < maxIntentos) {
    intentos++;

    // Decidir si este carro será B
    const esB = Math.random() < probB;
    const orient = Math.random() < 0.5 ? 'H' : 'V';
    const largo = 2 + Math.floor(Math.random() * 2); // 2 o 3 celdas

    let i, j;
    if (orient === 'H') {
      i = Math.floor(Math.random() * filas);
      j = Math.floor(Math.random() * (columnas - (largo - 1)));
    } else {
      i = Math.floor(Math.random() * (filas - (largo - 1)));
      j = Math.floor(Math.random() * columnas);
    }

    // Verificar si se puede colocar
    if (!puedeColocar(grafo, i, j, orient, largo)) continue;

    if (esB) {
      // Colocar carro B
      colocarCarroEnGrafo(grafo, i, j, orient, largo, true);

      // Colocar salida S en el borde correspondiente
      if (orient === 'H') {
        const borde = Math.random() < 0.5 ? 0 : columnas - 1;
        grafo.setNodoValue(i, borde, 'S');
      } else {
        const borde = Math.random() < 0.5 ? 0 : filas - 1;
        grafo.setNodoValue(borde, j, 'S');
      }
    } else {
      // Colocar carro normal
      colocarCarroEnGrafo(grafo, i, j, orient, largo, false);
    }

    colocados++;
  }

}



const grafo = new Grafo(6,6);
console.log('Tablero inicial:')
imprimirMatriz(grafo);
generarCarrosAleatorios(grafo,3);
console.log('Tablero con carros aleatorios:')
imprimirMatriz(grafo);

const total = backtracking(grafo);
console.log(total===null?'No hay solución':`Total de movimientos: ${total}`);
