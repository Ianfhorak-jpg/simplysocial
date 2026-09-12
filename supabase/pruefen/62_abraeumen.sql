-- Abräumen für 60_konto.sh. Löscht ALLE Konten samt Profilen (Cascade über
-- `profiles.id references auth.users on delete cascade`). Der Wächter in
-- `60_konto.sh` hat vorher sichergestellt, dass die Datenbank leer WAR — es kann
-- also nichts Fremdes darunter sein.
delete from auth.users;
