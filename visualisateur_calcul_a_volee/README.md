# Visualisateur calculs à la volée



## Table des matières

- 🪧 [À propos](#à-propos)
- 📦 [Prérequis](#pré-requis)
- 🚀 [Installation](#installation)
- 🛠️ [Utilisation](#utilisation)
- 🤝 [Contribution](#contribution)
- 📚 [Documentation](#documentation)
- 🏷️ [Gestion des versions](#gestion-des-versions)
- 📝 [Licence](#licence)


## À propos
Ce dépôt présente un aperçu du rendu et fonctionnement de la fonction "Calcul à la volée" de la plateforme AE, à l'échelle d'une exploitation.

## Pré-requis
- NPM: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- pg_featureserv:https://github.com/CrunchyData/pg_featureserv
- Accès à la BDD

## Installation
[Étapes des commandes à lancer pour installer le projet en local]
1. Clone the repository
   ```sh
   git clone https://github.com/solagro/PourMakina_webAE.git
   ```

2. Open folder
    ```sh
    cd visualisateur_calcul_a_volee
    ```
3. Install packages
   ```sh
   npm install
   ```

## Utilisation
>[!CAUTION]
> Pg_featurserv doit être lancé.

1. Renseigner les paramètres de connexion à la BDD dans le fichier de configuration de Pg_featureserv ```pg_featureserv.toml```
```
DbConnection = "postgresql://username:password@host:port/dbname"
```
2. Lancer pg_featureserv

3. Lancer le script
```sh
npm start
```
La page s'affiche ici : http://127.0.0.1:5173/

4. Glisser/Déposer un dossier ZIP contenant le fichier PAC d'une exploitation sous format SHP.

## Contribution
Solagro

## Documentation


## Gestion des versions


## Licence
