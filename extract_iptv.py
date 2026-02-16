
import re
import json

def extract_channels():
    with open('rivestream_data.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # regex to find w=JSON.parse('...')
    # The content inside single quotes is what we want. 
    # Be careful about escaped quotes.
    match = re.search(r"w=JSON\.parse\('(.+?)'\)", content)
    if not match:
        print("Could not find public channels (w variable)")
        return

    json_str = match.group(1)
    
    # The JS string might have escaped single quotes like \' 
    # We need to unescape them to get valid JSON string
    json_str = json_str.replace("\\'", "'")

    # Fix \xHH escapes which are not valid in JSON (but are in JS)
    # convert \xHH to \u00HH
    json_str = re.sub(r'\\x([0-9a-fA-F]{2})', r'\\u00\1', json_str)
    
    # Also it might be using escaped double quotes \" inside the string if it was stringified
    # Let's try to parse it
    try:
        channels = json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        # Try to debug by saving the string
        with open('debug_json.txt', 'w', encoding='utf-8') as f:
            f.write(json_str)
        return

    print(f"Found {len(channels)} public channels")

    # Generate TypeScript output
    ts_output = """export type Channel = {
  id: string
  name: string
  logo: string
  category: string
  streamUrl: string
  language?: string
  country?: string
}

export const channels: Channel[] = [
"""

    for channel in channels:
        # Map fields
        c_id = channel.get('id', '')
        name = channel.get('name', '').replace('"', '\\"')
        logo = channel.get('logo', '') or 'https://via.placeholder.com/150?text=' + name.replace(' ', '+')
        stream = channel.get('streamUrl', '')
        country = channel.get('country', '')
        language = get_language(country)
        
        # Categories is a list, take the first one or 'General'
        cats = channel.get('categories', [])
        category = cats[0] if cats else 'General'
        category = category.capitalize()

        if not stream:
            continue

        ts_output += "  {\n"
        ts_output += f'    id: "{c_id}",\n'
        ts_output += f'    name: "{name}",\n'
        ts_output += f'    logo: "{logo}",\n'
        ts_output += f'    category: "{category}",\n'
        ts_output += f'    streamUrl: "{stream}",\n'
        ts_output += f'    language: "{language}",\n'
        ts_output += f'    country: "{country}",\n'
        ts_output += "  },\n"

    ts_output += "]\n\n"
    ts_output += "export const FEATURED_CHANNELS = channels;\n"
    
    # Write to lib/iptv.ts
    # Note: We are overwriting the existing file.
    with open('lib/iptv.ts', 'w', encoding='utf-8') as f:
        f.write(ts_output)
    
    print("Successfully wrote lib/iptv.ts")

def get_language(country):
    country = country.upper()
    if country in ['US', 'GB', 'UK', 'CA', 'AU', 'NZ', 'IE']:
        return 'en'
    if country in ['FR', 'BE', 'CH', 'SN', 'CM', 'CI']:
        return 'fr'
    if country in ['SA', 'AE', 'EG', 'LB', 'JO', 'KW', 'QA', 'OM', 'BH', 'IQ', 'SY', 'YE', 'PS', 'SD', 'LY', 'MA', 'DZ', 'TN']:
        return 'ar'
    if country in ['KR']:
        return 'ko'
    return 'en' # Default fallback

if __name__ == "__main__":
    extract_channels()
