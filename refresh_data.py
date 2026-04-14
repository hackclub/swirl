# this will be run in a github actions workflow to refresh the data.json file from unified
# it will update the data.json file with all of swirl's ships from unified

import requests
import json

url = "https://api2.hackclub.com/v0.1/Unified%20YSWS%20Projects%20DB/Approved%20Projects"
response = requests.get(url)
data = response.json()

print(f"Got {len(data)} ships from the API")

ships = []
for ship in data:
    fields = ship.get("fields", None)
    if not fields:
        continue
    ysws_name = fields.get("YSWS–Name", None) # the dashes are en dashes not hyphens. tripped me up for wayy too long.
    if not ysws_name:
        continue
    if isinstance(ysws_name, list):
        ysws_name = ysws_name[0] # it's very interesting that in python you can reassign variables to different types lol
    elif not isinstance(ysws_name, str): # skip if it's not a string or list, i haven't ever seen strings but just in case
        continue
    if ysws_name != "Swirl":
        continue
    ships.append(ship)

print(f"Final list has {len(ships)} ships")
with open("data.json", "w") as f:
    json.dump(ships, f, indent=4)
