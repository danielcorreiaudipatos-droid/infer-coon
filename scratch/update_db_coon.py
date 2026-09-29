import sqlite3

conn = sqlite3.connect('backend/infercoon_auth.db')
cursor = conn.cursor()

cursor.execute("UPDATE csuite_board_messages SET speaker_role = REPLACE(speaker_role, 'Co.on', 'Coon');")
cursor.execute("UPDATE csuite_board_messages SET message = REPLACE(message, 'Co.on', 'Coon');")
cursor.execute("UPDATE csuite_board_messages SET action_payload = REPLACE(action_payload, 'Co.on', 'Coon');")

cursor.execute("UPDATE weekly_production_meetings SET title = REPLACE(title, 'Co.on', 'Coon');")
cursor.execute("UPDATE weekly_production_meetings SET agenda_topics = REPLACE(agenda_topics, 'Co.on', 'Coon');")
cursor.execute("UPDATE weekly_production_meetings SET production_report = REPLACE(production_report, 'Co.on', 'Coon');")

cursor.execute("UPDATE falecom_messages SET subject = REPLACE(subject, 'Co.on', 'Coon');")
cursor.execute("UPDATE bot_conversations SET bot_response = REPLACE(bot_response, 'Co.on', 'Coon');")
cursor.execute("UPDATE bot_tickets SET client_name = REPLACE(client_name, 'Co.on', 'Coon');")
cursor.execute("UPDATE financial_app_renewals SET notes = REPLACE(notes, 'Co.on', 'Coon');")
cursor.execute("UPDATE executive_weekly_memorandums SET content_markdown = REPLACE(content_markdown, 'Co.on', 'Coon');")

conn.commit()
print("Updated all tables in backend/infercoon_auth.db successfully!")
conn.close()
