# weekly_report.py

import json
import os
import argparse

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # non-GUI backend
import matplotlib.pyplot as plt

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle,
    PageBreak,
    Frame,
    PageTemplate,
    NextPageTemplate
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime

# ==========================================
# CONSTANTS & TEXTS
# ==========================================
REPORT_TEXTS = {
    "methodology": """
    <b>Historical Data Source:</b> <i>ultimate_combined_data.csv</i> containing past confirmed dengue cases.<br/>
    <b>Prediction Source:</b> Machine-learning generated grid risk (<i>heatmap_data.json</i>).<br/>
    <b>Hotspot Definition:</b> Any grid point with a predicted risk probability > 0 (inclusive of all detected risks).<br/>
    <b>Spatial Resolution:</b> ~500m Grid-based latitude/longitude cells.<br/>
    <b>Time Resolution:</b> ISO Weekly predictions.
    """,
    "risk_interpretation": """
    <b>Environmental Factors:</b> High risk is often correlated with urban density and recent rainfall patterns.<br/>
    <b>Implications:</b> Areas flagged as "High" or "Medium" risk require immediate attention for mosquito breeding site inspections.<br/>
    <b>Surveillance:</b> Public health teams should prioritize these clusters for early intervention.
    """,
    "recommendations": """
    <b>For Authorities:</b><br/>
    - Conduct targeted fogging in the identified hotspot grids.<br/>
    - Increase surveillance and larviciding in emerging danger zones.<br/>
    - Launch localized public awareness campaigns.<br/><br/>
    <b>For Public:</b><br/>
    - Inspect home compounds for stagnant water (mosquito breeding sites).<br/>
    - Use mosquito repellent and wear long-sleeved clothing.<br/>
    - Seek early medical attention if experiencing fever or joint pain.
    """,
    "limitations": """
    - <b>Prediction Model:</b> Depends on historical patterns; sudden environmental shifts may not be fully captured.<br/>
    - <b>Risk ≠ Cases:</b> A high risk score indicates probability, not a guaranteed outbreak.<br/>
    - <b>Approximation:</b> Environmental variables are approximated for grid locations.<br/>
    - <b>Human Movement:</b> The model does not currently account for daily human mobility patterns.
    """,
    "appendix": """
    <b>Weight:</b> The raw probability score from the machine learning model (scaled 0-10).<br/>
    <b>Grid Resolution:</b> The map is divided into fine-grained cells to detect micro-clusters.<br/>
    <b>Model Accuracy:</b> Based on training validation against historical outbreak data.
    """
}


# ==========================================
# 1. LOAD HISTORICAL DATA
# ==========================================
def load_historical_data(csv_path: str = "ultimate_combined_data.csv") -> pd.DataFrame:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    df = pd.read_csv(csv_path)
    if "Week" not in df.columns:
        raise ValueError("CSV must contain a 'Week' column.")
    if "Address" not in df.columns:
        print("Warning: 'Address' column not found in CSV. Place names will be unavailable.")
        df["Address"] = "Unknown"
    return df


# ==========================================
# 2. LOAD PREDICTION JSON
# ==========================================
def load_predictions(json_path: str) -> pd.DataFrame:
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Prediction JSON not found: {json_path}")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    # Expect list of {"lat": ..., "lng": ..., "weight": ...}
    pred_df = pd.DataFrame(data)
    required_cols = {"lat", "lng", "weight"}
    if not required_cols.issubset(pred_df.columns):
        raise ValueError(f"Prediction JSON must contain keys: {required_cols}")
    return pred_df


# ==========================================
# 3. HOTSPOT DETECTION
# ==========================================
def detect_hotspots(pred_df: pd.DataFrame) -> pd.DataFrame:
    """Flag all points as hotspots since input JSON is already filtered > 0.2"""
    # Simply treat everything in the file as a "Hotspot" for reporting purposes
    # to match the visual heatmap.
    pred_df = pred_df.copy()
    pred_df["is_hotspot"] = True 
    pred_df["hotspot_threshold"] = 0.0
    return pred_df


