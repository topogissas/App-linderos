from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP


class NumerosMixin:
    # -------------------------
    # Normalización de números
    # -------------------------
    def _parse_decimal_mixto(self, valor) -> Decimal:
        """Convierte cadenas numéricas con diferentes formatos a Decimal.

        Soporta de forma tolerante:
        - 6188
        - 6.188 (miles con punto)
        - 6,188 (miles con coma)
        - 6.188,25 (miles '.' y decimales ',')
        - 6,188.25 (miles ',' y decimales '.')
        """
        if valor is None:
            return Decimal('0')

        if isinstance(valor, (int, float, Decimal)):
            try:
                return Decimal(str(valor))
            except Exception:
                return Decimal('0')

        s = str(valor).strip().replace(' ', '').replace("'", '')
        if not s:
            return Decimal('0')

        # Si hay ambos separadores, se asume decimal el último que aparezca.
        if '.' in s and ',' in s:
            if s.rfind(',') > s.rfind('.'):
                # decimal ',' -> quitar miles '.'
                s = s.replace('.', '')
                s = s.replace(',', '.')
            else:
                # decimal '.' -> quitar miles ','
                s = s.replace(',', '')

        # Solo coma
        elif ',' in s:
            # múltiples comas => miles
            if s.count(',') > 1:
                s = s.replace(',', '')
            else:
                entero, dec = s.split(',') if ',' in s else (s, '')
                # si tiene exactamente 3 dígitos a la derecha, suele ser separador de miles
                if dec.isdigit() and len(dec) == 3 and entero.replace('-', '').isdigit():
                    s = entero + dec
                else:
                    s = s.replace(',', '.')

        # Solo punto
        elif '.' in s:
            # múltiples puntos => miles
            if s.count('.') > 1:
                s = s.replace('.', '')
            else:
                entero, dec = s.split('.') if '.' in s else (s, '')
                if dec.isdigit() and len(dec) == 3 and entero.replace('-', '').isdigit():
                    # probable miles
                    s = entero + dec
                # si no, se deja como decimal '.'

        try:
            return Decimal(s)
        except Exception:
            # Último recurso: quitar todo lo no numérico excepto signo y punto
            import re
            s2 = re.sub(r'[^0-9\-\.]', '', s)
            try:
                return Decimal(s2) if s2 else Decimal('0')
            except Exception:
                return Decimal('0')


    def _formato_num_es(self, valor: Decimal, decimales: int | None = None) -> str:
        """Formatea número con miles '.' y decimales ','.

        - Si decimales=None: muestra sin decimales si es entero; si no, 2 dec.
        """
        try:
            v = Decimal(valor)
        except Exception:
            v = Decimal('0')

        if decimales is None:
            if v == v.to_integral_value():
                decimales = 0
            else:
                decimales = 2

        q = Decimal('1') if decimales == 0 else Decimal('1.' + ('0' * decimales))
        vq = v.quantize(q, rounding=ROUND_HALF_UP)

        # Separación manual (sin depender de locale)
        sign = '-' if vq < 0 else ''
        vq_abs = abs(vq)
        entero = int(vq_abs)
        frac = vq_abs - Decimal(entero)

        entero_txt = f"{entero:,}".replace(',', '.')

        if decimales == 0:
            return f"{sign}{entero_txt}"

        frac_txt = f"{frac:.{decimales}f}".split('.')[1]
        return f"{sign}{entero_txt},{frac_txt}"

    def convertir_numero_a_texto(self, numero):
        """Convierte un número (entero o decimal) a texto en español (MAYÚSCULAS).

        - Soporta hasta 9.999.999,99 (dos decimales).
        - Para decimales devuelve: "<ENTERO> CON <DECIMALES>" (decimales como centésimas).
        """
        try:
            # Normalizar entrada (acepta miles/decimales mixtos)
            n = float(self._parse_decimal_mixto(numero))

            # Redondear a 2 decimales
            n = round(n, 2)
            entero = int(abs(n))
            dec = int(round((abs(n) - entero) * 100))

            texto_entero = self._numero_entero_a_texto(entero)

            if dec > 0:
                texto_dec = self._numero_entero_a_texto(dec)
                resultado = f"{texto_entero} CON {texto_dec}"
            else:
                resultado = texto_entero

            if n < 0:
                resultado = f"MENOS {resultado}"

            return resultado.strip()
        except Exception:
            # Fallback seguro
            return str(numero).strip().upper()

    def _numero_entero_a_texto(self, n: int) -> str:
        """Convierte un entero 0..9.999.999 a texto."""
        if n == 0:
            return "CERO"
        if n < 0:
            return f"MENOS {self._numero_entero_a_texto(-n)}"

        unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"]
        especiales = {
            10: "DIEZ", 11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
            16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
            20: "VEINTE", 21: "VEINTIÚN", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 24: "VEINTICUATRO",
            25: "VEINTICINCO", 26: "VEINTISÉIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE",
        }
        decenas = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"]
        centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS",
                   "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"]

        def _menos_de_mil(x: int) -> str:
            if x == 0:
                return ""
            if x == 100:
                return "CIEN"
            c = x // 100
            r = x % 100
            partes = []
            if c:
                partes.append(centenas[c])
            if r:
                if r in especiales:
                    partes.append(especiales[r])
                else:
                    d = r // 10
                    u = r % 10
                    if d == 0:
                        partes.append(unidades[u])
                    elif d == 2:
                        partes.append("VEINTE" if u == 0 else f"VEINTI{unidades[u].lower()}".upper())
                    else:
                        if u == 0:
                            partes.append(decenas[d])
                        else:
                            partes.append(f"{decenas[d]} Y {unidades[u]}")
            return " ".join([p for p in partes if p]).strip()

        if n < 1000:
            return _menos_de_mil(n)

        if n < 1_000_000:
            miles = n // 1000
            resto = n % 1000
            if miles == 1:
                pref = "MIL"
            else:
                pref = f"{_menos_de_mil(miles)} MIL"
            suf = _menos_de_mil(resto)
            return f"{pref} {suf}".strip()

        if n <= 9_999_999:
            millones = n // 1_000_000
            resto = n % 1_000_000
            if millones == 1:
                pref = "UN MILLÓN"
            else:
                pref = f"{_menos_de_mil(millones)} MILLONES"
            suf = self._numero_entero_a_texto(resto) if resto else ""
            return f"{pref} {suf}".strip()

        # Fuera de rango esperado
        return str(n)

    def convertir_area_a_texto_completo(self, area_str):
        """Convierte un área (en m²) a texto, usando hectáreas, m² y/o cm².

        Ejemplos:
        - 6188 -> "SEIS MIL CIENTO OCHENTA Y OCHO METROS CUADRADOS (Área = 6.188 m²)"
        - 25000 -> "DOS HECTÁREAS CON CINCO MIL METROS CUADRADOS (Área = 25.000 m²)"
        - 0,5 -> "CINCO MIL CENTÍMETROS CUADRADOS (Área = 0,50 m²)"
        """
        try:
            texto, area_fmt = self.area_a_componentes(area_str)
            return f"{texto} (Área = {area_fmt} m²)"
        except Exception:
            return f"{area_str} METROS CUADRADOS"


    def area_a_componentes(self, area_str):
        """Devuelve (texto_en_letras, area_formateada) para un área en m²."""
        area = self._parse_decimal_mixto(area_str)
        # Conservar hasta 4 decimales de m² (1 cm² = 0.0001 m²)
        area = area.quantize(Decimal('1.0000'), rounding=ROUND_HALF_UP)

        if area < 0:
            area = abs(area)

        # Partes
        ha = int(area // Decimal('10000'))
        resto_m2 = area - Decimal(ha) * Decimal('10000')

        m2_entero = int(resto_m2 // Decimal('1'))
        frac_m2 = resto_m2 - Decimal(m2_entero)
        # cm² redondeado
        cm2 = int((frac_m2 * Decimal('10000')).quantize(Decimal('1'), rounding=ROUND_HALF_UP))

        partes = []

        if ha > 0:
            if ha == 1:
                partes.append("UNA HECTÁREA")
            else:
                partes.append(f"{self._numero_entero_a_texto(ha)} HECTÁREAS")

        if m2_entero > 0 or (ha == 0 and cm2 == 0):
            if m2_entero == 1:
                partes.append("UN METRO CUADRADO")
            else:
                partes.append(f"{self._numero_entero_a_texto(m2_entero)} METROS CUADRADOS")

        if cm2 > 0:
            if cm2 == 1:
                cm_txt = "UN CENTÍMETRO CUADRADO"
            else:
                cm_txt = f"{self._numero_entero_a_texto(cm2)} CENTÍMETROS CUADRADOS"

            if partes:
                partes.append(f"CON {cm_txt}")
            else:
                partes.append(cm_txt)

        if ha > 0 and len(partes) >= 2 and "HECT" in partes[0] and not partes[1].startswith("CON "):
            partes[1] = f"CON {partes[1]}"

        texto = " ".join([p for p in partes if p]).strip()
        area_fmt = self._formato_num_es(area, None)
        return texto, area_fmt
