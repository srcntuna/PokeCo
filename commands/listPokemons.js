import fetch from 'node-fetch';
import fs from 'fs';

export default function queryPokemons(limit, offset) {
  const startTime = Date.now();

  const startId = offset + 1;
  const endId = offset + limit;

  let position = startId + ',' + endId;

  const cacheJSON = fs.readFileSync('./cache.json');
  const cache = JSON.parse(cacheJSON);

  if (cache[position]) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(cache[position] + ' ' + 'time: ' + duration);
    return cache[position];
  }

  let totalPokemons = endId - startId + 1;

  let totalWeight = 0;
  let totalHeight = 0;

  const fetchPokeData = async (url) => {
    const info = await fetch(url);
    const response = await info.json();
    return {
      id: response.id,
      weight: response.weight,
      height: response.height,
    };
  };

  const apiRequestLoop = async () => {
    let promiseArray = [];
    for (let id = startId; id <= endId; id++) {
      let exactUrl = 'https://pokeapi.co/api/v2/pokemon/' + id;

      if (cache[id]) {
        totalWeight += cache[id].weight;
        totalHeight += cache[id].height;
        continue;
      }

      const result = await fetchPokeData(exactUrl);
      promiseArray.push(result);
    }
    return Promise.all(promiseArray);
  };

  apiRequestLoop().then((response) => {
    response.forEach((pokemon) => {
      cache[pokemon.id] = { weight: pokemon.weight, height: pokemon.height };
      totalWeight += pokemon.weight;
      totalHeight += pokemon.height;
    });

    const avgWeight = Math.round(totalWeight / totalPokemons);
    const avgHeight = Math.round(totalHeight / totalPokemons);

    const endTime = Date.now();

    const printOut =
      'avgWeight: ' + avgWeight + ' ' + 'avgHeight: ' + avgHeight;

    const newData = {
      [position]: printOut,
    };

    const newCache = { ...cache, ...newData };

    fs.writeFileSync('./cache.json', JSON.stringify(newCache), {}, (err) => {
      if (err) throw err;

      console.log('new data added to cache');
    });

    const duration = endTime - startTime;

    console.log(printOut + ' ' + 'time: ' + duration);
    return printOut;
  });
}
