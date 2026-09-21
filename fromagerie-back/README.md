# Backend Fromagerie

## Schéma PostgreSQL

Le schéma est géré par Flyway. Sur une base **vide**, Flyway applique
`src/main/resources/db/migration/V1__initial_schema.sql` avant que Hibernate
ne vérifie la correspondance des entités (`ddl-auto=validate`). Aucun runner Java
ne modifie désormais le schéma au démarrage.

Pour une modification future, ajouter un nouveau script `V2__description.sql`,
`V3__description.sql`, etc. Ne pas modifier une version déjà appliquée : Flyway
vérifie son historique et ses checksums. Tester chaque script sur une copie de
la base avant de l'appliquer à une base contenant des données à conserver.

La base locale `fromagerie_db` existante a été adoptée à la version 1 après
comparaison de son schéma avec V1. Une sauvegarde préalable est conservée dans
`fromagerie-back/.vscode/fromagerie_dev_before_flyway.dump` (ignorée par Git).
Cette adoption **ne doit pas être répétée** sur une autre base sans comparaison
préalable de son schéma. `baseline-on-migrate=false` reste la valeur normale.

## Démarrage

Prérequis : JDK 25, PostgreSQL et une base accessible par l'utilisateur choisi.
Par défaut, le profil `dev` utilise
`jdbc:postgresql://localhost:5432/fromagerie_db` avec l'utilisateur
`fromagerie_user`. Adapter `DB_URL` et `DB_USERNAME` si votre installation est
différente. L'utilisateur PostgreSQL doit pouvoir créer des objets dans le
schéma cible sur une base vide, afin que Flyway applique V1.

Le profil `dev` doit être choisi explicitement. Fournir `DB_PASSWORD`,
`DEMO_OWNER_PASSWORD`, `DEMO_EMPLOYEE_PIN` et `DEMO_SALES_PIN` dans
l'environnement du processus. Les deux PIN de démonstration doivent comporter
quatre chiffres. Ne jamais enregistrer ces valeurs dans un fichier suivi par
Git. Le profil `prod` requiert `DB_URL`, `DB_USERNAME` et `DB_PASSWORD`.

Dans VS Code, la configuration de lancement à la racine du projet lit ces
variables depuis `fromagerie-back/.vscode/demo.env`, ignoré par Git. Ce fichier
est utilisé par le lancement VS Code, **pas automatiquement** par la commande
Maven ci-dessous ; pour celle-ci, fournir les variables dans le terminal.

Depuis `fromagerie-back` :

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
./mvnw test
```

Le backend écoute sur `127.0.0.1:8080` par défaut. L'interface se lance
séparément depuis `fromagerie/` ; voir [son README](../fromagerie/README.md).

Les comptes de démonstration sont créés seulement s'ils n'existent pas déjà.
Changer une variable dans `demo.env` ne change donc pas le mot de passe ou PIN
d'un compte déjà présent en base. Il faut mettre à jour ce compte explicitement
ou repartir d'une base de développement recréable.

La majorité des tests Java utilise H2 avec Flyway désactivé pour leur isolation.
`PostgresMigrationTests` démarre au contraire un conteneur PostgreSQL vierge :
Flyway y applique V1, puis le démarrage Spring vérifie le schéma avec Hibernate
`validate`. Ce test s'exécute pendant `./mvnw test` quand Docker est accessible ;
il est ignoré localement sinon. Le workflow CI vérifie d'abord Docker, puis
exécute la suite complète. Le test ne touche jamais à `fromagerie_db`.
