import json
import csv
from typing import List, Dict, Any

def load_json(file_path: str) -> Dict[str, Any]:
    """Load JSON data from a file."""
    with open(file_path, 'r') as file:
        return json.load(file)

def find_field(fields: List[Dict[str, Any]], code: str, name: str = None, identifier: str = None) -> Any:
    """Find a field value by code and optional name or identifier, case-insensitive."""
    code_lower = code.lower()
    name_lower = name.lower() if name else None
    identifier_lower = identifier.lower() if identifier else None

    for field in fields:
        field_code = field.get('code', '').lower()
        field_name = field.get('name', '').lower()
        field_identifier = field.get('identifier', '').lower()

        if field_code == code_lower:
            name_match = (name_lower is None or 
                         (field_name == name_lower if field_name else False) or 
                         (field_identifier == name_lower if field_identifier else False))
            identifier_match = (identifier_lower is None or 
                              (field_identifier == identifier_lower if field_identifier else False) or 
                              (field_name == identifier_lower if field_name else False))

            if name_match and identifier_match:
                return field.get('value', '')
    return ''

def parse_weight(weight: Any) -> float:
    """Convert weight to float, handling percentage strings and empty values."""
    if not weight:
        return 0.0
    if isinstance(weight, str) and weight.endswith('%'):
        try:
            return float(weight.strip('%')) / 100
        except ValueError:
            return 0.0
    try:
        return float(weight)
    except (ValueError, TypeError):
        return 0.0

def format_weight(weight: float) -> str:
    """Format weight as a decimal string with three decimal places."""
    return f"{weight:.3f}"

