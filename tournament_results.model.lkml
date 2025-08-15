# tournament_results.model.lkml

# The name of your database connection in Looker.
connection: "your-google-sheets-connection-name"

# Define the "explore" for your users.
# This is the starting point for analysis in Looker's UI.
explore: tournament_results {
  # Add the view you created.
  # The view name is based on the file name `tournament_results.view.lkml`.
  join: players {
    type: left_outer
    sql_on: ${tournament_results.player} = ${players.player}
    relationship: one_to_many
  }
}