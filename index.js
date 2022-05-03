#!/usr/bin/env node

import listPokemons from './commands/listPokemons.js';

import { Command } from 'commander';
const cli = new Command();

cli
  .command('listPokemons')
  .description('query pokemons')
  .option('-p', 'pretty print output from the API')
  .argument('limit', 'limit')
  .argument('offset', 'offset')
  .action(listPokemons);

cli.parse(process.argv);
