# Raccourci pour récupérer la version directement depuis le manifest.json
VERSION := $(shell grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)
ZIP_NAME := LinkPost-v$(VERSION).zip

# Fichiers et dossiers à inclure dans l'archive Chrome Store
FILES := manifest.json content.js popup.html popup.js popup.css icons

.PHONY: build clean

# Commande par défaut : nettoie puis build
all: build

build: clean
	@echo "📦 Création de l'archive $(ZIP_NAME)..."
	@zip -r $(ZIP_NAME) $(FILES) -x "*.DS_Store*"
	@echo "✅ Archive prête : $(ZIP_NAME)"

clean:
	@echo "🧹 Nettoyage des anciennes archives..."
	@rm -f LinkPost-v*.zip
