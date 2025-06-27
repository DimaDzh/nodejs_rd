## redis-like dockerhub

docker pull dimadzh/redis-like

## kv-service dockerhub

docker pull dimadzh/kv-service

## Створення образу

```bash
docker compose up
```

## Запуск compose з ребілдом

```bash
docker compose up --build
```

## Перевірка роботи

### GET запит до сервера

```bash
curl localhost:8080/kv/test
```

### POST запит до сервера

```bash
curl -X POST -H "Content-Type: application/json" -d '{"key":"test", "value":"Hello, Redis!"}' localhost:8080/kv/
```

## Зупинка compose

```bash
docker compose down -v
```