# ==========================================
# 3.5 FIND NEAREST PLACE
# ==========================================
def find_nearest_places(pred_df: pd.DataFrame, hist_df: pd.DataFrame) -> pd.DataFrame:
    """Find nearest address from historical data for each predicted point."""
    if hist_df.empty or "Address" not in hist_df.columns:
        pred_df["nearest_place"] = "N/A"
        return pred_df

    # Extract clean coordinates
    hist_coords = hist_df[["Latitude", "Longitude"]].dropna().values
    hist_addrs = hist_df.loc[hist_df[["Latitude", "Longitude"]].dropna().index, "Address"].values

    if len(hist_coords) == 0:
        pred_df["nearest_place"] = "N/A"
        return pred_df

    places = []
    
    def clean_address(addr: str) -> str:
        """Simplify address by removing detailed unit/road info."""
        if not isinstance(addr, str): return "N/A"
        parts = [p.strip() for p in addr.split(",")]
        cleaned = []
        for p in parts:
            lower_p = p.lower()
            # Skip unit/house numbers
            if lower_p.startswith(("no.", "no ", "unit", "lot", "block", "blk", "level", "apt", "flat")):
                continue
            # Skip road names
            if lower_p.startswith(("jalan", "jln", "lorong", "persiaran")):
                continue
            # Skip postcode/city (starts with 5 digits)
            if len(p) >= 5 and p[:5].isdigit():
                continue
                
            cleaned.append(p)
        
        if not cleaned:
            return " ".join(addr.split()).title() # Fallback with cleanup
            
        # Join, normalize whitespace in parts, and convert to Title Case
        return ", ".join([" ".join(c.split()) for c in cleaned]).title()

    for _, row in pred_df.iterrows():
        p_lat, p_lng = row["lat"], row["lng"]
        # Euclidean distance approximation (sufficient for local ranking)
        dists = np.sqrt(
            (hist_coords[:, 0] - p_lat) ** 2 + (hist_coords[:, 1] - p_lng) ** 2
        )
        min_idx = np.argmin(dists)
        raw_addr = hist_addrs[min_idx]
        places.append(clean_address(raw_addr))
    
    pred_df["nearest_place"] = places
    return pred_df


# ==========================================
# 4. GROUP HOTSPOTS
# ==========================================
def group_hotspots(df: pd.DataFrame) -> pd.DataFrame:
    """Group grid points by nearest place name."""
    if df.empty: return df
    
    # Group by place name
    grouped = df.groupby("nearest_place").agg({
        "weight": "max",      # Take the peak risk in the area
        "lat": "mean",        # Center of the cluster
        "lng": "mean",
        "is_hotspot": "count" # Count number of grids
    }).reset_index()
    
    # Rename for clarity
    grouped = grouped.rename(columns={"is_hotspot": "grid_count"})
    grouped = grouped.sort_values("weight", ascending=False)
    
    return grouped


# ==========================================
# 5. PLOT WEEKLY TREND
# ==========================================
def plot_weekly_trend(df: pd.DataFrame, current_week: int, out_path: str, hist_days: int = 0):
    # Ensure Date parsing
    if "Visit_Date" in df.columns:
        df["dt"] = pd.to_datetime(df["Visit_Date"], format="%m/%d/%Y", errors="coerce")
        df["Year"] = df["dt"].dt.year
        df = df.dropna(subset=["dt"])

        # Determine reference date (End of Current Week)
        # Assuming current_week is for the latest year in the dataset
        max_year = df["Year"].max()
        if pd.isna(max_year): max_year = 2025 # Fallback
        
        # Approximate date for the given week (using ISO calendar)
        # Week 1 usually starts near Jan 1-4. Simple approx:
        week_start_date = pd.Timestamp(f"{max_year}-01-01") + pd.to_timedelta(current_week * 7, unit="D")
        
        # If hist_days is specified, filter range
        if hist_days > 0:
            start_date = week_start_date - pd.to_timedelta(hist_days, unit="D")
            df = df[(df["dt"] >= start_date) & (df["dt"] <= week_start_date)]
            
            # For short ranges (< 30 days), plot DAILY trend
            if hist_days <= 30:
                 daily_counts = df.groupby("dt").size().sort_index()
                 
                 plt.figure(figsize=(8, 4))
                 plt.plot(daily_counts.index, daily_counts.values, marker="o", linestyle="-")
                 plt.title(f"Daily Dengue Trend (Last {hist_days} Days)")
                 plt.xlabel("Date")
                 plt.ylabel("Cases")
                 plt.gcf().autofmt_xdate() # Rotate dates
                 plt.tight_layout()
                 plt.savefig(out_path, dpi=150)
                 plt.close()
                 return # Done, exit early for daily mode

        # Fallback to WEEKLY view (for "All" or long ranges)
        # Filter for latest year only if not already filtered strict range
        elif pd.notna(max_year): 
             df = df[df["Year"] == max_year]
            
    weekly_counts = df.groupby("Week").size().sort_index()
    weekly_counts = weekly_counts.loc[:current_week]  # Filter up to current week

    plt.figure(figsize=(8, 4))
    plt.plot(weekly_counts.index, weekly_counts.values, marker="o")
    
    # Vertical line for week
    plt.axvline(current_week, color="red", linestyle="--", label=f"Week {current_week}")

    # Horizontal line for cases
    if current_week in weekly_counts.index:
        current_val = weekly_counts[current_week]
        plt.axhline(current_val, color="blue", linestyle=":", label=f"Cases: {current_val}")
    
    plt.title(f"Weekly Dengue Case Trend ({int(max_year) if 'max_year' in locals() else 'Historical'})")
    plt.xlabel("Week")
    plt.ylabel("Total Confirmed Cases")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()


