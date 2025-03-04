import json
import urllib.request
import os

def generate_mapping(data_file, geojson_file):
    """
    Generates a JavaScript country code mapping, handling inconsistencies.

    Args:
        data_file: Path to your processed_data_date.json file.
        geojson_file: Path to the countries.geo.json file.

    Returns:
        A dictionary representing the country code mapping.
    """

    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            covid_data = json.load(f)
        with open(geojson_file, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error: {e}")
        return None

    # 1. Create sets for fast lookup
    data_country_codes = {country['country_code'] for country in covid_data}
    geojson_ids = {feature['id'] for feature in geojson_data['features']}

    # 2. Create comprehensive name mappings (both ways!) from GeoJSON
    geojson_name_to_id = {}
    geojson_id_to_name = {}  # Add this for reverse lookup
    for feature in geojson_data['features']:
        if 'properties' in feature and 'name' in feature['properties']:
            name = feature['properties']['name']
            geojson_name_to_id[name] = feature['id']
            geojson_id_to_name[feature['id']] = name  # Reverse mapping
            # Handle common variations (add more as needed)
            geojson_name_to_id[name.lower()] = feature['id']
            geojson_name_to_id[name.replace(" ", "")] = feature['id']
            geojson_name_to_id[name.replace("-", " ")] = feature['id']
           #Special Cases for Geojson Name
            if name == 'United Kingdom':
                geojson_name_to_id['United Kingdom'] = "UK"
                geojson_id_to_name['UK'] = 'United Kingdom'
            if name == "Czechia":
                geojson_name_to_id['Czech Republic'] = "CZ"
                geojson_id_to_name['CZ'] = 'Czech Republic'
            if name == "North Macedonia":
              geojson_name_to_id["Macedonia"] = "MK"
              geojson_id_to_name["MK"] = "Macedonia"
            if name == "Republic of the Congo":
               geojson_name_to_id["Congo"] = "CG"
               geojson_id_to_name["CG"] = "Congo"
            if name == "Democratic Republic of the Congo":
               geojson_name_to_id["DR Congo"] = "CD"
               geojson_id_to_name["CD"] = "DR Congo"
            if name == "Ivory Coast":
               geojson_name_to_id["Cote d'Ivoire"] = "CI"
               geojson_id_to_name["CI"] = "Cote d'Ivoire"
            if name == "South Korea":
                geojson_id_to_name['Korea, South'] = "KR"
                geojson_name_to_id['Korea, South'] = "KR"


    # 3. Build the mapping
    country_code_map = {}
    unmapped_codes = []

    for code in data_country_codes:
        if code in geojson_ids:
            continue  # Direct match
        elif code.upper() in geojson_ids:
            country_code_map[code] = code.upper()  # Case-insensitive
        else:
            # Fallback: Try to find a match using country names (from YOUR data)
            found_match = False
            for country_data in covid_data:
                if country_data['country_code'] == code:
                    country_name = country_data['country']

                    # Try various name variations
                    if country_name in geojson_name_to_id:
                        country_code_map[code] = geojson_name_to_id[country_name]
                        found_match = True
                        break
                    elif country_name.lower() in geojson_name_to_id:
                        country_code_map[code] = geojson_name_to_id[country_name.lower()]
                        found_match = True
                        break
                    elif country_name.replace(" ", "") in geojson_name_to_id:
                        country_code_map[code] = geojson_name_to_id[country_name.replace(" ", "")]
                        found_match = True
                        break
                    elif country_name.replace("-", " ") in geojson_name_to_id:
                         country_code_map[code] = geojson_name_to_id[country_name.replace("-", " ")]
                         found_match = True
                         break
                    #Handle Special Cases
                    if country_name == 'United Kingdom':
                      country_code_map[code] = "UK"
                      found_match = True
                      break
                    if country_name == "Czechia":
                      country_code_map[code] = "CZ"
                      found_match = True
                      break

            if not found_match:
                unmapped_codes.append(code)

    if unmapped_codes:
        print(f"Warning: The following country codes were not mapped: {unmapped_codes}")

    return country_code_map


if __name__ == "__main__":
    data_file = 'data/processed_data_date.json'  # Your data file
    geojson_file = 'countries.geo.json'

    if not os.path.exists(geojson_file):
        print("Downloading countries.geo.json...")
        urllib.request.urlretrieve("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json", geojson_file)
        print("Download complete.")

    mapping = generate_mapping(data_file, geojson_file)

    if mapping is not None:
        print("const countryCodeMap = {")
        for data_code, geojson_code in mapping.items():
            print(f'    "{data_code}": "{geojson_code}",')
        print("};")