#!/usr/bin/env python3
"""Collect public Philadelphia procurement listings into a traceable static snapshot.

Standard-library only. No login, credentials, private APIs, or scheduled task.
Usage: python scripts/refresh-procurement.py [--cached]
Cache is temporary and never deployed. A failed source aborts the refresh.
"""
from __future__ import annotations

import argparse
import collections
import concurrent.futures
import csv
import datetime as dt
import hashlib
import gzip
import html
import http.cookiejar
import io
import json
import pathlib
import re
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = ROOT / ".work"
OUT = ROOT / "src/procurement/data"
NY = ZoneInfo("America/New_York")
ASOF = dt.datetime.now(NY)
TODAY = ASOF.date().isoformat()
UA = "Mozilla/5.0 (compatible; QuantStrataPublicDataResearch/1.0)"
EC = "https://philawx.phila.gov/ECONTRACT/"
PHL = "https://www.phlcontracts.phila.gov"
CARTO = "https://phl.carto.com/api/v2/sql?"
FORECAST = "https://www.phila.gov/media/20261002165619/Final-Fall-2026-Procurement-Forecast-CSV-File.csv"
DISTRICTS = "https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Council_Districts_2024/FeatureServer/0/query?" + urllib.parse.urlencode({"where":"1=1","outFields":"district","outSR":"4326","f":"geojson","geometryPrecision":"5"})
URLS = {
    "opportunities.json": CARTO + urllib.parse.urlencode({"q":"select * from contract_opportunities"}),
    "pro-open": EC + "Documents/FrmOpportunityList.aspx",
    "pro-awards": EC + "Documents/FrmAwardList.aspx",
    "pro-executed": EC + "Documents/FrmExecutedList.aspx",
    "forecast-csv": FORECAST,
    "commodities-history": "https://raw.githubusercontent.com/CityOfPhiladelphia/contracts/gh-pages/commodities/data/FY2016Q1.csv",
    "capital-data": CARTO + urllib.parse.urlencode({"q":"select * from capital_projects_for_finder"}),
    "districts": DISTRICTS,
}


def fetch(name, url, cached=False):
    path = CACHE / name
    if cached:
        return path.read_bytes()
    req = urllib.request.Request(url, headers={"User-Agent":UA})
    data = urllib.request.urlopen(req, timeout=40).read()
    if not data:
        # A few public bid endpoints occasionally return an empty 200 response.
        data = urllib.request.urlopen(req, timeout=40).read()
    if not data:
        raise ValueError("Empty response for required public source: " + name)
    path.write_bytes(data)
    return data


def text(value):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", str(value or "")))).strip()


def table_rows(data, table_id="dgrResult"):
    # These public list tables have no nested tables; require their exact identifier.
    s = data.decode("utf-8-sig", errors="replace") if isinstance(data, bytes) else data
    m = re.search(r'<table\b[^>]+id="' + re.escape(table_id) + r'"[^>]*>(.*?)</table>', s, re.S | re.I)
    if not m:
        raise ValueError("Expected public data table missing: " + table_id)
    rows = []
    for row in re.findall(r"<tr\b[^>]*>(.*?)</tr>", m.group(1), re.S | re.I):
        values = [text(x) for x in re.findall(r"<t[dh]\b[^>]*>(.*?)</t[dh]>", row, re.S | re.I)]
        if values:
            rows.append(values)
    return rows


def date(value):
    value = text(value)
    for fmt in ("%m/%d/%Y", "%Y%m%d", "%Y-%m-%d", "%m/%d/%Y %I:%M %p", "%m/%d/%Y %I:%M:%S %p", "%b-%y"):
        try:
            return dt.datetime.strptime(value, fmt).date().isoformat()
        except ValueError:
            pass
    return value[:10] if re.match(r"\d{4}-\d{2}-\d{2}T", value) else None


def money(value):
    try:
        return float(re.sub(r"[$,\s]", "", str(value)))
    except (ValueError, TypeError):
        return None


def amount_range(value):
    nums = re.findall(r"\$\s*([\d,]+(?:\.\d+)?)", str(value or ""))
    if not nums:
        return None, None
    vals = [money(v) for v in nums]
    return (min(vals), max(vals))


