

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

function crearMatriz(n, m) {
  const matriz = [];
  for (let i = 0; i < n; i++) {
    const fila = [];
    for (let j = 0; j < m; j++) {
      fila.push('.'); // valor por defecto
    }
    matriz.push(fila);
  }
  return matriz;
}

// Función para convertir un grafo a una matriz
function grafoAMatriz(grafo) {
  const matriz = [];
  for (let i = 0; i < grafo.filas; i++) {
    const fila = [];
    for (let j = 0; j < grafo.columnas; j++) {
      fila.push(grafo.getNodoValue(i, j).valor);
    }
    matriz.push(fila);
  }
  return matriz;
}


function imprimirMatriz(grafo) {
  const matriz = grafo.aMatriz();
  for (const fila of matriz) console.log(fila.join(' '));
  console.log('');
}

// Detectar todos los carros en el grafo, incluyendo B
//Esta funcion guarda todos los carros con las posiciones de todo su cuerpo, esto facilita a la hora de mover
// ya que como sabemos la posicion de todo el cuerpo, podemos vaciarlo (poner .) su posicion actual sin tener que recorrer cada rato
function obtenerTodosLosCarros(grafo) {
  const filas = grafo.filas, cols = grafo.columnas;
  const visitado = Array.from({ length: filas }, () => Array(cols).fill(false));
  const carros = [];

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < cols; j++) {
      if (visitado[i][j]) 
        continue;
      const v = grafo.getNodoValue(i, j).valor;
      if (v === '.' || v === 'S') { 
        visitado[i][j] = true; 
        continue; 
      }

      // Carro principal B
      if (v === 'B') {
        const arriba = i > 0 ? grafo.getNodoValue(i - 1, j).valor : null;
        
        
        const izquierda = j > 0 ? grafo.getNodoValue(i, j - 1).valor : null;

        //revisar las celdas arriba e izquierda para ver que orientacion tiene este carro
        let orientacion = 'H';
        if (arriba === '|') orientacion = 'V';
        if (izquierda === '-') orientacion = 'H';

        const posiciones = [];

        // si fuese horizontal, se recorre de cabeza hacia atras para ir guardando las posiciones de los cuerpos
        if (orientacion === 'H') {
          let col = j - 1;
          while (col >= 0 && grafo.getNodoValue(i, col).valor === '-') {
            posiciones.unshift({ i, j: col });
            visitado[i][col] = true;
            col--;
          }
          posiciones.push({ i, j });
        } else {
          //si fuese vertical, se recorre de abajo hacia arriba para guardar posiciones
          let fila = i - 1;
          while (fila >= 0 && grafo.getNodoValue(fila, j).valor === '|') {
            posiciones.unshift({ i: fila, j });
            visitado[fila][j] = true;
            fila--;
          }
          posiciones.push({ i, j });
        }

        for (const pos of posiciones) visitado[pos.i][pos.j] = true;

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
        // recorre de cabeza a izquierda para guardar las posiciones de los cuerpos del carro
        while (left >= 0 && grafo.getNodoValue(i, left).valor === '-') {
          posiciones.push({ i, j: left });
          visitado[i][left] = true;
          left--;
        }
        //como recorrimos de derehca a izq, invertimos para que sea de izq a derecha
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
        //recorre de cabeza hacia arriba buscando todo su cuerpo
        while (up >= 0 && grafo.getNodoValue(up, j).valor === '|') {
          posiciones.push({ i: up, j });
          visitado[up][j] = true;
          up--;
        }
        //invertimos las posiciones porque como recorrimos de abajo hacia arriba, ocupamos que esté de arriba hacia abajo
        posiciones.reverse();
        posiciones.push({ i, j });
        visitado[i][j] = true;
        carros.push({ valor: v, orientacion: 'V', posiciones });
        continue;
      }

      // Cuerpo horizontal sin cabeza, entonces vamos hacia la derecha hasta encontrar ya sea > o B
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

      // Cuerpo vertical sin cabeza, al igual que H, bajamos hasta encontrar V o B
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
// funcion para verificar de que el carro se pueda mover en la direccion correspondiente sin salirse del tablero y sin chocar con otros carros
function puedeMover(grafo, carro, direccion) {
  const filas = grafo.filas, cols = grafo.columnas;
  if (carro.orientacion === 'H') {
    // toma la cabeza del carro (B o >) y revisa si la celda siguiente es ., si hay un carro o si ya es fuera del tablero
    if (direccion === 'derecha') {
      const last = carro.posiciones[carro.posiciones.length - 1];
      const nuevoI = last.i, nuevoJ = last.j + 1;
      if (nuevoJ >= cols) return false;
      const valor = grafo.getNodoValue(nuevoI, nuevoJ).valor;
      return valor === '.' || (valor === 'S' && carro.valor === 'B');
    }
    //igual que la derecha pero se toma el primer cuerpo y revisa la celda anterior
    if (direccion === 'izquierda') {
      const first = carro.posiciones[0];
      const nuevoI = first.i, nuevoJ = first.j - 1;
      if (nuevoJ < 0) return false;
      return grafo.getNodoValue(nuevoI, nuevoJ).valor === '.';
    }
    // si no se puede, false
    return false;
  } else { // Vertical
    //se toma la cabeza (V) y revisa si es . la siguiente celda, un carro o fuera del tablero
    if (direccion === 'abajo') {
      const last = carro.posiciones[carro.posiciones.length - 1];
      const nuevoI = last.i + 1, nuevoJ = last.j;
      if (nuevoI >= filas) return false;
      const valor = grafo.getNodoValue(nuevoI, nuevoJ).valor;
      return valor === '.' || (valor === 'S' && carro.valor === 'B');
    }
    //igual que abajo pero toma el primer cuerpo y revisa la celda anterior
    if (direccion === 'arriba') {
      const first = carro.posiciones[0];
      const nuevoI = first.i - 1, nuevoJ = first.j;
      if (nuevoI < 0) return false;
      return grafo.getNodoValue(nuevoI, nuevoJ).valor === '.';
    }
    //si no se puede, false
    return false;
  }
}

function moverCarro(grafo, carro, direccion) {
  let nuevas = [];
  //dependiendo de la orientacion, se calcula las coordenadas para el movimiento que se va a realizar
  if (carro.orientacion === 'H') {
    if (direccion === 'derecha') nuevas = carro.posiciones.map(pos => ({ i: pos.i, j: pos.j + 1 }));
    else if (direccion === 'izquierda') nuevas = carro.posiciones.map(pos => ({ i: pos.i, j: pos.j - 1 }));
    else throw new Error('Dirección inválida para carro horizontal');
  } else {
    if (direccion === 'abajo') nuevas = carro.posiciones.map(pos => ({ i: pos.i + 1, j: pos.j }));
    else if (direccion === 'arriba') nuevas = carro.posiciones.map(pos => ({ i: pos.i - 1, j: pos.j }));
    else throw new Error('Dirección inválida para carro vertical');
  }

  // limpiar las celdas en donde está con .
  for (const pos of carro.posiciones)
    grafo.setNodoValue(pos.i, pos.j, '.');

  // crear el carro en la nueva posicion
  for (let k = 0; k < nuevas.length; k++) {
    const pos = nuevas[k];
    if (k === nuevas.length - 1) {
      if (carro.valor === 'B') grafo.setNodoValue(pos.i, pos.j, 'B');
      else if (carro.orientacion === 'H') grafo.setNodoValue(pos.i, pos.j, '>');
      else grafo.setNodoValue(pos.i, pos.j, 'v');
    } else {
      grafo.setNodoValue(pos.i, pos.j, carro.orientacion === 'H' ? '-' : '|');
    }
  }

  return { valor: carro.valor, orientacion: carro.orientacion, posiciones: nuevas };
}

// se crea un clon para que pueda explorar todos los estados sin destruir el estado anterior
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

  //serializamos el grafo de manera que se genere una llave, de esta manera, evitamos que se revise estados ya explorados
  const key = grafo.aMatriz().flat().join('');
  if (visitados.has(key)) return null;
  visitados.add(key);

  const carros = obtenerTodosLosCarros(grafo);
  const carrosB = carros.filter(c => c.valor === 'B');

  if (carrosB.length === 0) {
    console.log(`Todos los B salieron en ${movimientos} movimientos.`);
    imprimirMatriz(grafo);
    return movimientos;
  }

  let mejor = null;

  //itera cada carro determinando cada posible movimiento que puede realizar
  for (const carro of carros) {
    const dirs = carro.orientacion === 'H' ? ['izquierda','derecha'] : ['arriba','abajo'];
    for (const direccion of dirs) {
      if (!puedeMover(grafo, carro, direccion)) 
        continue;
      //clonamos el grafo antes de mover para evitar modificar el original y perder el estado anterior
      const grafoClonado = clonarGrafo(grafo);
      const carroMovido = moverCarro(grafoClonado, carro, direccion);

      // Revisar si B llegó a S
      if (carroMovido.valor === 'B') {
        const cabeza = carroMovido.posiciones[carroMovido.posiciones.length-1];
        if (grafoClonado.getNodoValue(cabeza.i, cabeza.j).valor === 'S' ||
            (cabeza.j+1 < grafoClonado.columnas && grafoClonado.getNodoValue(cabeza.i, cabeza.j+1).valor==='S') ||
            (cabeza.i+1 < grafoClonado.filas && grafoClonado.getNodoValue(cabeza.i+1, cabeza.j).valor==='S')) {
          // eliminar B del clon
          for (const pos of carroMovido.posiciones) grafoClonado.setNodoValue(pos.i, pos.j, '.');
          console.log(`B llegó a la salida en ${movimientos+1} movimientos.`);
        }
      }

      console.log(`Moviendo ${carro.valor} hacia ${direccion}:`); // CONSOLE DE PRINT 
      imprimirMatriz(grafoClonado);
      matriz = grafoAMatriz(grafoClonado);

      const r = backtracking(grafoClonado, movimientos+1, limite, visitados);
      if (r !== null && (mejor===null || r<mejor)) mejor = r;
    }
  }

  return mejor;
}

