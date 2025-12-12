# backend/reporting/weekly_report.py

import json
import os
import argparse

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle,
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch


# ==============================
# LOAD DATA
# ==============================
def load_csv(csv_path):
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV not found: {csv_path}")
    return pd.read_csv(csv_path)


def load_predictions(json_path):
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Prediction JSON not found: {json_path}")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return pd.DataFrame(data)


# ==============================
# HOTSPOT DETECTION
# ==============================
def detect_hotspots(df):
    mean_w = df["weight"].mean()
    std_w = df["weight"].std(ddof=0)
    threshold = mean_w + std_w

    df["is_hotspot"] = df["weight"] >= threshold
    df["threshold"] = threshold
    return df


# ==============================
# PLOTS
# ==============================
def plot_weekly_trend(hist_df, week, out_path):
    trend = hist_df.groupby("Week").size().sort_index()

    plt.figure(figsize=(8, 4))
    plt.plot(trend.index, trend.values, marker="o")
    plt.axvline(week, color="red", linestyle="--", label=f"Week {week}")
    plt.title("Weekly Dengue Case Trend (Historical)")
    plt.xlabel("Week")
    plt.ylabel("Total Cases")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()


def plot_hotspot_map(pred_df, out_path):
    plt.figure(figsize=(6, 6))

    normal = pred_df[~pred_df["is_hotspot"]]
    hotspot = pred_df[pred_df["is_hotspot"]]

    plt.scatter(normal["lng"], normal["lat"], s=30, alpha=0.4, label="Normal")
    plt.scatter(hotspot["lng"], hotspot["lat"], s=60, color="red", label="Hotspot")

    plt.title("Predicted Dengue Hotspot Map")
    plt.xlabel("Longitude")
    plt.ylabel("Latitude")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()


# ==============================
# PDF GENERATION
# ==============================
def build_pdf(week, pred_df, trend_img, map_img, out_pdf):
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(out_pdf, pagesize=A4)
    story = []

    story.append(Paragraph(
        f"Dengue Weekly Hotspot Report – Week {week}",
        styles["Title"]
    ))
    story.append(Spacer(1, 12))

    total_risk = pred_df["weight"].sum()
    avg_risk = pred_df["weight"].mean()
    hotspot_count = pred_df["is_hotspot"].sum()
    threshold = pred_df["threshold"].iloc[0]

    summary = [
        f"Total Predicted Risk: {total_risk:.2f}",
        f"Average Grid Risk: {avg_risk:.2f}",
        f"Hotspot Threshold (Mean + Std): {threshold:.2f}",
        f"Number of Hotspot Grids: {hotspot_count}",
    ]

    for line in summary:
        story.append(Paragraph(line, styles["Normal"]))

    story.append(Spacer(1, 12))

    story.append(Paragraph("Historical Weekly Trend", styles["Heading2"]))
    story.append(Image(trend_img, width=5.5 * inch, height=3 * inch))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Predicted Spatial Hotspots", styles["Heading2"]))
    story.append(Image(map_img, width=5.5 * inch, height=5 * inch))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Hotspot Grid Summary", styles["Heading2"]))

    hotspots = pred_df[pred_df["is_hotspot"]].sort_values("weight", ascending=False)

    if hotspots.empty:
        story.append(Paragraph("No hotspots detected.", styles["Normal"]))
    else:
        table_data = [["#", "Latitude", "Longitude", "Risk Weight"]]
        for i, r in enumerate(hotspots.itertuples(), start=1):
            table_data.append([i, f"{r.lat:.5f}", f"{r.lng:.5f}", f"{r.weight:.2f}"])

        table = Table(table_data)
        table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]))
        story.append(table)

    doc.build(story)


# ==============================
# MAIN
# ==============================
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--week", type=int, required=True)
    parser.add_argument("--predictions", default="public/heatmap_data.json")
    parser.add_argument("--csv", default="public/ultimate_combined_data.csv")
    parser.add_argument("--outdir", default="public/reports")
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)

    hist_df = load_csv(args.csv)
    pred_df = load_predictions(args.predictions)
    pred_df = detect_hotspots(pred_df)

    trend_img = os.path.join(args.outdir, f"week_{args.week}_trend.png")
    map_img = os.path.join(args.outdir, f"week_{args.week}_map.png")
    pdf_path = os.path.join(args.outdir, f"dengue_week_{args.week}_report.pdf")

    plot_weekly_trend(hist_df, args.week, trend_img)
    plot_hotspot_map(pred_df, map_img)
    build_pdf(args.week, pred_df, trend_img, map_img, pdf_path)

    print(f"Report generated: {pdf_path}")


if __name__ == "__main__":
    main()
