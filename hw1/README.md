## GET all habbits

node index.js list

## Add habbit

node index.js add --name "Learn Go" --freq weekly

## delete habbit

node index.js delete --id 1751048550730

## change habbit progress

# --day or -- week or --month number

node index.js done --id 1751045439475 --week 3

## update habbit data

# params --name and --freq are optional

node index.js update --id 1751046600528 --name "Learn Express with TS" --freq weekly

## get stats

node index.js stats
