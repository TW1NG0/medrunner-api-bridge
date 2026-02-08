@echo off
:: Startet ein neues Terminal-Fenster im aktuellen Ordner und führt npm start aus
start "" cmd /k "cd /d %~dp0 && npm start"

:: Schließt dieses (das ursprüngliche) Batch-Fenster sofort
exit