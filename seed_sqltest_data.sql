BEGIN;

DO $seed$
DECLARE
    v_owner bigint;
    v_worker bigint;
    v_sales bigint;
    v_test_user bigint;
    v_cheese bigint;
    v_milk bigint;
    v_rennet bigint;
    v_salt bigint;
    v_culture bigint;
    v_recipe bigint;
    v_pack bigint;
    v_equipment bigint;
    v_cave bigint;
    v_shelf bigint;
    v_row1 bigint;
    v_row2 bigint;
    v_location bigint;
    v_client bigint;
    v_fab bigint;
    v_lot bigint;
    v_stock bigint;
    v_order bigint;
    v_line bigint;
    v_delivery bigint;
    v_reservation bigint;
    v_fabs bigint[] := ARRAY[]::bigint[];
    v_lots bigint[] := ARRAY[]::bigint[];
    v_stocks bigint[] := ARRAY[]::bigint[];
    v_dates timestamp[] := ARRAY[
        '2025-05-12 06:30', '2025-05-26 06:30', '2025-06-09 06:30',
        '2025-06-23 06:30', '2025-07-07 06:30', '2025-07-21 06:30',
        '2025-11-10 06:30', '2025-11-24 06:30', '2025-12-08 06:30',
        '2026-01-12 06:30', '2026-02-09 06:30', '2026-03-09 06:30'
    ];
    i integer;