def department(value):
    s = text(value)
    s = re.sub(r"^\d+\s*-\s*", "", s).upper()
    mapping = {
        "OFFICE OF INNOVATION AND TECHNOLOGY":"Office of Innovation & Technology",
        "WATER":"Water Department", "WATER DEPARTMENT":"Water Department",
        "AVIATION":"Aviation", "DEPARTMENT OF AVIATION":"Aviation",
        "PARKS & RECREATION":"Parks & Recreation", "PARKS AND RECREATION":"Parks & Recreation",
        "STREETS":"Streets Department", "STREETS DEPARTMENT":"Streets Department",
        "PUBLIC PROPERTY":"Public Property", "DEPARTMENT OF PUBLIC PROPERTY":"Public Property",
        "OFFICE OF BH-MR SERVICES":"Behavioral Health & Intellectual disAbility Services",
        "BEHAVIORAL HEALTH AND INTELLECTUAL DISABILITY SERVICES":"Behavioral Health & Intellectual disAbility Services",
        "HEALTH":"Public Health", "PUBLIC HEALTH":"Public Health",
        "MAYOR - CAPITAL PROGRAM OFFICE":"Capital Program Office", "CAPITAL PROGRAM OFFICE":"Capital Program Office",
        "MAYOR-OFFICE OF SUSTAINABILITY":"Office of Sustainability",
        "OFFICE OF FLEET MANAGEMENT":"Fleet Services", "FLEET SERVICES":"Fleet Services",
        "FLEET MANAGEMENT":"Fleet Services",
        "OFFICE OF INNOVATION & TECHNOLOGY (OIT)":"Office of Innovation & Technology",
        "OFFICE OF SUSTAINABILITY":"Office of Sustainability",
        "FIRE DEPARTMENT":"Fire", "FIRE":"Fire",
        "HEALTH DEPARTMENT":"Public Health",
        "LICENSES & INSPECTIONS":"Licenses & Inspections",
        "LICENSES AND INSPECTIONS":"Licenses & Inspections", "L + I DEPARTMENT":"Licenses & Inspections",
        "RECORDS DEPARTMENT":"Records", "REVENUE DEPARTMENT":"Revenue",
        "MAYOR'S OFFICE OF COMMUNITY SERVICES (MOCS)":"Mayors Office Community Srv.",
        "MANAGING DIRECTOR'S OFFICE (MDO)":"Managing Director",
        "SEPTA":"SEPTA", "CITYWIDE":"Citywide",
        "PHILADELPHIA GAS WORKS (PGW)":"Philadelphia Gas Works (PGW)",
        "PHILADELPHIA ENERGY AUTHORITY (PEA) IN PARTNERSHIP WITH PWD":"Philadelphia Energy Authority (PEA) in Partnership With PWD",
    }
    return mapping.get(s, s.title())


def record(key, **fields):
    r = dict(id=key, title="", description="", category="Other / Unclassified", department="Unspecified", stage="Unknown", source="", source_id="", source_url="", reference="", vendor=None, posted=None, due=None, start=None, end=None, anticipated=None, amount_low=None, amount_high=None, amount_basis="Not Published", amount_label="Not Published", location=None, entity="City of Philadelphia", snapshot=None, service_type="", codes=[], subcontracting="", raw_status="")
    r.update(fields)
    return r


