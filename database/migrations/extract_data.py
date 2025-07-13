#!/usr/bin/env python3
"""
Extract cannabis strains and breeders data from SQLite dump and convert to PostgreSQL format.
"""

import re
import csv
import json
from datetime import datetime
from typing import Dict, List, Optional

def parse_sqlite_insert(line: str) -> Optional[Dict]:
    """Parse a SQLite INSERT statement and return the values."""
    # Match INSERT INTO table_name VALUES(...);
    match = re.match(r"INSERT INTO (\w+) VALUES\((.*)\);", line)
    if not match:
        return None
    
    table_name = match.group(1)
    values_str = match.group(2)
    
    # Parse values - this is a simplified parser for the specific format
    values = []
    current_value = ""
    in_quotes = False
    quote_char = None
    escape_next = False
    paren_depth = 0
    
    i = 0
    while i < len(values_str):
        char = values_str[i]
        
        if escape_next:
            current_value += char
            escape_next = False
        elif char == '\\':
            current_value += char
            escape_next = True
        elif char in ["'", '"'] and not in_quotes:
            in_quotes = True
            quote_char = char
            # Don't include the quote in the value
        elif char == quote_char and in_quotes:
            in_quotes = False
            quote_char = None
            # Don't include the quote in the value
        elif char == '{' and not in_quotes:
            paren_depth += 1
            current_value += char
        elif char == '}' and not in_quotes:
            paren_depth -= 1
            current_value += char
        elif char == ',' and not in_quotes and paren_depth == 0:
            # End of current value
            value = current_value.strip()
            if value == 'NULL':
                values.append(None)
            else:
                values.append(value)
            current_value = ""
        else:
            current_value += char
        
        i += 1
    
    # Add the last value
    if current_value.strip():
        value = current_value.strip()
        if value == 'NULL':
            values.append(None)
        else:
            values.append(value)
    
    return {
        'table': table_name,
        'values': values
    }

def convert_datetime(sqlite_datetime: str) -> str:
    """Convert SQLite datetime to PostgreSQL timestamp format."""
    if not sqlite_datetime:
        return datetime.now().isoformat()
    
    try:
        # Parse the SQLite datetime format: "2024-09-28 23:47:24"
        dt = datetime.strptime(sqlite_datetime, "%Y-%m-%d %H:%M:%S")
        return dt.isoformat()
    except:
        return datetime.now().isoformat()

def extract_thc_cbd_from_type(cbd_str: str) -> tuple[Optional[int], Optional[int]]:
    """Extract THC and CBD percentages from the CBD type string."""
    if not cbd_str:
        return None, None
    
    # Common patterns for CBD/THC content
    if "KAUM/KEIN CBD" in cbd_str or "< 2% CBD" in cbd_str:
        return None, 1  # Low CBD, assume high THC
    elif "NUR CBD" in cbd_str or "< 2% THC" in cbd_str:
        return 1, None  # High CBD, low THC
    elif "CBD ≈ THC" in cbd_str:
        return 10, 10  # Balanced
    
    return None, None

def parse_flowering_info(flowering_str: str) -> Optional[int]:
    """Parse flowering time from JSON string."""
    if not flowering_str:
        return None
    
    try:
        flowering_data = json.loads(flowering_str.replace('\\"', '"'))
        if flowering_data.get('days'):
            return int(flowering_data['days'])
    except:
        pass
    
    return None

def main():
    breeders = []
    strains = []
    
    print("Processing SQLite dump file...")
    
    with open('/home/henning/_dev/growagram/database/dumps/export.sql', 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            if line_num % 5000 == 0:
                print(f"Processed {line_num} lines...")
            
            line = line.strip()
            if not line.startswith('INSERT INTO'):
                continue
            
            parsed = parse_sqlite_insert(line)
            if not parsed:
                continue
            
            if parsed['table'] == 'breeders':
                # SQLite: id, name, slug, lang, imported_from, description, licence_id, url, created_at, updated_at
                # PostgreSQL: id, name, created_at, updated_at
                values = parsed['values']
                if len(values) >= 10:
                    breeder = {
                        'id': values[0],
                        'name': values[1],
                        'created_at': convert_datetime(values[8]),
                        'updated_at': convert_datetime(values[9])
                    }
                    breeders.append(breeder)
            
            elif parsed['table'] == 'strains':
                # SQLite: id, name, slug, lang, breeder_id, licence_id, type, cbd, link, pic, flowering, description, created_at, updated_at
                # PostgreSQL: id, name, breeder_id, thc_content, cbd_content, strain_type, genetics_type, created_at, updated_at
                values = parsed['values']
                if len(values) >= 14:
                    thc_content, cbd_content = extract_thc_cbd_from_type(values[7])
                    
                    strain = {
                        'id': values[0],
                        'name': values[1],
                        'breeder_id': values[4],
                        'thc_content': thc_content,
                        'cbd_content': cbd_content,
                        'strain_type': values[6] if values[6] else None,
                        'genetics_type': values[6] if values[6] else None,  # Using same as strain_type for now
                        'created_at': convert_datetime(values[12]),
                        'updated_at': convert_datetime(values[13])
                    }
                    strains.append(strain)
    
    print(f"Extracted {len(breeders)} breeders and {len(strains)} strains")
    
    # Write breeders CSV
    print("Writing breeders.csv...")
    with open('/home/henning/_dev/growagram/database/migrations/breeders.csv', 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=['id', 'name', 'created_at', 'updated_at'])
        writer.writeheader()
        writer.writerows(breeders)
    
    # Write strains CSV
    print("Writing strains.csv...")
    with open('/home/henning/_dev/growagram/database/migrations/strains.csv', 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=['id', 'name', 'breeder_id', 'thc_content', 'cbd_content', 'strain_type', 'genetics_type', 'created_at', 'updated_at'])
        writer.writeheader()
        writer.writerows(strains)
    
    print("Data extraction completed!")
    print(f"Files created:")
    print(f"  - breeders.csv: {len(breeders)} records")
    print(f"  - strains.csv: {len(strains)} records")

if __name__ == "__main__":
    main()