//funcion para verificar de que si es H, la siguiente posicion o anterior sea . , al igual que V, arriba y abajo sea .
function puedeColocar(grafo, i, j, orientacion, largo) {
  if (orientacion === 'H') {
    if (j + largo - 1 >= grafo.columnas) 
      return false;
    for (let x = 0; x < largo; x++) 
      if (grafo.getNodoValue(i,j+x).valor !== '.') 
        return false;
  } else {
    if (i + largo - 1 >= grafo.filas) 
      return false;
    for (let x = 0; x < largo; x++) 
      if (grafo.getNodoValue(i+x,j).valor !== '.') 
        return false;
  }
  return true;
}

function colocarCarroEnGrafo(grafo, i, j, orientacion, largo, esCarroB = false) {
  if (orientacion === 'H') {
    for (let k = 0; k < largo-1; k++) 
      grafo.setNodoValue(i,j+k,'-');
    grafo.setNodoValue(i,j+largo-1, esCarroB?'B':'>');
    return true;
  } else {
    for (let k = 0; k < largo-1; k++) 
      grafo.setNodoValue(i+k,j,'|');
    grafo.setNodoValue(i+largo-1,j, esCarroB?'B':'v');
    return true;
  }
}

//funcion para generar carros aleatorios en la matriz, recibiendo el grafo a insertar y la cantidad de carros
function generarCarrosAleatorios(grafo, numeroDeCarros, probB = 0.3) {
  const filas = grafo.filas;
  const cols = grafo.columnas;
  const maxIntentos = 2000;

  const libre = (i, j) =>
    i >= 0 && j >= 0 && i < filas && j < cols && grafo.getNodoValue(i, j).valor === '.';

  //se revisa de que un rango esté libre para colocar un carro de x largo
  function rangoLibre(i, j, orientacion, largo) {
    if (orientacion === 'H') {
      if (j + largo - 1 >= cols) return false;
      for (let k = 0; k < largo; k++) if (!libre(i, j + k)) return false;
      return true;
    } else {
      if (i + largo - 1 >= filas) return false;
      for (let k = 0; k < largo; k++) if (!libre(i + k, j)) return false;
      return true;
    }
  }

  function colocarCarroEnGrafo(i, j, orientacion, largo, esCarroB = false) {
    if (orientacion === 'H') {
      for (let k = 0; k < largo - 1; k++) grafo.setNodoValue(i, j + k, '-');
      grafo.setNodoValue(i, j + largo - 1, esCarroB ? 'B' : '>');
    } else {
      for (let k = 0; k < largo - 1; k++) grafo.setNodoValue(i + k, j, '|');
      grafo.setNodoValue(i + largo - 1, j, esCarroB ? 'B' : 'v');
    }
  }

  // limpiar tablero antes de generar carros, solo se llama una vez
  for (let i = 0; i < filas; i++)
    for (let j = 0; j < cols; j++)
      grafo.setNodoValue(i, j, '.');

  const posicionesS = new Set();

  // genera un carro B minimo
  let carrosBColocados = 0, intentos = 0;
  while (carrosBColocados < 1 && intentos < maxIntentos) {
    intentos++;
    //determinar de forma aleatoria si el carro B es horizontal o vertical, al igual su espacio
    const orientacion = Math.random() < 0.5 ? 'H' : 'V';
    const largo = 2 + Math.floor(Math.random() * 2);
    let i, j;


    if (orientacion === 'H') {
      i = Math.floor(Math.random() * filas);
      j = Math.floor(Math.random() * (cols - largo));
    } else {
      i = Math.floor(Math.random() * (filas - largo));
      j = Math.floor(Math.random() * cols);
    }

    if (!rangoLibre(i, j, orientacion, largo)) continue;

    // asegurar de que S esté en la misma direccion, xy del carro B
    let iDeS, jDeS;
    if (orientacion === 'H') {
      iDeS = i;
      jDeS = (Math.random() < 0.5) ? 0 : cols - 1;
      if (!libre(iDeS, jDeS)) continue;
    } else {
      jDeS = j;
      iDeS = (Math.random() < 0.5) ? 0 : filas - 1;
      if (!libre(iDeS, jDeS)) continue;
    }

    colocarCarroEnGrafo(i, j, orientacion, largo, true);
    grafo.setNodoValue(iDeS, jDeS, 'S');
    posicionesS.add(`${iDeS},${jDeS}`);
    carrosBColocados++;
  }

  if (carrosBColocados < 1) console.warn('No se pudo colocar B con S correctamente.');

  // colocamos los otros carros
  let colocados = 0;
  intentos = 0;
  while (colocados < numeroDeCarros && intentos < maxIntentos) {
    intentos++;

    const esCarroB = Math.random() < probB;
    const orientacion = Math.random() < 0.5 ? 'H' : 'V';
    const largo = 2 + Math.floor(Math.random() * 2);

    let i, j;
    if (orientacion === 'H') {
      i = Math.floor(Math.random() * filas);
      j = Math.floor(Math.random() * (cols - largo));
    } else {
      i = Math.floor(Math.random() * (filas - largo));
      j = Math.floor(Math.random() * cols);
    }

    // si no hay espacio libre para ingresar el carro, se descarta
    if (!rangoLibre(i, j, orientacion, largo)) 
      continue; // se sale del while

    if (esCarroB) {
      let iDeS, jDeS;
      if (orientacion === 'H') {
        iDeS = i;
        jDeS = (Math.random() < 0.5) ? 0 : cols - 1;
        if (!libre(iDeS, jDeS)) continue;
      } else {
        jDeS = j;
        iDeS = (Math.random() < 0.5) ? 0 : filas - 1;
        if (!libre(iDeS, jDeS)) continue;
      }

      colocarCarroEnGrafo(i, j, orientacion, largo, true);
      grafo.setNodoValue(iDeS, jDeS, 'S');
      posicionesS.add(`${iDeS},${jDeS}`);
      colocados++;
    } else {
      colocarCarroEnGrafo(i, j, orientacion, largo, false);
      colocados++;
    }
  }
}



const grafo = new Grafo(6,6);
let matriz = crearMatriz(6,6);
console.log('Tablero inicial:')
imprimirMatriz(grafo);
generarCarrosAleatorios(grafo,3);
console.log('Tablero con carros aleatorios:')
imprimirMatriz(grafo);

const total = backtracking(grafo);
console.log(total===null?'No hay solución':`Total de movimientos: ${total}`);
