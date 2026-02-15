# Neon Pop - Projet Canvas L3 MIAGE

**Étudiant :** Aaron CABLING

## Description

Neon Pop est un jeu de réaction en chaîne développé. Le but est de déclencher une explosion pour détruire un nombre requis de billes et passer au niveau suivant.

## Fonctionnalités

- **Graphismes Néon** : Utilisation de l'API Canvas pour des effets de lueur (`shadowBlur`) et de transparence.
- **Moteur Physique** : Gestion des collisions (cercle-cercle) et des rebonds.
- **Système de Particules** : Effets visuels lors des explosions.
- **Système de Vies** : Le joueur dispose de 3 vies pour terminer les 5 niveaux.
- **Sauvegarde** : Le meilleur score est sauvegardé localement dans le localStorage (pour l'instant).

## Contrôles

- **Souris** : Cliquez n'importe où sur le canvas pour déclencher votre explosion initiale.

## Installation et lancement

1.  Cloner le dépôt.
2.  Ouvrir `frontend/games/neon-pop/index.html` dans un navigateur ou accéder directement au jeu via le déploiement Vercel : https://3-games-hub.vercel.app

## Utilisation de l'IA

Ce projet a été réalisé avec l'aide d'un assistant IA (Gemini/Antigravity) pour :

- **Documentation** : L'IA a été utilisée pour générer une documentation claire et complète du code.
- **Debugging** : Résolution de problèmes liés au déploiement Vercel et à la connexion MongoDB.
- **Visuel** : L'IA a été utilisée pour concevoir le style graphique et le thème "Néon" du jeu.

**Prompts notables :**

- _"J'ai fait un déploiement sur vercel mais quand je lance le jeu Neon pop rien ne s'affiche. Seulement le canva vide. Pourtant quand je lance moi même le backend et que je vais sur localhost port 5501 tout fonctionne. Sur le déploiement vercel à cette URI : https://3-games-hub.vercel.app/games/neon-pop/index.html. Dans la console il y a cett erreur : script.js:1 Uncaught ReferenceError: require is not defined at script.js:1:1. Explique moi pourquoi et corrige le problème"_
- _"Ajoute un thème neon futuriste au jeu dans le thème Neon Pop (couleurs flashy, background sombre et effets de lueur)"_
- _"Documente les classes JS du jeu Neon Pop"_
- _"pourquoi les utilisateurs qui sont créés se crées dans une DB "nommée test" puis collection users et pas dans la collection "users" située dans la DB nommée "3GUDB". Corrige le problème tout en m'expliquant pourquoi"_

## Difficultés rencontrées

J'ai rencontré des difficultés lors de la création du jeu notamment sur :

- La détection des collisions liées aux billes ET à l'explosion car j'avoue avoir eu du mal à bien comprendre le fonctionnement des collisions. J'ai donc bien relu le code que nous avons fait en classe et parfois demandé à l'IA de m'expliquer certains passages. 
- Le choix de certains design car je n'ai pas trop d'imagination pour les couleurs et les effets visuels, l'aspect graphique de manière générale (c'est pour cela que j'ai demandé à l'IA).

## Ce dont je suis fier

Cependant, je suis tout de même fier d'avoir réalisé mon premier jeu web avec du canvas. Je suis aussi fier d'avoir pu déployer le jeu sur Vercel et de pouvoir le montrer à mes pairs.