Integrantes:
- [Raphaël Nicaise](https://github.com/RaphaelNicaise) — Backend & Infrastructure
- [Nicolas Cordano](https://github.com/NACXIIX) — QA & Frontend
- [Abner Grgurich](https://github.com/Abner2646) — Backend
- [Santiago Segal](https://github.com/Santucho12) — FullStack

[Trello](https://trello.com/b/Cl5Jz95t/trabajo-final-integrador) 

Documentacion Completa en -> [Docs](docs/documentacion.md) 

   - docker compose -f infra/test.yml --env-file .env up --build --abort-on-container-exit --exit-code-from api-tests
   - docker compose -f infra/dev.yml --env-file .env up --build
   - docker compose -f infra/prod.yml --env-file .env up -d --build