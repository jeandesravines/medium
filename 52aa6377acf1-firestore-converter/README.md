# Deterministic Database Seeding

This is a sample project to show how to seed a database according to [this Medium post](https://medium.com/@jeandesravines/df062eef387f).

There is no functional API in there. But these files could be used to create one.

## Installation

Create a `.env` file based on the `.env.example` to provide a `FIREBASE_SERVICE_ACCOUNT` variable with your own `serviceAccount.json`'s content.

## Build and Run
 
The following command will up a Docker container to execute the `yarn seed` command in it.

```sh
docker-compose run --rm api yarn seed
```
