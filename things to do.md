# Co je potřeba opravit (fyzicky + software)

## 1. Vlhkostní senzor ukazuje pořád 100%

**Problém:** ADC na GPIO4 čte napětí blízké 0V (odpojený pin), formula to přepočte na >100% a ořízne na 100%.

**Co udělat:**

- Zkontroluj, že kapacitní senzor vlhkosti je **připojený k GPIO4**
- Senzor má 3 piny: **VCC → 3.3V**, **GND → GND**, **AOUT → GPIO4**
- Pokud je senzor zastrčený v zemi a je mokrá, vytáhni ho a zkontroluj, jestli se hodnota změní
- Pokud senzor není připojený vůbec, pin "plave" a čte ~0V → formula vrátí 100%

---

## 2. I2C LCD displej nefunguje

**Problém z logů:**

```
I2C Bus scan: Found no devices
lcd_pcf8574: Communication failed
display is marked FAILED
```

**Co udělat:**

- LCD displej (PCF8574) **není detekován na I2C sběrnici**
- Zkontroluj zapojení:
    - **SDA → GPIO8**
    - **SCL → GPIO9**
    - **VCC → 5V** (většina I2C LCD modulů potřebuje 5V, ne 3.3V)
    - **GND → GND**
- Zkontroluj, že I2C adresa je správná — zkus změnit `address: 0x3F` na `address: 0x27` (dvě nejčastější adresy)
- Zkontroluj, že máš **pull-up rezistory** na SDA a SCL (většina PCF8574 modulů je má na desce)

---

## 3. Serva nefungují

**Problém:** Serva na GPIO10 a GPIO11 se nehýbou.

**Co udělat:**

- Serva potřebují **externí napájení** — ESP32 GPIO nedá dost proudu
    - **Červený drát** serva → **5V z externího zdroje** (ne z ESP!)
    - **Hnědý/černý drát** → **GND** (společná zem s ESP)
    - **Oranžový/žlutý drát (signál)** → **GPIO10** (servo 1) / **GPIO11** (servo 2)
- GND serva a GND ESP32 **musí být propojené** (společná zem)
- Zkus v ESPHome zmáčknout tlačítko **"Test serva"** a sleduj, jestli se servo pohne
- Pokud se nehýbou, zkontroluj:
    - Je servo napájeno? (mělo by "držet" pozici i bez signálu)
    - Zkus jiný GPIO pin
    - Zkus servo připojit přímo na 5V a GND — mělo by se pohnout do střední pozice

---

## 4. React appka nedostává data z Home Assistantu

**Problém:** WebSocket se připojí, autentizace proběhne OK, ale pak se spojení zavře.

**Co zkontrolovat:**

1. Ověř, že ESP entita se zobrazuje v **Home Assistant → Nastavení → Zařízení a služby → ESPHome**
2. V HA otevři **Vývojářské nástroje → Stavy** a hledej entity:
    - `sensor.esp_sklenik_vlhkost_pudy`
    - `switch.esp_sklenik_okno`
    - `switch.esp_sklenik_cerpadlo`
    - `switch.esp_sklenik_svetlo`
3. Pokud entity neexistují, přidej ESP zařízení v HA integraci ESPHome
4. Zkus v prohlížeči otevřít **konzoli (F12 → Console)** a podívej se na chybové hlášky
5. Pokud appka běží na `localhost`, ale HA je na jiné IP, může být problém s **CORS** — zkus přidat do HA `configuration.yaml`:
    ```yaml
    http:
        cors_allowed_origins:
            - http://localhost:5173
            - http://localhost:3000
    ```
    a restartuj HA

---

## 5. Schéma zapojení (shrnutí)

| Komponenta                  | Pin ESP32-S3    | Napájení   |
| --------------------------- | --------------- | ---------- |
| Vlhkostní senzor AOUT       | GPIO4           | 3.3V + GND |
| Hladina vody (float switch) | GPIO15 (pullup) | —          |
| Servo 1 (okno) signál       | GPIO10          | 5V externí |
| Servo 2 (okno) signál       | GPIO11          | 5V externí |
| Čerpadlo (relé)             | GPIO17          | —          |
| Světlo LED                  | GPIO12          | —          |
| LED 1                       | GPIO13          | —          |
| LED 2                       | GPIO14          | —          |
| LED 3                       | GPIO38          | —          |
| LCD SDA                     | GPIO8           | 5V + GND   |
| LCD SCL                     | GPIO9           | —          |

**Důležité:** Všechny GND musí být propojené (společná zem).