def phl_collect(cached):
    """Read every page of the public open-bids list, verifying pagination counts."""
    p = CACHE / "phl-pages.json"
    if cached:
        return json.loads(p.read_text())
    url = PHL + "/bso/view/search/external/advancedSearchBid.xhtml?openBids=true"
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    op.addheaders = [("User-Agent", UA)]
    body = op.open(url, timeout=40).read().decode()
    expected = int(re.search(r"\d+-\d+ of (\d+)", body).group(1))
    def rows(s):
        return [[text(v) for v in re.findall(r"<td\b[^>]*>(.*?)</td>", tr, re.S)] for tr in re.findall(r'<tr\b[^>]+data-ri="[^"]+"[^>]*>(.*?)</tr>', s, re.S)]
    result = rows(body)
    state = html.unescape(re.findall(r'name="javax.faces.ViewState"[^>]*value="([^"]+)"', body)[-1])
    csrf = html.unescape(re.findall(r'name="_csrf"[^>]*value="([^"]+)"', body)[-1])
    for first in range(25, expected, 25):
        k = "bidSearchResultsForm:bidResultId"
        payload = {"javax.faces.partial.ajax":"true", "javax.faces.source":k, "javax.faces.partial.execute":k, "javax.faces.partial.render":k, k+"_pagination":"true", k+"_first":str(first), k+"_rows":"25", k+"_skipChildren":"true", k+"_encodeFeature":"true", "bidSearchResultsForm":"bidSearchResultsForm", "openBids":"true", "javax.faces.ViewState":state, "_csrf":csrf}
        req = urllib.request.Request(url, data=urllib.parse.urlencode(payload).encode(), headers={"Faces-Request":"partial/ajax", "Referer":url})
        page = op.open(req, timeout=40).read().decode()
        if "<error>" in page:
            raise ValueError("PHLContracts pagination failed")
        result.extend(rows(page))
        m = re.search(r'<update id="[^\"]*javax.faces.ViewState[^\"]*"><!\[CDATA\[(.*?)\]\]>', page, re.S)
        if m:
            state = m.group(1)
    if len(result) != expected or len({x[0] for x in result}) != expected:
        raise ValueError(f"PHLContracts coverage mismatch: {len(result)} / {expected}")
    p.write_text(json.dumps(result))
    return result


def phl_detail(bid, cached):
    url = PHL + "/bso/external/bidDetail.sda?" + urllib.parse.urlencode({"docId":bid,"external":"true","parentUrl":"close"})
    data = fetch("detail-"+bid, url, cached).decode("utf-8", errors="replace")
    def field(label):
        m = re.search(re.escape(label) + r"\s*</td>\s*<td\b[^>]*>(.*?)</td>", data, re.S | re.I)
        return text(m.group(1)) if m else ""
    return {k:field(k+":") for k in ("Department", "Type Code", "Description", "Available Date", "Bid Opening Date", "Bulletin Desc")}


def point_in_ring(x, y, ring):
    inside = False
    j = len(ring) - 1
    for i, (xi, yi, *_) in enumerate(ring):
        xj, yj = ring[j][:2]
        if ((yi > y) != (yj > y)) and x < (xj-xi)*(y-yi)/(yj-yi)+xi:
            inside = not inside
        j = i
    return inside


def district_for(lon, lat, districts):
    for f in districts["features"]:
        g = f["geometry"]
        polygons = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        if any(point_in_ring(lon, lat, p[0]) and not any(point_in_ring(lon, lat, h) for h in p[1:]) for p in polygons):
            return str(f["properties"]["district"])
    return None


