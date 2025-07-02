## Post one tea - POST

http://localhost:3030/tea
{
"name": "Green Tea",
"origin": "China",
"rating": 9,
"brewTemp": 85,
"notes": "Best served plain"
}

## Get all teas - GET

http://localhost:3030/tea

## Get all teas with filter by rating - GET

http://localhost:3030/tea?minRating=8

## Get one tea by id GET

http://localhost:3030/tea/1751456695034

## Update one tea by id GET - PUT

http://localhost:3030/tea/1751456695034

{
"rating": 8,
"brewTemp": 90,
}

## Delete one tea by id DELETE

http://localhost:3030/tea/1751456695034

## Post - create one
