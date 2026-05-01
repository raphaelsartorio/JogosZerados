import Dexie from 'dexie'
import { secondsToDuration } from '../utils/gameHelpers'

export const db = new Dexie('jogos-zerados-db')

db.version(1).stores({
  games: 'id, name, slug, platform, genre, year, score, difficulty, completedAt',
  meta: 'key',
})

db.version(2)
  .stores({
    games: 'id, nome, console, genero, tipo, dataZerado, nota, dificuldade, platinado, *tags',
    top10: 'id, posicao, jogoId',
    statsAno: 'id, ano, jogoDoAnoId',
    meta: 'key',
  })
  .upgrade(async (transaction) => {
    await transaction
      .table('games')
      .toCollection()
      .modify((game) => {
        if (game.nome) {
          return
        }

        game.nome = game.name || ''
        game.console = game.platform || ''
        game.genero = game.genre || ''
        game.tipo = game.type || ''
        game.dataZerado = game.completedAt || ''
        game.tempo = game.playtimeHours
          ? secondsToDuration(Math.round(Number(game.playtimeHours || 0) * 3600))
          : '00:00:00'
        game.nota = game.score ?? 0
        game.dificuldade = game.difficulty || ''
        game.tags = []
        game.platinado = Boolean(game.flags?.platinum)
        delete game.name
        delete game.platform
        delete game.genre
        delete game.type
        delete game.completedAt
        delete game.playtimeHours
        delete game.score
        delete game.difficulty
        delete game.flags
        delete game.slug
        delete game.year
        delete game.completionCondition
        delete game.raw
        delete game.createdAt
        delete game.updatedAt
      })
  })

db.version(3)
  .stores({
    games: 'id, nome, console, genero, tipo, dataZerado, nota, dificuldade, platinado, *tags',
    top10: 'id, posicao, jogoId',
    statsAno: 'id, ano, jogoDoAnoId',
    meta: 'key',
  })
  .upgrade(async (transaction) => {
    await transaction
      .table('statsAno')
      .toCollection()
      .modify((item) => {
        if (item.capaUrl == null) {
          item.capaUrl = ''
        }
      })
  })