def main(cached=False):
    CACHE.mkdir(exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        blobs = dict(pool.map(lambda t:(t[0], fetch(*t, cached)), URLS.items()))
    sources = []
    def source(key, title, url, count, period, note, unit="Records"):
        sources.append(dict(id=key, title=title, url=url, count=count, period=period, note=note, unit=unit, retrieved_at=ASOF.isoformat(timespec="seconds")))
    records = []
    pro_rows = table_rows(blobs["pro-open"])[1:]
    pro_by_number = {}
    for v in pro_rows:
        if len(v) != 8:
            raise ValueError("Unexpected professional opportunity row")
        num, desc, dept, service, amt, opening, closing, status = v
        low, high = amount_range(amt)
        due = date(closing)
        stage = {"open":"Open", "closed":"Closed", "cancelled":"Cancelled"}.get(status.lower(), "Unknown")
        if stage == "Open" and due and due < TODAY:
            stage = "Deadline Passed"
        r = record("ec-op-"+num, title=service+" · "+department(dept), description=desc, category="Professional Services", department=department(dept), stage=stage, source="eContractPhilly · Opportunities", source_id="ec-open", source_url=EC+"default.aspx?LinkOppID="+num, reference=num, posted=date(opening), due=due, amount_low=low, amount_high=high, amount_basis="Solicitation Estimate" if high is not None else "Not Published", amount_label=amt, service_type=service, raw_status=status)
        pro_by_number[num] = r
        records.append(r)
    source("ec-open", "eContractPhilly · Opportunities", URLS["pro-open"], len(pro_rows), "Public listing, including closed/cancelled records", "All rows returned by the public opportunity list. Detail text may be abbreviated by the source.")
    executed = table_rows(blobs["pro-executed"])[1:]
    for i, v in enumerate(executed):
        if len(v) != 7:
            raise ValueError("Unexpected executed-contract row")
        num, vendor, dept, start, end, status, idx = v
        base = re.match(r"\d{14}", num)
        prior = pro_by_number.get(base.group() if base else num)
        digest = hashlib.sha256(("|".join(v)+str(i)).encode()).hexdigest()[:15]
        records.append(record("ec-ex-"+digest, title=prior["title"] if prior else "Professional Services · "+vendor, description=prior["description"] if prior else "Executed-contract vendor listing. Scope and value are not supplied in this source row.", category="Professional Services", department=department(dept), stage="Executed Listing", source="eContractPhilly · Executed Contracts", source_id="ec-executed", source_url=EC+"default.aspx?LinkOppID="+base.group() if base else URLS["pro-executed"], reference=num, vendor=vendor, start=date(start), end=date(end), raw_status=status, service_type=prior["service_type"] if prior else ""))
    source("ec-executed", "eContractPhilly · Executed Contracts", URLS["pro-executed"], len(executed), "Public executed-contract vendor listing", "Each row is a vendor / opportunity / term listing, not a unique citywide contract. Multiple vendors may relate to one opportunity; values are not published here.", "Vendor / term rows")
    notices = table_rows(blobs["pro-awards"])[1:]
    for i, v in enumerate(notices):
        if len(v) != 4:
            raise ValueError("Unexpected intent-to-contract row")
        num, desc, dept, posted = v
        base = re.match(r"\d{14}", num)
        records.append(record(f"ec-int-{num}-{i}", title="Notice of Intent · "+department(dept), description=desc, category="Professional Services", department=department(dept), stage="Intent to Contract", source="eContractPhilly · Notices of Intent", source_id="ec-intent", source_url=EC+"default.aspx?LinkOppID="+base.group() if base else URLS["pro-awards"], reference=num, posted=date(posted)))
    source("ec-intent", "eContractPhilly · Notices of Intent", URLS["pro-awards"], len(notices), "Public notice list", "A notice of intent is a procurement stage; it does not establish an executed contract or a current award value.")
    hub = json.loads(blobs["opportunities.json"])["rows"]
    hub_by_bid = {str(x["bid_number"]):x for x in hub if x["data_source"] == "PHL-Contracts"}
    phl_rows = phl_collect(cached)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        details = dict(zip([v[0] for v in phl_rows], pool.map(lambda v:phl_detail(v[0], cached), phl_rows)))
    for v in phl_rows:
        num = v[0]
        d = details[num]
        h = hub_by_bid.get(num, {})
        code = d["Type Code"].split(" - ")[0]
        category = h.get("contract_category", "").replace("Services, Supplies, and Equipment", "Services, Supplies & Equipment")
        if "public works" in d["Type Code"].lower():
            category = "Public Works"
        elif "concession" in d["Type Code"].lower():
            category = "Concessions"
        elif code in {"BB","DB","EB","FB","IB","MI","RI","SB","SU","SO","SW","OA"}:
            category = "Services, Supplies & Equipment"
        elif category not in {"Public Works", "Professional Services", "Services, Supplies & Equipment", "Concessions"}:
            category = "Other / Unclassified"
        due = date(v[7])
        estimate = money(h.get("estimated_amount"))
        codes = h.get("nigp_codes") or "[]"
        try:
            codes = json.loads(codes) if isinstance(codes, str) else codes
        except ValueError:
            codes = []
        records.append(record("phl-op-"+num, title=d["Description"] or v[6], description=d["Bulletin Desc"] or v[6], category=category, department=department(d["Department"]) if d["Department"] else "Unspecified", stage="Open" if not due or due >= TODAY else "Deadline Passed", source="PHLContracts · Open Bids", source_id="phl-open", source_url=PHL+"/bso/external/bidDetail.sda?docId="+num+"&external=true&parentUrl=close", reference=num, posted=date(d["Available Date"]), due=due, amount_low=estimate, amount_high=estimate, amount_basis="Hub Estimate" if estimate is not None else "Not Published", amount_label=f"${estimate:,.2f}" if estimate is not None else "Not Published", codes=codes, raw_status=v[9], service_type=d["Type Code"]))
    source("phl-open", "PHLContracts · Open Bids", PHL+"/bso/view/search/external/advancedSearchBid.xhtml?openBids=true", len(phl_rows), "Every page of public open-bid results", "All result pages reconciled to the source row count. Direct bid details take precedence. Available Hub estimates enrich matching bid IDs only.")
    source("hub", "Contracts Hub · Enrichment", "https://contracts.phila.gov/", len(hub), "Combined public opportunity feed", "Used to enrich matching PHLContracts IDs. It is not added as a second set of duplicate opportunities.", "Feed rows checked")
    forecast_text = blobs["forecast-csv"].decode("cp1252")
    forecast_reader = csv.DictReader(io.StringIO(forecast_text.partition("\n")[2]))
    forecast_reader.fieldnames = [re.sub(r"[\r\n]", "", f).strip() for f in forecast_reader.fieldnames]
    forecast = [v for v in forecast_reader if v.get("Project Name") and v.get("Department / Agency")]
    for i, v in enumerate(forecast):
        proc = text(v["Procurement Type"])
        cat = "Professional Services" if "Professional Service" in proc else "Public Works" if "Public Works" in proc else "Services, Supplies & Equipment" if "SS&E" in proc else "Other / Unclassified"
        dept = text(v["Department / Agency"])
        entity = "Partner Agency" if any(x in dept for x in ["SEPTA", "Philadelphia Gas Works", "Philadelphia Energy Authority"]) else "City of Philadelphia"
        amt = text(v["Cost Estimate Range"])
        low, high = amount_range(amt)
        codes = [text(v.get(k)) for k in ("NIGP Code", "NAICS Code") if text(v.get(k)) not in ("", "TBD", "N/A")]
        records.append(record(f"forecast-2026-fall-{i+1:03}", title=text(v["Project Name"]), description=text(v["Scope of Work / Description"]), category=cat, department=department(dept), stage="Forecast", source="Fall 2026 Procurement Forecast", source_id="forecast", source_url="https://www.phila.gov/documents/future-contracting-opportunities/", reference=f"Fall 2026 · Row {i+3}", anticipated=date(v["Estimated Solicitation Advertisement(Month-Year)"]), service_type=proc, amount_low=low, amount_high=high, amount_basis="Forecast Range" if high is not None else "Not Published", amount_label=amt or "Not Published", codes=codes, subcontracting=text(v["Potential Subcontracting Opportunites"]), entity=entity, snapshot="Fall 2026"))
    source("forecast", "Fall 2026 Procurement Forecast", "https://www.phila.gov/documents/future-contracting-opportunities/", len(forecast), "Fall 2026 · Anticipated work, subject to change", "Includes separate City departments and partner agencies. Ambiguous procurement types stay unclassified. Similar project names are retained because they can represent separate trades / solicitations.")
    history = list(csv.DictReader(io.StringIO(blobs["commodities-history"].decode("utf-8-sig"))))
    for i, v in enumerate(history):
        val = money(v["Contract_Amount"])
        records.append(record(f"commodities-2016q1-{i+1:04}", title=text(v["Contract_Description"]), description=text(v["Contract_Description"]), category="Public Works" if v["Contract_Type"] == "PW" else "Services, Supplies & Equipment", department=department(v["Department_Name"]), stage="Historical Snapshot", source="Commodities · FY2016 Q1", source_id="commodities", source_url=URLS["commodities-history"], reference=text(v["Contract_Number"]), vendor=text(v["Vendor_Name"]), start=date(v["Start_Date"]), end=date(v["End_Date"]), amount_low=val, amount_high=val, amount_basis="Historical Contract Amount", amount_label=text(v["Contract_Amount"]), snapshot="FY2016 Q1", service_type=text(v["Contract_Type"])))
    source("commodities", "Commodities · FY2016 Q1", "https://opendataphilly.org/datasets/commodities-contracts/", len(history), "FY2016 Q1 · Historical snapshot", "Historical contracts renewed or paid in the reported quarter. This is not a current active-contract register. Amounts and transaction fields must not be presented as current spending.")
    districts = json.loads(blobs["districts"])
    if len(districts.get("features", [])) != 10:
        raise ValueError("Expected all 10 council districts")
    capital = json.loads(blobs["capital-data"])["rows"]
    projects = []
    for v in capital:
        lat, lon = v.get("lat"), v.get("lon")
        if lat is None or lon is None or not (-76 < lon < -74 and 39 < lat < 41):
            continue
        projects.append(dict(id=str(v["cartodb_id"]), project_number=v.get("project_number"), title=v.get("project_name"), site=v.get("site_name"), address=v.get("site_address"), district=str(v.get("council_district") or ""), lon=lon, lat=lat, status=v.get("project_status"), scope=v.get("project_scope"), source_url="https://www.phila.gov/capital-projects-finder/"))
    # Conservative, documented facility associations. Coordinates identify the named
    # facility, not a verified construction footprint or supplier headquarters.
    facility_rules = [(r"\bdell\s+(?:music|musici)\s+center\b", "Robin Hood Dell Music Center East"), (r"\bsimons\s+(?:rec|recreation)\b", "Simons Recreation Center")]
    for r in records:
        searchable = r["title"]+" "+r["description"]
        for pattern, facility in facility_rules:
            if re.search(pattern, searchable, re.I):
                site = next((p for p in projects if p["site"] == facility), None)
                if site:
                    r["location"] = dict(lon=site["lon"], lat=site["lat"], district=district_for(site["lon"],site["lat"],districts), label=site["site"], address=site["address"], basis="Named Facility Association", source_url=site["source_url"])
                break
    source("capital", "Capital Projects Finder · Context", "https://www.phila.gov/capital-projects-finder/", len(projects), "Public project-location listing", "Separate map context. A capital project is not automatically an open procurement. Facility associations are labeled; unlocated records remain searchable.", "Project-location rows")
    source("districts", "City Council Districts · 2024", "https://opendataphilly.org/datasets/city-council-districts/", len(districts["features"]), "2024 council boundaries", "Official City polygons. District filtering applies only to records with an identified facility location.", "Districts")
    ids = [r["id"] for r in records]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate normalized record ID")
    counts = dict(collections.Counter(r["stage"] for r in records))
    bundle = dict(schema_version=1, as_of=ASOF.isoformat(timespec="seconds"), as_of_date=TODAY, title="Philadelphia Procurement Intelligence Command Center", coverage="Public-source proof of concept. Citywide completeness is not yet verified.", record_unit="Procurement source records; not a deduplicated count of all City contracts", records=records, sources=sources, stage_counts=counts, gaps=["Current PHLContracts executed / blanket contract register is not yet integrated.", "Special-process RFP/RFI postings and PennDOT ECMS are not yet ingested.", "The professional-services listing is a vendor / term register and does not publish values for every row.", "Most procurement records do not publish verified project coordinates; they remain in the explorer.", "Forecast records are not automatically merged with solicitations without a confirmed identifier link."], projects=projects)
    # Write only after every required source and count validation succeeds.
    encoded = json.dumps(bundle, ensure_ascii=False, separators=(",", ":")).encode()
    (CACHE/"normalized-records.json").write_bytes(encoded)
    (OUT/"records.json.gz").write_bytes(gzip.compress(encoded, mtime=0))
    (OUT/"records.json").unlink(missing_ok=True)
    (OUT/"districts.geojson").write_text(json.dumps(districts, separators=(",", ":")))
    print(json.dumps(dict(records=len(records), stages=counts, sources=len(sources), projects=len(projects), mapped=sum(bool(r["location"]) for r in records)), indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cached", action="store_true", help="Use the exact locally cached public inputs")
    main(parser.parse_args().cached)
