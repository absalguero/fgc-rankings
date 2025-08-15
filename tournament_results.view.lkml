view: tournament_results {
  # This should be the name of your connected Google Sheet table
  sql_table_name: "your-google-sheet-table-name" 

  dimension: player {
    type: string
    sql: ${TABLE}.Player
  }

  dimension: main_character {
    type: string
    sql: ${TABLE}."Main Character"
  }

  dimension: region {
    type: string
    sql: ${TABLE}.Region
  }

  dimension: rank {
    type: number
    sql: ${TABLE}.Rank
  }

  measure: total_points {
    type: sum
    sql: ${TABLE}.Points
  }

  measure: player_count {
    type: count
    drill_fields: [player]
  }
}