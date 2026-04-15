# Skleník 🌱

IoT projekt inteligentního skleníku postavený na kombinaci **ESP32 (ESPHome)** a **Raspberry Pi 5 (Home Assistant)**.  
Systém sbírá data ze senzorů a automaticky řídí zavlažování, větrání a osvětlení.

---

##  Architektura

### Elektrické zapojení
![Blokové schéma](schemes/Electric_scheme.png)

### Blokové schéma
![Elektrické zapojení](schemes/block_scheme.png)

---

##  Architektura systému

- **Frontend:** React (Dashboard)
- **Backend:** Raspberry Pi 5 (Home Assistant)
- **Mikrořadič:** ESP32 (ESPHome)
- **Komunikace:** WiFi

### Jak to funguje

- **ESPHome (na ESP32)**  
  - čte senzory  
  - ovládá čerpadla, serva, světla  
  - komunikuje přes WiFi  

- **Home Assistant (na Raspberry Pi)**  
  - centrální logika systému  
  - automatizace (scénáře)  
  - API pro dashboard  

- **React Dashboard**  
  - zobrazení dat  
  - manuální ovládání  

---

##  Integrace

- Zavlažování (čerpadla)
- Senzory vlhkosti půdy
- Senzor vlhkosti vzduchu
- Teplota vzduchu
- Ovládání oken (serva)
- LED osvětlení
- Měření hladiny vody

---

##  Scénáře

| Situace | Akce |
|--------|------|
| Moc vedro | Otevřít okna |
| Nízká vlhkost půdy | Spustit zavlažování |
| Noc | Ztlumit světlo |
| Málo vody v nádrži | Upozornění + blokace zalévání |

---

##  Komponenty a spotřeba

| Komponenta | Napětí | Proud | Poznámka |
|-----------|--------|--------|---------|
| ESP32 | 5V | ~200 mA | WiFi + řízení |
| Raspberry Pi 5 (4GB) | 5V | 2–3 A | Home Assistant |
| LCD displej | 5V | ~100 mA | |
| Teploměr | 5V | ~5 mA | |
| Vlhkoměry (4x) | 5V | ~24 mA | ~6 mA/ks |
| Měřič hladiny vody | 5V | ~100 mA | odhad |
| Čerpadla (2x) | 12V | ~1400 mA | 700 mA/ks |
| Servo (1x) | 5–6V | ~500 mA | špička |
| Serva (2x) | 5–6V | ~1000 mA | 500mA/ks |
| LED světla (4x) | 12V | ~80 mA | ~20 mA/ks |
| LED pásek | 12V | ~1–2 A | dle typu |

---

##  Napájení

- **12V externí zdroj (doporučeno min. 5A)**
- Step-down měnič:
  - 12V → 5V (ESP32, senzory)

### Doporučení
- oddělit napájení:
  - logika (ESP32)
  - výkon (čerpadla, LED)

---

##  GPIO (ESP32)

| Funkce | GPIO |
|--------|------|
| Vlhkoměry | 4, 5, 6, 7 |
| Teploměr | 1 |
| LCD | sda 8, scl 9 |
| Čerpadla | USB? |
| Serva | 8, 9 |
| LED pásek | 10 |
| LED světla | 12, 13, 14, 38 |
| Hladina vody | 15 |

---

##  Komunikace

- ESP32 komunikuje přes **ESPHome API**
- Home Assistant funguje jako **centrální mozek**
- Dashboard komunikuje přes HTTP/API

---



## 📌 Poznámky

- ESP32 řeší real-time řízení hardware
- Home Assistant řeší logiku a automatizace

---
