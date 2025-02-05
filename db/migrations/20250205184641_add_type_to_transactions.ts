import type { Knex } from 'knex'

export async function up(knex: Knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.string('type').notNullable().defaultTo('credit') // ✅ Adiciona a coluna `type`
  })
}

export async function down(knex: Knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('type') // 🔄 Remove a coluna caso a migração seja revertida
  })
}
