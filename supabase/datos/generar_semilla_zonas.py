#!/usr/bin/env python3
"""
Script para generar la migración SQL de semilla de zonas a partir del CSV de Georef.

Uso:
    python3 supabase/datos/generar_semilla_zonas.py
    python3 supabase/datos/generar_semilla_zonas.py --csv ruta/a/zonas.csv --out ruta/a/migracion.sql
"""

import argparse
import csv
from pathlib import Path

DEFAULT_CSV = Path(__file__).resolve().parent / "zonas-georef.csv"
DEFAULT_OUT = Path(__file__).resolve().parent.parent / "migrations" / "20260909192000_semilla_zonas_georef.sql"


def escape_sql_str(val: str | None) -> str:
    """Escapa cadenas de texto para SQL y convierte strings vacíos en NULL."""
    if not val:
        return "NULL"
    # Escapar comillas simples duplicándolas (ej: O'Higgins -> 'O''Higgins')
    escaped = val.replace("'", "''")
    return f"'{escaped}'"


def generar_sql(csv_path: Path, out_path: Path):
    if not csv_path.exists():
        raise FileNotFoundError(f"No se encontró el archivo CSV en: {csv_path}")

    print(f"Leyendo CSV desde: {csv_path}")
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    total_filas = len(rows)
    amba_filas = sum(1 for r in rows if r.get("region") == "AMBA")
    activas_filas = sum(1 for r in rows if r.get("activa", "").lower() == "true")

    print(f"Total de registros leídos: {total_filas}")
    print(f"Registros AMBA: {amba_filas}")
    print(f"Registros activos: {activas_filas}")

    lines = [
        "-- ============================================================",
        "-- MIGRACIÓN: Semilla de zonas desde Georef (criterio AMBA)",
        f"-- Generado automáticamente a partir de {csv_path.name}",
        f"-- Total de filas: {total_filas}",
        "-- ============================================================",
        "",
        "-- Las filas de muestra se van enteras: nadie las referencia todavía.",
        "DELETE FROM public.zonas;",
        "ALTER SEQUENCE zonas_id_seq RESTART WITH 1;",
        "",
        "INSERT INTO public.zonas (region, partido, localidad, id_indec, activa) VALUES",
    ]

    values_list = []
    for r in rows:
        region = escape_sql_str(r.get("region"))
        partido = escape_sql_str(r.get("partido"))
        localidad = escape_sql_str(r.get("localidad"))
        id_indec = escape_sql_str(r.get("id_indec"))
        activa = "true" if r.get("activa", "").lower() == "true" else "false"

        values_list.append(f"  ({region}, {partido}, {localidad}, {id_indec}, {activa})")

    lines.append(",\n".join(values_list) + ";")
    lines.append("")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, mode="w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"✅ Migración generada exitosamente en: {out_path} ({out_path.stat().st_size:,} bytes)")


def main():
    parser = argparse.ArgumentParser(description="Convierte el CSV de zonas Georef en una migración SQL de Supabase.")
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV, help="Ruta al archivo CSV de zonas")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="Ruta de destino del archivo SQL de migración")
    args = parser.parse_args()

    generar_sql(args.csv, args.out)


if __name__ == "__main__":
    main()