def process_esg_data(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Process JSON data and return quantitative ESG data with calculated Influence and Qualitative Adjustment."""
    company_name = data.get('name', '')
    esg_score = data.get('esgAdjustedScore', '')

    rows = []

    has_governance = any(child.get('name', '').lower() == 'governance' for child in data.get('children', []) if child.get('type') == 'ESGPILLAR')
    if not has_governance:
        print("Warning: No Governance pillar found in the JSON data for quantitative processing.")

    for pillar in data.get('children', []):
        if pillar.get('type') == 'ESGPILLAR':
            pillar_name = pillar.get('name', '')
            pillar_score = find_field(pillar.get('fields', []), 'AdjustedBroadenedScore')
            pillar_weight_str = find_field(pillar.get('fields', []), 'Weight')
            pillar_weight = parse_weight(pillar_weight_str)
            pillar_influence = pillar_weight  # Pillar Influence = Pillar Weight

            for kpi_child in pillar.get('children', []):
                if kpi_child.get('type') == 'ESGKPI':
                    kpi_name = kpi_child.get('name', '')
                    kpi_score = find_field(kpi_child.get('fields', []), 'Score')
                    kpi_weight_str = find_field(kpi_child.get('fields', []), 'Weight')
                    kpi_weight = parse_weight(kpi_weight_str)
                    kpi_influence = (pillar_weight * kpi_weight) if kpi_weight != 0 else 0.0  # KPI Influence = Pillar Weight * KPI Weight

                    # Find Qualitative Adjustment from ESGSCOREADJUSTMENT
                    qualitative_adjustment = ''
                    for child in kpi_child.get('children', []):
                        if child.get('type') == 'ESGSCOREADJUSTMENT':
                            qualitative_adjustment = find_field(child.get('fields', []), 'Value')
                            break

                    has_quantitative_indicators = False
                    for indicator_child in kpi_child.get('children', []):
                        if indicator_child.get('type') == 'ESGQUANTITATIVE':
                            has_quantitative_indicators = True
                            for sub_indicator in indicator_child.get('children', []):
                                if sub_indicator.get('type') == 'ESGINDICATOR':
                                    indicator_name = sub_indicator.get('name', '')
                                    indicator_score = find_field(sub_indicator.get('fields', []), 'Score')
                                    indicator_weight_str = find_field(sub_indicator.get('fields', []), 'Weight')
                                    indicator_weight = parse_weight(indicator_weight_str)
                                    indicator_influence = (kpi_influence * indicator_weight) if indicator_weight != 0 else 0.0  # Indicator Influence = KPI Influence * Indicator Weight

                                    rows.append({
                                        'Company Name': company_name, 'ESGScore': esg_score,
                                        'Pillar Name': pillar_name, 'Pillar Score': pillar_score,
                                        'Pillar Weight': format_weight(pillar_weight),
                                        'Pillar Influence': format_weight(pillar_influence),
                                        'KPI Name': kpi_name, 'KPI Score': kpi_score,
                                        'KPI Weight': format_weight(kpi_weight),
                                        'KPI Influence': format_weight(kpi_influence),
                                        'Qualitative Adjustment': qualitative_adjustment,
                                        'Indicator Name': indicator_name, 'Indicator Score': indicator_score,
                                        'Indicator Weight': format_weight(indicator_weight),
                                        'Indicator Influence': format_weight(indicator_influence)
                                    })

                    if not has_quantitative_indicators:
                        rows.append({
                            'Company Name': company_name, 'ESGScore': esg_score,
                            'Pillar Name': pillar_name, 'Pillar Score': pillar_score,
                            'Pillar Weight': format_weight(pillar_weight),
                            'Pillar Influence': format_weight(pillar_influence),
                            'KPI Name': kpi_name, 'KPI Score': kpi_score,
                            'KPI Weight': format_weight(kpi_weight),
                            'KPI Influence': format_weight(kpi_influence),
                            'Qualitative Adjustment': qualitative_adjustment,
                            'Indicator Name': '', 'Indicator Score': '', 'Indicator Weight': '',
                            'Indicator Influence': ''
                        })

    return rows

def process_esg_qualitative_data(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Process JSON data and return qualitative ESG data, excluding Influence for KPIs and Indicators."""
    company_name = data.get('name', '')
    esg_score = data.get('esgAdjustedScore', '')

    rows = []

    has_governance = any(child.get('name', '').lower() == 'governance' for child in data.get('children', []) if child.get('type') == 'ESGPILLAR')
    if not has_governance:
        print("Warning: No Governance pillar found in the JSON data for qualitative processing.")

    for pillar in data.get('children', []):
        if pillar.get('type') == 'ESGPILLAR':
            pillar_name = pillar.get('name', '')
            pillar_score = find_field(pillar.get('fields', []), 'AdjustedBroadenedScore')
            pillar_weight_str = find_field(pillar.get('fields', []), 'Weight')
            pillar_weight = parse_weight(pillar_weight_str)
            pillar_influence = pillar_weight  # Pillar Influence = Pillar Weight

            for kpi_child in pillar.get('children', []):
                if kpi_child.get('type') == 'ESGKPI':
                    kpi_name = kpi_child.get('name', '')
                    kpi_score = find_field(kpi_child.get('fields', []), 'Score')
                    kpi_weight_str = find_field(kpi_child.get('fields', []), 'Weight')
                    kpi_weight = parse_weight(kpi_weight_str)

                    has_qualitative_indicators = False
                    for indicator_child in kpi_child.get('children', []):
                        if indicator_child.get('type') == 'ESGQUALITATIVE':
                            has_qualitative_indicators = True
                            for sub_indicator in indicator_child.get('children', []):
                                if sub_indicator.get('type') == 'ESGINDICATOR':
                                    indicator_name = sub_indicator.get('name', '')
                                    indicator_score = find_field(sub_indicator.get('fields', []), 'Score')
                                    indicator_weight_str = find_field(sub_indicator.get('fields', []), 'Weight')
                                    indicator_weight = parse_weight(indicator_weight_str)

                                    rows.append({
                                        'Company Name': company_name, 'ESGScore': esg_score,
                                        'Pillar Name': pillar_name, 'Pillar Score': pillar_score,
                                        'Pillar Weight': format_weight(pillar_weight),
                                        'Pillar Influence': format_weight(pillar_influence),
                                        'KPI Name': kpi_name, 'KPI Score': kpi_score,
                                        'KPI Weight': format_weight(kpi_weight),
                                        'Indicator Name': indicator_name, 'Indicator Score': indicator_score,
                                        'Indicator Weight': format_weight(indicator_weight)
                                    })

                    if not has_qualitative_indicators:
                        rows.append({
                            'Company Name': company_name, 'ESGScore': esg_score,
                            'Pillar Name': pillar_name, 'Pillar Score': pillar_score,
                            'Pillar Weight': format_weight(pillar_weight),
                            'Pillar Influence': format_weight(pillar_influence),
                            'KPI Name': kpi_name, 'KPI Score': kpi_score,
                            'KPI Weight': format_weight(kpi_weight),
                            'Indicator Name': '', 'Indicator Score': '', 'Indicator Weight': ''
                        })

    return rows

def process_critical_issues(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Flatten CRITICALISSUE data from CRITICALISSUESET into an in-memory table."""
    rows = []

    for child in data.get('children', []):
        if child.get('type') == 'CRITICALISSUESET':
            for issue in child.get('children', []):
                if issue.get('type') == 'CRITICALISSUE':
                    name = issue.get('name', '')
                    description = issue.get('description', '')
                    value = find_field(issue.get('fields', []), 'Value')
                    rows.append({
                        'Name': name, 'Description': description, 'Value': value
                    })

    return rows

def process_sdg_impact(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Flatten SDGIMPACT data under SDGTOTALIMPACT into an in-memory table."""
    rows = []

    for child in data.get('children', []):
        if child.get('type') == 'SDGTOTALIMPACT':
            esg_sdg_value = find_field(child.get('fields', []), 'Value', identifier='ESG_SDG_VALUE')

            for sdg_child in child.get('children', []):
                if sdg_child.get('type') == 'SDGIMPACT':
                    category = sdg_child.get('name', '')
                    overall_value = find_field(sdg_child.get('fields', []), 'value')

                    for detail_child in sdg_child.get('children', []):
                        if detail_child.get('type') == 'SDGIMPACTDETAIL':
                            impact_name = detail_child.get('name', '')
                            details = find_field(detail_child.get('fields', []), 'Details')
                            impact = find_field(detail_child.get('fields', []), 'Impact')
                            impact_measure = find_field(detail_child.get('fields', []), 'ImpactMeasure')
                            revenue_exposure = find_field(detail_child.get('fields', []), 'RevenueExposure')

                            rows.append({
                                'ESG_SDG_VALUE': esg_sdg_value, 'Category': category,
                                'OverallValue': overall_value, 'ImpactName': impact_name,
                                'Details': details, 'Impact': impact,
                                'ImpactMeasure': impact_measure, 'RevenueExposure': revenue_exposure
                            })

    return rows

def process_controversy_data(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Flatten ESGCONTROVERSYADJUSTMENT and CONTROVERSYEVENT data into an in-memory table."""
    rows = []

    for child in data.get('children', []):
        if child.get('type') == 'ESGCONTROVERSYADJUSTMENT':
            esg_controversies_value = find_field(child.get('fields', []), 'value', identifier='ESG_CONTROVERSIES_VALUE')

            for event in child.get('children', []):
                if event.get('type') == 'CONTROVERSYEVENT':
                    date = find_field(event.get('fields', []), 'Date')
                    penalty = find_field(event.get('fields', []), 'Penalty')
                    percentage_penalty = find_field(event.get('fields', []), 'PercentagePenalty')
                    severity = find_field(event.get('fields', []), 'Severity')
                    source_reach = find_field(event.get('fields', []), 'SourceReach')
                    environmental = find_field(event.get('fields', []), 'E')
                    social = find_field(event.get('fields', []), 'S')
                    governance = find_field(event.get('fields', []), 'G')

                    rows.append({
                        'ESG_CONTROVERSIES_VALUE': esg_controversies_value, 'Date': date,
                        'Penalty': penalty, 'PercentagePenalty': percentage_penalty,
                        'Severity': severity, 'SourceReach': source_reach,
                        'Environmental': environmental, 'Social': social, 'Governance': governance
                    })

    return rows

def process_esg_controversy_adjustments(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Flatten ESGCONTROVERSYADJUSTMENT details under ESGPILLAR into an in-memory table."""
    rows = []

    for pillar in data.get('children', []):
        if pillar.get('type') == 'ESGPILLAR':
            pillar_name = pillar.get('name', '')

            for controversy in pillar.get('children', []):
                if controversy.get('type') == 'ESGCONTROVERSYADJUSTMENT':
                    pillar_adjustment = find_field(controversy.get('fields', []), 'value')

                    for detail in controversy.get('children', []):
                        if detail.get('type') == 'ESGCONTROVERSYADJUSTMENT':
                            item_description = detail.get('name', '')
                            item_score = find_field(detail.get('fields', []), 'Value')
                            item_weight = find_field(detail.get('fields', []), 'Weight')
                            item_year = find_field(detail.get('fields', []), 'Year')

                            rows.append({
                                'Pillar': pillar_name, 'PillarAdjustment': pillar_adjustment,
                                'ItemDescription': item_description, 'ItemScore': item_score,
                                'ItemWeight': item_weight, 'ItemYear': item_year
                            })

    return rows

def write_table_to_csv(table: List[Dict[str, Any]], output_file: str):
    """Write an in-memory table to a CSV file."""
    if not table:
        return
    headers = table[0].keys()
    with open(output_file, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        writer.writerows(table)

def generate_markdown_report(
    company_name: str,
    esg_data: List[Dict[str, Any]],
    esg_qualitative_data: List[Dict[str, Any]],
    sdg_data: List[Dict[str, Any]],
    controversy_data: List[Dict[str, Any]],
    controversy_adjustments: List[Dict[str, Any]],
    critical_issues_data: List[Dict[str, Any]],
    write_to_file: bool = False
) -> str:
    """Generate a concise table-based Markdown report with sorted KPIs, Indicators, and pillar-level controversies."""
    md_content = [f"# ESG Report: {company_name}", ""]

    # Company Metrics (single row)
    esg_score = esg_data[0].get('ESGScore', '') if esg_data else ''
    controversy_adj = controversy_data[0].get('ESG_CONTROVERSIES_VALUE', '') if controversy_data else ''
    sdg_impact = sdg_data[0].get('ESG_SDG_VALUE', '') if sdg_data else ''
    if esg_score or controversy_adj or sdg_impact:
        md_content.append("## Company Metrics")
        md_content.append("| ESG Score | Controversy Adjustment | SDG Impact |")
        md_content.append("|-----------|------------------------|------------|")
        md_content.append(f"| {esg_score} | {controversy_adj} | {sdg_impact} |")
        md_content.append("")

    # Pillars and KPIs
    pillars = sorted(set(row['Pillar Name'] for row in esg_data if row['Pillar Name']))
    for pillar in pillars:
        pillar_rows = [row for row in esg_data if row['Pillar Name'] == pillar]
        if not pillar_rows:
            continue

        md_content.append(f"## Pillar: {pillar}")
        md_content.append("| Name | Score | Weight | Influence | Controversy Adjustment |")
        md_content.append("|------|-------|--------|----------|------------------------|")
        pillar_row = next((row for row in pillar_rows if row['KPI Name']), {})
        adj = next((row['PillarAdjustment'] for row in controversy_adjustments if row['Pillar'] == pillar), '')
        md_content.append(
            f"| {pillar} | {pillar_row.get('Pillar Score', '')} | {pillar_row.get('Pillar Weight', '')} | "
            f"{pillar_row.get('Pillar Influence', '')} | {adj} |"
        )
        md_content.append("")

        # Pillar Controversy Adjustments
        pillar_controversies = [row for row in controversy_adjustments if row['Pillar'] == pillar]
        if pillar_controversies:
            md_content.append("### Pillar Controversy Adjustments")
            md_content.append("| ID | Pillar | Description | Score | Weight | Year |")
            md_content.append("|----|--------|-------------|-------|--------|------|")
            for i, row in enumerate(pillar_controversies, 1):
                md_content.append(
                    f"| C{i} | {row['Pillar']} | {row['ItemDescription']} | {row['ItemScore']} | "
                    f"{row['ItemWeight']} | {row['ItemYear']} |"
                )
            md_content.append("")

        # KPIs (Quantitative, sorted by Influence descending)
        kpi_rows = [row for row in esg_data if row['Pillar Name'] == pillar and row['KPI Name']]
        kpis_with_influence = [(row['KPI Name'], float(row['KPI Influence'])) for row in kpi_rows]
        unique_kpis = {name: influence for name, influence in kpis_with_influence}  # Keep highest influence
        kpis = [name for name, influence in sorted(unique_kpis.items(), key=lambda x: x[1], reverse=True)]
        if kpis:
            md_content.append("### KPIs")
            md_content.append("| Name | Score | Weight | Influence | Qualitative Adjustment |")
            md_content.append("|------|-------|--------|----------|-----------------------|")
            for kpi in kpis:
                kpi_rows = [row for row in esg_data if row['Pillar Name'] == pillar and row['KPI Name'] == kpi]
                if kpi_rows:
                    kpi_row = kpi_rows[0]
                    qual_adj = kpi_row.get('Qualitative Adjustment', '')
                    md_content.append(
                        f"| {kpi} | {kpi_row.get('KPI Score', '')} | {kpi_row.get('KPI Weight', '')} | "
                        f"{kpi_row.get('KPI Influence', '')} | {qual_adj} |"
                    )
            md_content.append("")

        # Quantitative Indicators (sorted by KPI ascending, Influence descending)
        quant_rows = [
            row for row in esg_data
            if row['Pillar Name'] == pillar and row['Indicator Name']
        ]
        quant_rows = sorted(quant_rows, key=lambda x: (x['KPI Name'], -float(x['Indicator Influence'])))
        if quant_rows:
            md_content.append("### Quantitative Indicators")
            md_content.append("| KPI | Name | Score | Weight | Influence |")
            md_content.append("|-----|------|-------|--------|----------|")
            for row in quant_rows:
                md_content.append(
                    f"| {row['KPI Name']} | {row['Indicator Name']} | {row['Indicator Score']} | "
                    f"{row['Indicator Weight']} | {row['Indicator Influence']} |"
                )
            md_content.append("")

        # Qualitative Indicators (sorted by KPI ascending, Weight descending)
        qual_rows = [
            row for row in esg_qualitative_data
            if row['Pillar Name'] == pillar and row['Indicator Name']
        ]
        qual_rows = sorted(qual_rows, key=lambda x: (x['KPI Name'], -float(x['Indicator Weight'])))
        if qual_rows:
            md_content.append("### Qualitative Indicators")
            md_content.append("| KPI | Name | Score | Weight |")
            md_content.append("|-----|------|-------|--------|")
            for row in qual_rows:
                md_content.append(
                    f"| {row['KPI Name']} | {row['Indicator Name']} | {row['Indicator Score']} | "
                    f"{row['Indicator Weight']} |"
                )
            md_content.append("")

    # Global Controversies
    if controversy_adjustments:
        md_content.append("## Controversies")
        md_content.append("| ID | Pillar | Description | Score | Weight | Year |")
        md_content.append("|----|--------|-------------|-------|--------|------|")
        for i, row in enumerate(controversy_adjustments, 1):
            md_content.append(
                f"| C{i} | {row['Pillar']} | {row['ItemDescription']} | {row['ItemScore']} | "
                f"{row['ItemWeight']} | {row['ItemYear']} |"
            )
        md_content.append("")

    # SDG Impacts
    if sdg_data:
        md_content.append("## SDG Impacts")
        md_content.append("| Category | Name | Details | Impact | Measure | Revenue Exposure |")
        md_content.append("|----------|------|---------|--------|---------|------------------|")
        for row in sdg_data:
            md_content.append(
                f"| {row['Category']} | {row['ImpactName']} | {row['Details']} | {row['Impact']} | "
                f"{row['ImpactMeasure']} | {row['RevenueExposure']} |"
            )
        md_content.append("")

    # Controversy Events
    if controversy_data:
        md_content.append("## Controversy Events")
        md_content.append("| ID | Date | Penalty | % Penalty | Severity | Source | E | S | G |")
        md_content.append("|----|------|---------|-----------|----------|--------|---|---|---|")
        for i, row in enumerate(controversy_data, 1):
            md_content.append(
                f"| E{i} | {row['Date']} | {row['Penalty']} | {row['PercentagePenalty']} | "
                f"{row['Severity']} | {row['SourceReach']} | {row['Environmental']} | "
                f"{row['Social']} | {row['Governance']} |"
            )
        md_content.append("")

    # Critical Issues
    if critical_issues_data:
        md_content.append("## Critical Issues")
        md_content.append("| ID | Name | Description | Value |")
        md_content.append("|----|------|-------------|-------|")
        for i, row in enumerate(critical_issues_data, 1):
            md_content.append(
                f"| I{i} | {row['Name']} | {row['Description']} | {row['Value']} |"
            )
        md_content.append("")

    # Output Markdown to console
    print('\n'.join(md_content))

    # Optionally write Markdown to file
    if write_to_file and len(md_content) > 2:  # More than header and blank line
        with open('company_esg_report.md', 'w') as md_file:
            md_file.write('\n'.join(md_content))
            print("Markdown report 'company_esg_report.md' has been saved.")

    return '\n'.join(md_content)

def main(write_to_file: bool = False):
    """Process JSON data and generate reports."""
    input_file = '..//SampleData//Disney.json'
    esg_output_file = 'esg_data.csv'
    esg_qualitative_output_file = 'esg_qualitative_data.csv'
    critical_output_file = 'critical_issues.csv'
    sdg_output_file = 'sdg_impact.csv'
    controversy_output_file = 'controversy_data.csv'
    controversy_adjustments_output_file = 'esg_controversy_adjustments.csv'

    try:
        data = load_json(input_file)
        company_name = data.get('name', 'Unknown Company')

        # Process all data in memory
        esg_data = process_esg_data(data)
        esg_qualitative_data = process_esg_qualitative_data(data)
        critical_issues_data = process_critical_issues(data)
        sdg_data = process_sdg_impact(data)
        controversy_data = process_controversy_data(data)
        controversy_adjustments_data = process_esg_controversy_adjustments(data)

        # Write to CSV files if requested
        if write_to_file:
            if esg_data:
                write_table_to_csv(esg_data, esg_output_file)
                print(f"Quantitative ESG data CSV '{esg_output_file}' has been generated.")
            if esg_qualitative_data:
                write_table_to_csv(esg_qualitative_data, esg_qualitative_output_file)
                print(f"Qualitative ESG data CSV '{esg_qualitative_output_file}' has been generated.")
            if critical_issues_data:
                write_table_to_csv(critical_issues_data, critical_output_file)
                print(f"Critical issues CSV '{critical_output_file}' has been generated.")
            if sdg_data:
                write_table_to_csv(sdg_data, sdg_output_file)
                print(f"SDG impact CSV '{sdg_output_file}' has been generated.")
            if controversy_data:
                write_table_to_csv(controversy_data, controversy_output_file)
                print(f"Controversy data CSV '{controversy_output_file}' has been generated.")
            if controversy_adjustments_data:
                write_table_to_csv(controversy_adjustments_data, controversy_adjustments_output_file)
                print(f"Controversy adjustments CSV '{controversy_adjustments_output_file}' has been generated.")

        # Generate Markdown report
        generate_markdown_report(
            company_name, esg_data, esg_qualitative_data, sdg_data,
            controversy_data, controversy_adjustments_data, critical_issues_data,
            write_to_file=write_to_file
        )

    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found. Please check the path.")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in '{input_file}'.")

if __name__ == '__main__':
    main(write_to_file=True)