# ==========================================
# 6. PLOT PREDICTION MAP
# ==========================================
def plot_prediction_map(pred_df: pd.DataFrame, out_path: str):
    plt.figure(figsize=(6, 6))

    # Non-hotspot points
    non_hot = pred_df[~pred_df["is_hotspot"]]
    hot = pred_df[pred_df["is_hotspot"]]

    if not non_hot.empty:
        plt.scatter(
            non_hot["lng"],
            non_hot["lat"],
            s=30,
            alpha=0.4,
            label="Predicted Normal Area",
        )

    if not hot.empty:
        plt.scatter(
            hot["lng"],
            hot["lat"],
            s=50,
            alpha=0.8,
            color="red",
            label="Predicted Hotspot",
        )

    plt.title("Predicted Dengue Risk Map (Grids)")
    plt.xlabel("Longitude")
    plt.ylabel("Latitude")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()


# ==========================================
# HELPER: RISK LEVEL
# ==========================================
def get_risk_level(weight):
    if weight >= 8.0: return "CRITICAL"
    if weight >= 5.0: return "HIGH"
    if weight >= 2.0: return "MEDIUM"
    return "LOW"


# ==========================================
# 7. BUILD PROFESSIONAL PDF REPORT
# ==========================================
def build_pdf_report(
    week: int,
    start_df: pd.DataFrame, # Original detailed DF for stats
    grouped_df: pd.DataFrame, # Grouped DF for table
    trend_img_path: str,
    map_img_path: str,
    output_pdf: str,
):
    doc = SimpleDocTemplate(output_pdf, pagesize=A4)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    style_title = styles["Title"]
    style_heading = styles["Heading2"]
    style_normal = styles["Normal"]
    style_normal.leading = 14 # More line spacing
    
    story = []

    # --- 1. COVER PAGE ---
    story.append(Spacer(1, 2 * inch))
    story.append(Paragraph("Dengue Weekly Hotspot & Risk Report", style_title))
    story.append(Spacer(1, 0.5 * inch))
    story.append(Paragraph(f"Target Week: {week}, 2025", styles["Heading1"]))
    story.append(Paragraph(f"Area Covered: Kuala Lumpur, Malaysia", styles["Heading2"]))
    story.append(Spacer(1, 2 * inch))
    story.append(Paragraph(f"Generated By: Dengue Prediction System", style_normal))
    story.append(Paragraph(f"Date Generated: {datetime.now().strftime('%Y-%m-%d')}", style_normal))
    story.append(PageBreak())

    # --- 2. EXECUTIVE SUMMARY ---
    story.append(Paragraph("2. Executive Summary", style_heading))
    
    total_risk = float(start_df["weight"].sum())
    avg_risk = float(start_df["weight"].mean()) if not start_df.empty else 0
    max_risk = float(start_df["weight"].max()) if not start_df.empty else 0
    grid_count = len(start_df)
    
    summary_text = f"""
    For Week {week}, a total of <b>{grid_count}</b> hotspot grids were identified across the scanned area. 
    The total accumulated risk score is <b>{total_risk:.2f}</b>, with an average grid risk of <b>{avg_risk:.2f}</b>.
    The highest recorded risk intensity in a single grid is <b>{max_risk:.2f}</b>.
    <br/><br/>
    The report highlights critical clusters that require immediate public health attention.
    """
    story.append(Paragraph(summary_text, style_normal))
    story.append(Spacer(1, 12))

    # --- 3. DATA SOURCES & METHODOLOGY ---
    story.append(Paragraph("3. Data Sources & Methodology", style_heading))
    story.append(Paragraph(REPORT_TEXTS["methodology"], style_normal))
    story.append(Spacer(1, 12))

    # --- 4. HISTORICAL TREND ---
    story.append(Paragraph("4. Historical Dengue Trend", style_heading))
    if os.path.exists(trend_img_path):
        story.append(Image(trend_img_path, width=6 * inch, height=3.2 * inch))
    story.append(Spacer(1, 12))

    # --- 5. PREDICTED SPATIAL MAP ---
    story.append(Paragraph("5. Predicted Spatial Risk Map", style_heading))
    if os.path.exists(map_img_path):
        story.append(Image(map_img_path, width=6 * inch, height=5.5 * inch))
    story.append(PageBreak())

    # --- 6. HOTSPOT SUMMARY TABLE ---
    story.append(Paragraph("6. Hotspot Summary Table", style_heading))
    
    if grouped_df.empty:
        story.append(Paragraph("No hotspots detected for this week.", style_normal))
    else:
        # Columns: #, Location, Peak Risk, Risk Level, Grids
        table_data = [["#", "Location Area", "Peak Risk", "Risk Level", "Grids"]]
        
        for i, row in enumerate(grouped_df.itertuples(index=False), start=1):
            risk_lvl = get_risk_level(row.weight)
            table_data.append([
                str(i),
                str(row.nearest_place),
                f"{row.weight:.2f}",
                risk_lvl,
                str(row.grid_count)
            ])

        col_widths = [0.4 * inch, 3.2 * inch, 0.8 * inch, 1.0 * inch, 0.6 * inch]
        table = Table(table_data, colWidths=col_widths, hAlign="LEFT")
        
        # Style including dynamic color for Risk Level could be added here, keeping simple for now
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (2, 1), (-1, -1), "RIGHT"), # Risk Right
            ("ALIGN", (4, 1), (-1, -1), "CENTER"), # Grids Center
        ]))
        story.append(table)
    story.append(Spacer(1, 12))

    # --- 7. STATISTICAL SUMMARY ---
    story.append(Paragraph("7. Statistical Summary", style_heading))
    std_dev = start_df["weight"].std() if not start_df.empty else 0
    stats_text = f"""
    <b>Total Predicted Risk:</b> {total_risk:.2f}<br/>
    <b>Mean Risk:</b> {avg_risk:.2f}<br/>
    <b>Standard Deviation:</b> {std_dev:.2f}<br/>
    <b>Max Risk Score:</b> {max_risk:.2f}
    """
    story.append(Paragraph(stats_text, style_normal))
    story.append(Spacer(1, 12))

    # --- 8. COMPARISON (Placeholder) ---
    story.append(Paragraph("8. Comparison with Previous Weeks", style_heading))
    story.append(Paragraph("<i>Comparative analysis with previous week's prediction is currently unavailable in this version.</i>", style_normal))
    story.append(Spacer(1, 12))

    # --- 9. RISK INTERPRETATION ---
    story.append(Paragraph("9. Risk Interpretation & Implications", style_heading))
    story.append(Paragraph(REPORT_TEXTS["risk_interpretation"], style_normal))
    story.append(Spacer(1, 12))
    
    story.append(PageBreak())

    # --- 10. RECOMMENDATIONS ---
    story.append(Paragraph("10. Recommendations", style_heading))
    story.append(Paragraph(REPORT_TEXTS["recommendations"], style_normal))
    story.append(Spacer(1, 12))

    # --- 11. LIMITATIONS ---
    story.append(Paragraph("11. Limitations & Assumptions", style_heading))
    story.append(Paragraph(REPORT_TEXTS["limitations"], style_normal))
    story.append(Spacer(1, 12))

    # --- 12. APPENDIX ---
    story.append(Paragraph("12. Appendix", style_heading))
    story.append(Paragraph(REPORT_TEXTS["appendix"], style_normal))
    story.append(Spacer(1, 12))

    # Build PDF
    doc.build(story)
    print(f"✅ Professional PDF report generated: {output_pdf}")


