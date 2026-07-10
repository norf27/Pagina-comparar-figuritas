//estructuras para leer cada una, son solo de guia
/*
let necesita1 = {seleccion: "", faltantes: []};
let necesita2 = {seleccion: "", faltantes: []};
let repetidas1 = {seleccion: "", repetidas: []};
let repetidas2 = {seleccion: "", repetidas: []};*/
//vars para agarrar nombres
let nombre1 = document.getElementById("nombre1");
let nombre2 = document.getElementById("nombre2");
//vars mostrar nombres
let mostrarNombre1 = document.getElementById("muestra1");
let mostrarNombre2 = document.getElementById("muestra2");
//vars para mostrar resultados
let resultado1 = document.getElementById("texto1");
let resultado2 = document.getElementById("texto2");
//vars para agarrar input de app
let input1 = document.getElementById("input1");
let input2 = document.getElementById("input2");

function leerInputs()
{
    //mostrar nombres
    mostrarNombre1.innerText = "A " + nombre1.value + " le sirven las siguientes que " + nombre2.value + " tiene repetidas";
    mostrarNombre2.innerText = "A " + nombre2.value + " le sirven las siguientes que " + nombre1.value + " tiene repetidas";
    //parsear el texto que ingresaron
    //parseo 1 es un vector donde en la pos 0 hay un vector con el formato de repetidas1 y en 1 hay faltantes
    let parseo1 = parsearTexto(input1.value);
    // usar para debug estos log, dios bendiga el que haya programado esta mierda que hace todo sola
    console.log("Repetidas del Input 1:", parseo1[0]);
    console.log("Faltantes del Input 1:", parseo1[1]);
    let parseo2 = parsearTexto(input2.value);
    console.log("Repetidas del Input 2:", parseo2[0]);
    console.log("Faltantes del Input 2:", parseo2[1]);
    //ahora a hacer la comparacion
    let necesitadasPor1 = buscarCambiables(parseo1[1], parseo2[0]);
    console.log("le sirven a 1 ", necesitadasPor1);
    let necesitadasPor2 = buscarCambiables(parseo2[1], parseo1[0]);
    console.log("le sirven a 2 ", necesitadasPor2);
    //escribir en el texto de cada caja
    resultado1.innerText = formatearATxt(necesitadasPor1);
    resultado2.innerText = formatearATxt(necesitadasPor2);
}

/*el formato es
texto al pedo
me faltan
lista de faltantes
repetidas
lista de repetidas
texto al pedo
*/
function parsearTexto(texto)
{
    //primero quedarme solo con desde lista de faltantes hasta el fin
    //dps agarrar solo lo que hay entre eso y antes de repetidas (las faltantes)
    const faltan = texto.split("Me faltan")[1].split("Repetidas")[0];
    //primero quedarme solo con todo hasta antes de descarga la app y eso
    //quedarme con la lista de repetidas
    const repetidas = texto.split("Descarga la app")[0].split("Repetidas")[1];

    //separar renglon por renglon todo lo de faltantes y al vector que eso genera
    //aplicarle a cada uno una limpieza de todos los espacios
    //despues sacar todas las lineas que queden vacias (no deberia pasar pero qsy)
    let lineaFaltantes = faltan.split("\n").map(linea => linea.trim()).filter(linea => linea.length > 0);

    //hacer lo mismo con repetidas
    let lineaRepetidas = repetidas.split("\n").map(linea => linea.trim()).filter(linea => linea.length > 0);

    //ahora generar las estructuras
    //para cada linea de lineaRepetidas hacemos un reduce
    //cortamos cada linea por los :
    //la primera parte va a seleccion y la segunda a el vector repetidas
    //reduce da una sola cosa a partir de todos los elementos del vector
    //por algun motivo en javascript se puede hacer un vector (dios bendiga no usar C)
    //hacer un vector donde agreguemos el desgloce de cada linea
    let estructuraRepetidas = lineaRepetidas.reduce((acumulador, actual) =>
    {
        const aux = actual.split(":"); 
        if(aux.length === 2) 
        {
            // IA: Expresión regular con bandera /u para soportar emojis regionales y banderas complejas sin romper el rango Unicode
            let seleccion = aux[0].replace(/\p{Regional_Indicator}{2}|\u{1F3F4}[\u{E0061}-\u{E007A}]{5}\u{E007F}/gu, '').trim();
            // IA
            let repetidas = aux[1].split(",").map(linea => linea.trim()); 
            acumulador.push({seleccion: seleccion, repetidas: repetidas}); 
            return acumulador; 
        }
    }, []);
    let estructuraFaltantes = lineaFaltantes.reduce((acumulador2, actual2) =>
    {
        const aux = actual2.split(":"); 
        if(aux.length === 2) 
        {
            // IA: Expresión regular con bandera /u para soportar emojis regionales y banderas complejas sin romper el rango Unicode
            let seleccion = aux[0].replace(/\p{Regional_Indicator}{2}|\u{1F3F4}[\u{E0061}-\u{E007A}]{5}\u{E007F}/gu, '').trim();
            // IA
            let faltantes = aux[1].split(",").map(linea => linea.trim()); 
            acumulador2.push({seleccion: seleccion, faltantes: faltantes}); 
            return acumulador2; 
        }
    }, []);
    //retorno los 2 vectores. [0] tiene repetidas, [1] tiene faltantes
    let retornado = [estructuraRepetidas, estructuraFaltantes];
    return retornado;
}
function buscarCambiables(necesitadas, repetidas)
{
    //hacer un filter de las repetidas por las que son necesitadas
    return repetidas.filter(leido =>
    //esta funcion tiene que retornar true si el pais de leido esta en necesitadas
    //y si hay algun numero que necesite del pais
    {
        let paisActual = leido.seleccion;
        let paisNecesitado = necesitadas.find(leidoNecesitado => {return leidoNecesitado.seleccion === paisActual});
        //ver si este pais esta en algun objeto del vector de necesitadas
        if(!paisNecesitado)
        {
            return false; //si no necesita nada de ese pais bajo todo el elemento de una
        }
        //si necesita del pais revisar cuales necesita (y si tiene alguna)
        //aca quedan solo 2 vectores de numeros (en realidad strings pero fue), no toda la estructura (se llama objeto aca)
        let nrosFaltantes = paisNecesitado.faltantes;
        let nrosRepetidos = leido.repetidas;
        //filtrar
        let intercambiables = nrosRepetidos.filter(act =>
        {
            //si el numero actual que se esta leeyendo esta incluido en los faltantes entonces dejarlo
            //sino sacarlo
            return nrosFaltantes.includes(act);
        });
        leido.repetidas = intercambiables;
        //si hay alguna que le sirva que tenga entonces que lo deje, sino que lo saque
        return intercambiables.length > 0;
    });
}
function formatearATxt(necesitada)
{
    if(necesitada.length === 0)
    {
        return "no hay nada que necesite";
    }
    //vector de las lineas convertidas a txt
    let lineas = necesitada.map(act =>
    {
        let pais = act.seleccion;
        let nros = act.repetidas.join(", ");
        return pais + ": " + nros;
    });
    return lineas.join("\n"); //devuelve todo como 1 string donde entre cada linea hay un \n
}