BEGIN
    IF EXISTS (SELECT 1 FROM fromage WHERE nom = 'SQLTEST Raclette') THEN
        RAISE EXCEPTION 'Le jeu SQLTEST existe déjà; aucune donnée n''a été ajoutée.';
    END IF;

    SELECT id INTO v_owner FROM utilisateurs WHERE username = 'gilles.demo';
    SELECT id INTO v_worker FROM utilisateurs WHERE username = 'jean.demo';
    SELECT id INTO v_sales FROM utilisateurs WHERE username = 'nathalie.demo';
    IF v_owner IS NULL OR v_worker IS NULL OR v_sales IS NULL THEN
        RAISE EXCEPTION 'Les comptes de démonstration requis sont absents.';
    END IF;

    INSERT INTO utilisateurs (username, nom, credential_hash, role, actif)
    SELECT 'sqltest.audit', 'SQLTEST Audit', credential_hash, 'PROPRIETAIRE', true
    FROM utilisateurs WHERE id = v_owner
    RETURNING id INTO v_test_user;

    INSERT INTO fromage (nom, description)
    VALUES ('SQLTEST Raclette', 'Fromage de test SQL couvrant fabrication, affinage, stock et vente.')
    RETURNING id INTO v_cheese;

    INSERT INTO matiere_premiere (nom, unite_reference, cout_unitaire, actif)
    VALUES ('SQLTEST Lait cru', 'L', 0.82, true) RETURNING id INTO v_milk;
    INSERT INTO matiere_premiere (nom, unite_reference, cout_unitaire, actif)
    VALUES ('SQLTEST Presure', 'ML', 0.14, true) RETURNING id INTO v_rennet;
    INSERT INTO matiere_premiere (nom, unite_reference, cout_unitaire, actif)
    VALUES ('SQLTEST Sel', 'KG', 1.90, true) RETURNING id INTO v_salt;
    INSERT INTO matiere_premiere (nom, unite_reference, cout_unitaire, actif)
    VALUES ('SQLTEST Ferments', 'G', 0.33, true) RETURNING id INTO v_culture;

    INSERT INTO recette
        (nom, fromage_id, active, cout_matiere_estime, date_creation, numero_version,
         variante_key, frequence_retournement_jours, quantite_lait_reference)
    VALUES
        ('SQLTEST Raclette classique', v_cheese, true, 96.40, '2025-01-02 09:00', 1,
         'sqltest-raclette-classique', 3, 100)
    RETURNING id INTO v_recipe;

    INSERT INTO recette_ingredient
        (recette_id, matiere_premiere_id, quantite, unite, cout_unitaire_reference)
    VALUES
        (v_recipe, v_milk, 100, 'L', 0.82),
        (v_recipe, v_rennet, 25, 'ML', 0.14),
        (v_recipe, v_salt, 2.50, 'KG', 1.90),
        (v_recipe, v_culture, 18, 'G', 0.33);

    INSERT INTO emballage (nom, cout_unitaire, unite, actif)
    VALUES ('SQLTEST Papier thermoscellable', 0.38, 'feuille', true)
    RETURNING id INTO v_pack;
    INSERT INTO configuration_emballage (fromage_id, emballage_id, quantite_par_unite, actif)
    VALUES (v_cheese, v_pack, 1, true);

    INSERT INTO equipement (nom, description, actif)
    VALUES ('SQLTEST Cuve 500 L', 'Équipement de scénario SQL historique', true)
    RETURNING id INTO v_equipment;
    INSERT INTO regle_amortissement
        (equipement_id, cout_par_fabrication, date_debut_validite, date_fin_validite, actif)
    VALUES (v_equipment, 18.50, '2024-01-01', '2024-12-31', false);
    INSERT INTO tarif_lait (saison, prix_par_litre, date_debut_validite, date_fin_validite, actif)
    VALUES ('SECHE', 0.78, '2024-01-01', '2024-10-31', false);
    INSERT INTO regle_cout_energie
        (type_operation, cout_standard, unite_calcul, date_debut_validite, date_fin_validite, actif)
    VALUES ('CHAUFFE', 14.20, 'PAR_FABRICATION', '2024-01-01', '2024-12-31', false);
    INSERT INTO regle_main_oeuvre
        (type_operation, duree_standard_minutes, cout_horaire, date_debut_validite, date_fin_validite, actif)
    VALUES ('FABRICATION', 240, 12.50, '2024-01-01', '2024-12-31', false);

    INSERT INTO cave
        (nom, description, temperature, humidite, age_min_jours, age_max_jours, active)
    VALUES ('SQLTEST Cave pilote', 'Cave dédiée aux scénarios SQL', 11.5, 92, 0, 120, true)
    RETURNING id INTO v_cave;
    INSERT INTO etagere (cave_id, numero, ordre) VALUES (v_cave, 1, 1) RETURNING id INTO v_shelf;
    INSERT INTO rangee (etagere_id, numero, ordre, capacite) VALUES (v_shelf, 1, 1, 120) RETURNING id INTO v_row1;
    INSERT INTO rangee (etagere_id, numero, ordre, capacite) VALUES (v_shelf, 2, 2, 120) RETURNING id INTO v_row2;

    INSERT INTO emplacement_stock (nom, description, active)
    VALUES ('SQLTEST Chambre froide', 'Emplacement réservé aux stocks du scénario SQL', true)
    RETURNING id INTO v_location;

    FOR i IN 1..12 LOOP
        INSERT INTO fabrication
            (date_fabrication, date_heure_debut, duree_chauffage_minutes, duree_egouttage_minutes,
             nombre_fromages, numero_lot, observations, origine_lait, poids_total_fromages,
             quantite_ferments, quantite_lait, quantite_presure, temperature_chauffage,
             temperature_lait, temperature_mise_en_moule, type_ferments, type_presure,
             rendement, recette_id, operateur_id)
        VALUES
            (v_dates[i]::date, v_dates[i], 95 + (i % 4) * 5, 720,
             20, 'SQLTEST-' || lpad(i::text, 3, '0'),
             CASE WHEN i = 12 THEN 'SQLTEST anomalie volontaire' ELSE 'SQLTEST fabrication de référence' END,
             CASE WHEN i % 3 = 0 THEN 'MELANGE' WHEN i % 2 = 0 THEN 'TRAITE_SOIR' ELSE 'TRAITE_MATIN' END,
             CASE WHEN i = 12 THEN 6.00 ELSE 18.8 + (i % 4) * 0.20 END,
             18, 100, 25,
             CASE WHEN i = 12 THEN 55.0 ELSE 37.5 + (i % 3) * 0.30 END,
             8.0 + (i % 3) * 0.20, 31.5 + (i % 2) * 0.30,
             'Thermophile SQLTEST', 'Présure animale SQLTEST',
             CASE WHEN i = 12 THEN 6.00 ELSE 18.8 + (i % 4) * 0.20 END,
             v_recipe, v_worker)
        RETURNING id INTO v_fab;
        v_fabs := array_append(v_fabs, v_fab);

        INSERT INTO lot_affinage
            (date_mise_en_cave, date_sortie_prevue, quantite_initiale, statut, fabrication_id)
        VALUES
            (v_dates[i]::date + 1,
             CASE
                 WHEN i = 5 THEN CURRENT_DATE + 20
                 WHEN i = 6 THEN CURRENT_DATE + 15
                 WHEN i = 7 THEN CURRENT_DATE - 3
                 WHEN i = 8 THEN CURRENT_DATE
                 WHEN i = 9 THEN CURRENT_DATE + 2
                 WHEN i = 10 THEN CURRENT_DATE + 12
                 ELSE v_dates[i]::date + 35
             END,
             20,
             CASE WHEN i IN (1,2,3,4,11,12) THEN 'TERMINE'
                  WHEN i = 5 THEN 'EN_ATTENTE_PLACEMENT'
                  WHEN i = 6 THEN 'PARTIELLEMENT_PLACE'
                  ELSE 'EN_AFFINAGE' END,
             v_fab)
        RETURNING id INTO v_lot;
        v_lots := array_append(v_lots, v_lot);

        IF i = 6 THEN
            INSERT INTO placement_affinage
                (lot_affinage_id, rangee_id, position_debut, quantite, date_debut, date_fin)
            VALUES (v_lot, v_row1, 1, 10, CURRENT_TIMESTAMP - interval '8 days', NULL);
        ELSIF i BETWEEN 7 AND 10 THEN
            INSERT INTO placement_affinage
                (lot_affinage_id, rangee_id, position_debut, quantite, date_debut, date_fin)
            VALUES (v_lot, CASE WHEN i % 2 = 0 THEN v_row2 ELSE v_row1 END,
                    1 + ((i - 7) * 22), 20, CURRENT_TIMESTAMP - ((i + 2) || ' days')::interval, NULL);
        ELSIF i IN (1,2,3,4,11,12) THEN
            INSERT INTO placement_affinage
                (lot_affinage_id, rangee_id, position_debut, quantite, date_debut, date_fin)
            VALUES (v_lot, CASE WHEN i % 2 = 0 THEN v_row2 ELSE v_row1 END,
                    1, 20, v_dates[i] + interval '1 day', v_dates[i] + interval '36 days');
        END IF;

        IF i IN (7,8,9,10) THEN
            INSERT INTO soin_affinage
                (lot_affinage_id, utilisateur_id, type, date_heure, observation, etat_croute)
            VALUES
                (v_lot, v_worker,
                 CASE WHEN i = 10 THEN 'LAVAGE' ELSE 'RETOURNEMENT' END,
                 CASE WHEN i = 7 THEN CURRENT_TIMESTAMP - interval '8 days'
                      ELSE CURRENT_TIMESTAMP - interval '2 days' END,
                 'SQLTEST soin de suivi', 'Croûte régulière');
        END IF;

        IF i IN (1,2,3,4,11,12) THEN
            INSERT INTO stock_fromage_fini
                (lot_affinage_id, emplacement_stock_id, date_entree_stock, quantite_initiale,
                 type_date_durabilite, date_durabilite, statut)
            VALUES
                (v_lot, v_location, v_dates[i]::date + 36, 20,
                 CASE WHEN i % 2 = 0 THEN 'DDM' ELSE 'DLC' END,
                 CASE WHEN i = 11 THEN CURRENT_DATE + 3
                      WHEN i = 12 THEN CURRENT_DATE - 2
                      ELSE v_dates[i]::date + 96 END,
                 CASE WHEN i = 4 THEN 'EPUISE' WHEN i = 12 THEN 'BLOQUE' ELSE 'DISPONIBLE' END)
            RETURNING id INTO v_stock;
            v_stocks := array_append(v_stocks, v_stock);

            INSERT INTO mouvement_stock
                (stock_fromage_fini_id, utilisateur_id, type, quantite, date_mouvement, commentaire)
            VALUES (v_stock, v_worker, 'ENTREE', 20, v_dates[i] + interval '36 days', 'SQLTEST entrée initiale');

            IF i = 4 THEN
                INSERT INTO mouvement_stock
                    (stock_fromage_fini_id, utilisateur_id, type, quantite, date_mouvement, commentaire)
                VALUES (v_stock, v_sales, 'SORTIE', 20, v_dates[i] + interval '50 days', 'SQLTEST épuisement');
            ELSIF i = 12 THEN
                INSERT INTO mouvement_stock
                    (stock_fromage_fini_id, utilisateur_id, type, quantite, date_mouvement, commentaire)
                VALUES (v_stock, v_sales, 'PERTE', 3, CURRENT_TIMESTAMP - interval '1 day', 'SQLTEST DLC dépassée');
                INSERT INTO perte_stock
                    (stock_fromage_fini_id, utilisateur_id, quantite, type_perte, motif,
                     cout_unitaire_reference, cout_total, date_heure, reservation_stock_id)
                VALUES (v_stock, v_sales, 3, 'DLC_DDM_DEPASSEE', 'SQLTEST retrait préventif',
                        7.50, 22.50, CURRENT_TIMESTAMP - interval '1 day', NULL);
            END IF;

            INSERT INTO cout_production_lot
                (fabrication_id, cout_lait, cout_matieres, cout_emballage, cout_energie,
                 cout_main_oeuvre, cout_amortissement, cout_total, cout_par_unite,
                 cout_par_kg, nombre_unites_finales, date_calcul)
            VALUES
                (v_fab, 82, 14.40, 7.60, 21.50, 62.50, 18.50,
                 206.50, 10.325, 10.86, 20, v_dates[i] + interval '36 days');
        END IF;
    END LOOP;

    INSERT INTO consommation_emballage
        (lot_affinage_id, emballage_id, utilisateur_id, etape, quantite,
         cout_unitaire_reference, date_heure)
    VALUES
        (v_lots[1], v_pack, v_worker, 'AFFINAGE', 20, 0.38, v_dates[1] + interval '20 days'),
        (v_lots[2], v_pack, v_sales, 'PREPARATION_VENTE', 20, 0.38, v_dates[2] + interval '36 days');

    INSERT INTO cout_production_manuel
        (fromage_id, cout_unitaire, date_mise_a_jour, utilisateur_modification_id)
    VALUES (v_cheese, 11.20, CURRENT_TIMESTAMP, v_owner);

    INSERT INTO client (nom, type_client, telephone, adresse, actif)
    VALUES ('SQLTEST Épicerie du Centre', 'EPICERIE', '+261 34 00 000 01', 'Antananarivo', true)
    RETURNING id INTO v_client;

    INSERT INTO commande
        (numero_commande, client_id, date_commande, date_livraison_souhaitee,
         statut, observations, utilisateur_createur_id)
    VALUES
        ('CMD-SQLTEST-001', v_client, CURRENT_DATE - 20, CURRENT_DATE - 15,
         'LIVREE', 'SQLTEST commande livrée', v_sales)
    RETURNING id INTO v_order;
    INSERT INTO ligne_commande (commande_id, fromage_id, quantite_commandee, prix_unitaire)
    VALUES (v_order, v_cheese, 6, 16.50) RETURNING id INTO v_line;
    INSERT INTO reservation_stock (ligne_commande_id, stock_fromage_fini_id, quantite_reservee)
    VALUES (v_line, v_stocks[1], 6) RETURNING id INTO v_reservation;
    INSERT INTO livraison (commande_id, utilisateur_id, date_livraison, observations)
    VALUES (v_order, v_sales, CURRENT_DATE - 15, 'SQLTEST livraison complète')
    RETURNING id INTO v_delivery;
    INSERT INTO ligne_livraison
        (livraison_id, ligne_commande_id, stock_fromage_fini_id, quantite_prevue, quantite_livree)
    VALUES (v_delivery, v_line, v_stocks[1], 6, 6);
    INSERT INTO mouvement_stock
        (stock_fromage_fini_id, utilisateur_id, type, quantite, date_mouvement, commentaire)
    VALUES (v_stocks[1], v_sales, 'VENTE', 6, CURRENT_TIMESTAMP - interval '15 days', 'SQLTEST commande CMD-SQLTEST-001');
    INSERT INTO facture (commande_id, numero_facture, date_facture, total, mode_paiement)
    VALUES (v_order, 'FAC-SQLTEST-001', CURRENT_DATE - 15, 99.00, 'CARTE');

    INSERT INTO commande
        (numero_commande, client_id, date_commande, date_livraison_souhaitee,
         statut, observations, utilisateur_createur_id)
    VALUES
        ('CMD-SQLTEST-002', v_client, CURRENT_DATE - 1, CURRENT_DATE + 2,
         'PRETE', 'SQLTEST commande réservée à préparer', v_sales)
    RETURNING id INTO v_order;
    INSERT INTO ligne_commande (commande_id, fromage_id, quantite_commandee, prix_unitaire)
    VALUES (v_order, v_cheese, 4, 17.00) RETURNING id INTO v_line;
    INSERT INTO reservation_stock (ligne_commande_id, stock_fromage_fini_id, quantite_reservee)
    VALUES (v_line, v_stocks[2], 4);

    INSERT INTO commande
        (numero_commande, client_id, date_commande, date_livraison_souhaitee,
         statut, observations, utilisateur_createur_id)
    VALUES
        ('CMD-SQLTEST-003', v_client, CURRENT_DATE, CURRENT_DATE + 7,
         'ANNULEE', 'SQLTEST commande annulée', v_sales)
    RETURNING id INTO v_order;
    INSERT INTO ligne_commande (commande_id, fromage_id, quantite_commandee, prix_unitaire)
    VALUES (v_order, v_cheese, 2, 17.50);

    INSERT INTO perte_stock
        (stock_fromage_fini_id, utilisateur_id, quantite, type_perte, motif,
         cout_unitaire_reference, cout_total, date_heure, reservation_stock_id)
    VALUES (v_stocks[2], v_sales, 1, 'RETOUR_CLIENT', 'SQLTEST emballage endommagé au retour',
            10.325, 10.325, CURRENT_TIMESTAMP - interval '3 days', v_reservation);
    INSERT INTO mouvement_stock
        (stock_fromage_fini_id, utilisateur_id, type, quantite, date_mouvement, commentaire)
    VALUES (v_stocks[2], v_sales, 'PERTE', 1, CURRENT_TIMESTAMP - interval '3 days', 'SQLTEST retour client perdu');
END
$seed$;

COMMIT;