# ==========================================
# 8. MAIN ENTRY
# ==========================================
def main():
    parser = argparse.ArgumentParser(
        description="Generate weekly dengue prediction & hotspot report PDF."
    )
    parser.add_argument(
        "--week",
        type=int,
        required=True,
        help="ISO week number of the prediction (e.g. 45)",
    )
    parser.add_argument(
        "--predictions",
        type=str,
        required=True,
        help="Path to JSON file with [{lat, lng, weight}, ...].",
    )
    parser.add_argument(
        "--csv",
        type=str,
        default="ultimate_combined_data.csv",
        help="Path to historical dengue CSV.",
    )
    parser.add_argument(
        "--outdir",
        type=str,
        default="reports",
        help="Output directory for PDF and images.",
    )
    parser.add_argument(
        "--hist_days",
        type=int,
        default=0,
        help="Number of days of history to show (7, 14, 28). 0 = All Year.",
    )

    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)

    # Load data
    hist_df = load_historical_data(args.csv)
    pred_df_raw = load_predictions(args.predictions)

    # 1. Detect Hotspots (Keep All)
    pred_df = detect_hotspots(pred_df_raw)
    
    # 2. Add Place Names
    pred_df = find_nearest_places(pred_df, hist_df)
    
    # 3. Group by Location
    grouped_df = group_hotspots(pred_df)

    # Plot images
    trend_img_path = os.path.join(args.outdir, f"week_{args.week}_trend.png")
    map_img_path = os.path.join(args.outdir, f"week_{args.week}_map.png")

    plot_weekly_trend(hist_df, args.week, trend_img_path, args.hist_days)
    plot_prediction_map(pred_df, map_img_path)

    # Build PDF
    output_pdf = os.path.join(args.outdir, f"dengue_week_{args.week}_report.pdf")
    build_pdf_report(args.week, pred_df, grouped_df, trend_img_path, map_img_path, output_pdf)


if __name__ == "__main__":
    main()
