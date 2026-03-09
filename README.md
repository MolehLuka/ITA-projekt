# Sistem za rezervacijo športnih objektov

Spletna aplikacija, zgrajena na osnovi mikrostoritev, ki članom telovadnice omogoča pregled in rezervacijo športnih objektov.

---

## Namen sistema

Sistem omogoča članom telovadnice, da pregledajo razpoložljive objekte in rezervirajo termin, osebju telovadnice pa, da upravlja urnik objektov. Sestavljen je iz treh neodvisnih mikrostoritev, ki komunicirajo prek REST API-jev in sporočilnega posrednika RabbitMQ.

---

## Uporabniki in pričakovanja

| Uporabnik | Pričakovanja |
|-----------|-------------|
| **Član telovadnice** | Registracija/prijava, pregled razpoložljivih objektov, rezervacija termina, odpoved rezervacije |
| **Osebje / Administrator** | Dodajanje in urejanje objektov, upravljanje razpoložljivosti, pregled vseh rezervacij |

---

## Glavne domene in odgovornosti

Sistem je razdeljen na tri poslovne enote, vsaka z jasno določenimi odgovornostmi:

### Članstvo (members service)
Pokriva vse, kar je povezano z identiteto in statusom člana v sistemu.

- Registracija in prijava članov
- Upravljanje osebnih podatkov
- Preverjanje veljavnosti članstva
- Avtentikacija in avtorizacija

### Upravljanje objektov (facilities service)
Pokriva vse, kar je povezano s fizičnimi prostori in njihovo razpoložljivostjo.

- Evidenca športnih objektov (igrišča, dvorane, oprema)
- Upravljanje urnikov in terminov
- Posodabljanje razpoložljivosti po rezervacijah
- Dodajanje in urejanje objektov s strani osebja

### Rezervacije (bookings service)
Pokriva celoten proces rezerviranja termina — od povpraševanja do potrditve ali odpovedi.

- Ustvarjanje rezervacije za izbran objekt in termin
- Preverjanje prekrivanja terminov
- Odpoved rezervacije
- Pregled zgodovine rezervacij člana

---

## Mikrostoritve

### 1. Storitev za člane
Skrbi za registracijo, prijavo in upravljanje profilov članov.

| Metoda | Endpoint | Opis |
|--------|-----|------|
| POST | `/members/register` | Registracija novega člana |
| POST | `/members/login` | Prijava in pridobitev JWT žetona |
| GET | `/members/:id` | Pridobitev profila člana |

### 2. Storitev za objekte
Upravlja športne objekte in njihove razpoložljive termine.

| Metoda | Endpoint | Opis |
|--------|-----|------|
| GET | `/facilities` | Seznam vseh objektov |
| POST | `/facilities` | Dodajanje novega objekta (admin) |
| GET | `/facilities/:id/slots` | Razpoložljivi termini za posamezen objekt |

### 3. Storitev za rezervacije
Skrbi za ustvarjanje, pridobivanje in odpoved rezervacij.

| Metoda | Endpoint | Opis |
|--------|-----|------|
| POST | `/bookings` | Ustvarjanje nove rezervacije |
| GET | `/bookings/:memberId` | Vse rezervacije določenega člana |
| DELETE | `/bookings/:id` | Odpoved rezervacije |

---

## Komunikacija med storitvami

- **Sinhrono (REST):** Odjemalec komunicira z vsako storitvijo prek API Gateway-a.
- **Asinhrono (RabbitMQ):** Ko je rezervacija ustvarjena ali odpovedana, storitev za rezervacije objavi dogodek. Storitev za objekte ga posluša in posodobi razpoložljivost termina — brez neposrednega klicanja med storitvama.

---

## Arhitekturni diagram

![Arhitekturni diagram](./docs/diagram.png)

---